import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { parseBrief } from "./brief.js";
import { escapeHtml, sanitizeIdentifier, writeTextAtomic } from "./files.js";
import { intakeReference, type IntakeRequest } from "./quarantine.js";

interface TextDraftRequest {
  title: string;
  content: string;
  role: "prompt-draft" | "copy-context";
  draftType: "image" | "video" | "copy";
  provenance: string;
  license?: string;
}

function referenceForm(): string {
  return `<section class="panel"><h2>Reference files</h2><p>Attach images, audio, video, PDF, Markdown, or text. Files stay quarantined until approved for model use or provider egress.</p>
<label class="drop" for="references">Drop or choose files<input id="references" type="file" multiple></label>
<div class="grid"><label for="role">Reference role<select id="role"><option>style</option><option>identity</option><option>composition</option><option>palette</option><option>subject</option><option>copy-context</option><option>prompt-draft</option><option>source-media</option></select></label>
<label for="provenance">Provenance / license note<input id="provenance" value="User supplied" required></label></div>
<div id="upload-state" aria-live="polite"></div></section>`;
}

function draftForm(): string {
  return `<section class="panel"><h2>Prompt and copy drafts</h2><p>Type draft prompts or copy context here. They are saved as quarantined Markdown references for Codex to review and improve later.</p>
<div class="grid"><label for="draft-type">Draft type<select id="draft-type"><option value="image">Image prompt draft</option><option value="video">Video prompt draft</option><option value="copy">Copywriting / script context</option></select></label>
<label for="draft-title">Draft title<input id="draft-title" placeholder="Scene 03 image prompt"></label></div>
<label for="draft-content">Draft content</label><textarea id="draft-content" class="short" spellcheck="true" placeholder="Paste or type draft prompts, visual directions, copy notes, script fragments, negative prompts, continuity rules, or provider-specific ideas."></textarea>
<button id="save-draft" type="button">Save draft reference</button><span id="draft-state" aria-live="polite"></span></section>`;
}

function page(markdown: string, editable: boolean): string {
  const brief = parseBrief(markdown);
  const warning = brief.missingDecisions.length
    ? `<div class="warning"><strong>Missing decisions</strong><br>${brief.missingDecisions.map(escapeHtml).join(" · ")}</div>`
    : `<div class="ready"><strong>Brief is decision-complete.</strong> Codex can propose the execution manifest.</div>`;
  const editor = editable
    ? `<form id="brief-form" class="panel"><label for="brief">Production brief</label><textarea id="brief" spellcheck="true">${escapeHtml(markdown)}</textarea><button type="submit">Save brief</button><span id="save-state" aria-live="polite"></span></form>${referenceForm()}${draftForm()}`
    : `<section><h2>Brief source</h2><pre>${escapeHtml(markdown)}</pre></section>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(brief.title)} — Production Brief</title><style>
@font-face{font-family:Newsreader;src:local("Newsreader")}*{box-sizing:border-box}body{margin:0;background:#24202A;color:#24202A;font-family:system-ui,-apple-system,sans-serif}main{width:min(1180px,calc(100% - 40px));margin:40px auto;background:#EEE6D8;min-height:calc(100vh - 80px);padding:clamp(28px,6vw,84px);box-shadow:0 30px 80px #0008;border-top:10px solid #A6793B}h1,h2{font-family:Newsreader,Georgia,serif;font-weight:520}h1{font-size:clamp(42px,7vw,90px);line-height:.95;margin:12px 0 36px}h2{font-size:32px}.eyebrow{color:#A6793B;text-transform:uppercase;letter-spacing:.15em;font-weight:700}.summary{font-size:24px;line-height:1.45;color:#5F5363;max-width:820px}.warning,.ready{padding:20px 24px;margin:32px 0;border-left:6px solid #A6793B;background:#D8CBB8}.ready{border-color:#4e7557}.panel{margin:34px 0;padding:28px;background:#efe3d2;border:1px solid #A6793B55}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px}label{display:block;font-weight:700;margin:18px 0 8px}textarea{width:100%;min-height:580px;padding:22px;background:#fffaf2;border:1px solid #A6793B;font:16px/1.5 ui-monospace,monospace}.short{min-height:230px}button{margin-top:16px;background:#24202A;color:#EEE6D8;border:0;padding:14px 22px;font-weight:700;cursor:pointer}.drop{display:block;padding:32px;border:2px dashed #A6793B;background:#fff8ed}.drop input{display:block;margin-top:14px}select,input{padding:12px;width:100%;border:1px solid #A6793B;background:#fffaf2}pre{white-space:pre-wrap;background:#fff8ed;padding:24px;overflow:auto}
</style></head><body><main><div class="eyebrow">YouTube Video Factory · production brief</div><h1>${escapeHtml(brief.title)}</h1><p class="summary">${escapeHtml(brief.summary || "Complete the brief below so Codex can compile a deterministic video plan.")}</p>${warning}${editor}</main>${editable ? `<script>
const status=document.querySelector("#save-state");document.querySelector("#brief-form").addEventListener("submit",async(event)=>{event.preventDefault();status.textContent="Saving…";const response=await fetch("/api/brief",{method:"PUT",headers:{"content-type":"text/plain"},body:document.querySelector("#brief").value});status.textContent=response.ok?"Saved. Refresh to update decision checks.":await response.text()});
document.querySelector("#references").addEventListener("change",async(event)=>{const files=[...event.target.files];const output=document.querySelector("#upload-state");output.textContent="Processing locally…";for(const file of files){const base64=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(",")[1]);reader.onerror=reject;reader.readAsDataURL(file)});const response=await fetch("/api/references",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:file.name,contentBase64:base64,role:document.querySelector("#role").value,provenance:document.querySelector("#provenance").value})});if(!response.ok){output.textContent=await response.text();return}}output.textContent=files.length+" reference(s) quarantined."});
document.querySelector("#save-draft").addEventListener("click",async()=>{const state=document.querySelector("#draft-state");state.textContent="Saving draft…";const response=await fetch("/api/text-reference",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({title:document.querySelector("#draft-title").value,content:document.querySelector("#draft-content").value,draftType:document.querySelector("#draft-type").value,role:document.querySelector("#draft-type").value==="copy"?"copy-context":"prompt-draft",provenance:document.querySelector("#provenance").value})});state.textContent=response.ok?"Draft saved as quarantined reference.":await response.text();if(response.ok)document.querySelector("#draft-content").value=""});
</script>` : ""}</body></html>`;
}

async function intakeTextDraft(projectDirectory: string, request: TextDraftRequest) {
  const content = request.content.trim();
  if (content.length < 4) throw new Error("Draft content is too short.");
  if (Buffer.byteLength(content) > 256 * 1024) throw new Error("Draft content exceeds 256 KB.");
  const title = sanitizeIdentifier(request.title || `${request.draftType}-draft`) || `${request.draftType}-draft`;
  const markdown = `# ${request.title || request.draftType + " draft"}\n\nRole: ${request.role}\nDraft type: ${request.draftType}\n\n${content}\n`;
  return intakeReference(projectDirectory, {
    name: `${title}.md`,
    contentBase64: Buffer.from(markdown).toString("base64"),
    role: request.role,
    provenance: request.provenance || "User typed in PRODUCTION_BRIEF.html",
    ...(request.license ? { license: request.license } : {}),
  });
}

export async function writePortableBrief(projectDirectory: string): Promise<string> {
  const markdown = await readFile(join(projectDirectory, "PRODUCTION_BRIEF.md"), "utf8");
  const destination = join(projectDirectory, "PRODUCTION_BRIEF.html");
  await writeTextAtomic(destination, page(markdown, false));
  return destination;
}

export async function serveBriefEditor(
  projectDirectoryInput: string,
  port = 4178,
): Promise<{ url: string; close: () => Promise<void> }> {
  const projectDirectory = resolve(projectDirectoryInput);
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);
      if (request.method === "GET" && url.pathname === "/") {
        const markdown = await readFile(join(projectDirectory, "PRODUCTION_BRIEF.md"), "utf8");
        response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
        response.end(page(markdown, true));
        return;
      }
      if (request.method === "PUT" && url.pathname === "/api/brief") {
        let body = "";
        for await (const chunk of request) body += String(chunk);
        if (Buffer.byteLength(body) > 2 * 1024 * 1024) throw new Error("Brief exceeds 2 MB.");
        parseBrief(body);
        await writeTextAtomic(join(projectDirectory, "PRODUCTION_BRIEF.md"), body);
        await writePortableBrief(projectDirectory);
        response.writeHead(204).end();
        return;
      }
      if (request.method === "POST" && url.pathname === "/api/references") {
        let body = "";
        for await (const chunk of request) body += String(chunk);
        if (Buffer.byteLength(body) > 36 * 1024 * 1024) throw new Error("Upload request exceeds the intake limit.");
        const record = await intakeReference(projectDirectory, JSON.parse(body) as IntakeRequest);
        response.writeHead(201, { "content-type": "application/json" }).end(JSON.stringify({ id: record.id, trust: record.trust }));
        return;
      }
      if (request.method === "POST" && url.pathname === "/api/text-reference") {
        let body = "";
        for await (const chunk of request) body += String(chunk);
        if (Buffer.byteLength(body) > 384 * 1024) throw new Error("Draft request exceeds the intake limit.");
        const record = await intakeTextDraft(projectDirectory, JSON.parse(body) as TextDraftRequest);
        response.writeHead(201, { "content-type": "application/json" }).end(JSON.stringify({ id: record.id, role: record.role, trust: record.trust }));
        return;
      }
      response.writeHead(404).end("Not found");
    } catch (error) {
      response.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
      response.end(error instanceof Error ? error.message : "Request failed.");
    }
  });
  await new Promise<void>((resolvePromise, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolvePromise);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Brief editor did not receive a local TCP address.");
  const url = `http://127.0.0.1:${address.port}/`;
  return {
    url,
    close: () => new Promise((resolvePromise, reject) => server.close((error) => error ? reject(error) : resolvePromise())),
  };
}
