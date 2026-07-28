import { copyFile, mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Frame, ProductionManifest, SceneManifest } from "../types.js";
import { getLayout } from "../design/registry.js";
import { assertContained, escapeAttribute, escapeHtml, sha256, writeJsonAtomic, writeTextAtomic } from "../core/files.js";

const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const transitionOverlap = 0.6;

function hfId(value: string): string {
  return `hf-${sha256(value).slice(0, 8)}`;
}

function frameCss(frame: Frame): string {
  return `left:${frame.x}px;top:${frame.y}px;width:${frame.width}px;height:${frame.height}px`;
}

function firstFrame(scene: SceneManifest): Frame {
  const layout = getLayout(scene.layout);
  const preferred = layout.media?.[0]?.frame;
  return (preferred && layout.frames[preferred])
    || layout.frames.canvas
    || layout.frames.chart
    || layout.frames.matrix
    || layout.frames.presenter
    || { x: 80, y: 130, width: 1120, height: 820 };
}

function textFrame(scene: SceneManifest): Frame {
  const frames = getLayout(scene.layout).frames;
  return frames.title || frames.text || frames.quote || {
    x: firstFrame(scene).x < 700 ? 1300 : 110,
    y: 210,
    width: firstFrame(scene).x < 700 ? 540 : 1120,
    height: 520,
  };
}

async function copyAsset(
  projectDirectory: string,
  buildDirectory: string,
  projectRelativePath: string,
): Promise<string> {
  const source = assertContained(projectDirectory, join(projectDirectory, projectRelativePath));
  if (!existsSync(source)) throw new Error(`Composition asset is missing: ${projectRelativePath}`);
  const extension = extname(projectRelativePath).toLowerCase();
  const name = `${sha256(await readFile(source)).slice(0, 16)}${extension}`;
  const destination = join(buildDirectory, "media", name);
  await mkdir(dirname(destination), { recursive: true });
  if (!existsSync(destination)) await copyFile(source, destination);
  return `media/${name}`;
}

function mediaElement(
  scene: SceneManifest,
  source: string,
  frame: Frame,
  sceneStart: number,
): string {
  const id = `scene-${scene.id}-media`;
  const style = frameCss(frame);
  const duration = scene.durationSeconds;
  const fit = scene.primaryVisual?.fit ?? "contain";
  const extension = extname(source).toLowerCase();
  if ([".mp4", ".webm", ".mov", ".m4v"].includes(extension)) {
    return `<video data-hf-id="${hfId(id)}" id="${id}" class="clip scene-media" style="${style};object-fit:${fit}" src="${escapeAttribute(source)}" muted playsinline preload="auto" data-start="${sceneStart}" data-duration="${duration}" data-track-index="4"></video>`;
  }
  return `<img data-hf-id="${hfId(id)}" id="${id}" class="scene-media" style="${style};object-fit:${fit}" src="${escapeAttribute(source)}" alt="">`;
}

function captionElements(scene: SceneManifest, sceneStart: number, frame: Frame): string {
  return (scene.captions ?? []).map((caption, index) => {
    const start = sceneStart + caption.start;
    const duration = Math.max(0.05, caption.end - caption.start);
    const id = `scene-${scene.id}-caption-${index + 1}`;
    return `<div data-hf-id="${hfId(id)}" id="${id}" class="clip scene-caption" style="${frameCss(frame)}" data-start="${start}" data-duration="${duration}" data-track-index="20">${escapeHtml(caption.text)}</div>`;
  }).join("\n");
}

export interface CompileResult {
  directory: string;
  compositionPath: string;
  durationSeconds: number;
  sceneStarts: number[];
}

export async function compileHyperFrames(
  projectDirectoryInput: string,
  manifest: ProductionManifest,
): Promise<CompileResult> {
  const projectDirectory = resolve(projectDirectoryInput);
  const buildDirectory = join(projectDirectory, "build/hyperframes");
  await mkdir(buildDirectory, { recursive: true });
  await mkdir(join(buildDirectory, "assets/vendor"), { recursive: true });
  await mkdir(join(buildDirectory, "assets/fonts"), { recursive: true });
  await Promise.all([
    copyFile(join(sourceRoot, "assets/vendor/gsap/gsap.min.js"), join(buildDirectory, "assets/vendor/gsap.min.js")),
    copyFile(join(sourceRoot, "assets/fonts/newsreader/newsreader-latin-wght-normal.woff2"), join(buildDirectory, "assets/fonts/newsreader.woff2")),
    copyFile(join(sourceRoot, "assets/fonts/ibm-plex-sans/ibm-plex-sans-latin-wght-normal.woff2"), join(buildDirectory, "assets/fonts/ibm-plex-sans.woff2")),
    copyFile(join(sourceRoot, "assets/fonts/ibm-plex-serif/ibm-plex-serif-latin-400-normal.woff2"), join(buildDirectory, "assets/fonts/ibm-plex-serif.woff2")),
    copyFile(join(sourceRoot, "assets/fonts/ibm-plex-mono/ibm-plex-mono-latin-400-normal.woff2"), join(buildDirectory, "assets/fonts/ibm-plex-mono.woff2")),
  ]);

  const palette = manifest.design.palette;
  const typography = manifest.design.typography;
  const starts: number[] = [];
  let cursor = 0;
  manifest.scenes.forEach((scene, index) => {
    starts.push(Number(cursor.toFixed(6)));
    cursor += scene.durationSeconds;
    if (index < manifest.scenes.length - 1) cursor -= Math.min(transitionOverlap, scene.durationSeconds / 4);
  });
  const totalDuration = Number(cursor.toFixed(6));

  const sceneHtml: string[] = [];
  const audioHtml: string[] = [];
  const captionsHtml: string[] = [];
  const timelineStatements: string[] = [];

  for (const [index, scene] of manifest.scenes.entries()) {
    const start = starts[index] ?? 0;
    const mediaFrame = firstFrame(scene);
    const copyFrame = textFrame(scene);
    let media = "";
    if (scene.primaryVisual?.asset) {
      const copied = await copyAsset(projectDirectory, buildDirectory, scene.primaryVisual.asset);
      media = mediaElement(scene, copied, mediaFrame, start);
    }
    const layoutMedia = getLayout(scene.layout).media ?? [];
    for (const [supportIndex, visual] of (scene.supportingVisuals ?? []).entries()) {
      const mediaDefinition = layoutMedia[supportIndex + 1];
      const targetFrame = mediaDefinition ? getLayout(scene.layout).frames[mediaDefinition.frame] : undefined;
      if (!targetFrame) throw new Error(`Layout ${scene.layout} has no media slot ${supportIndex + 2}.`);
      const copied = await copyAsset(projectDirectory, buildDirectory, visual.asset);
      media += mediaElement(
        { ...scene, id: `${scene.id}-support-${supportIndex + 1}`, primaryVisual: visual },
        copied,
        targetFrame,
        start,
      );
    }
    let presenter = "";
    if (scene.presenter?.asset) {
      const copied = await copyAsset(projectDirectory, buildDirectory, scene.presenter.asset);
      const presenterFrame = getLayout(scene.layout).frames.presenter ?? { x: 1480, y: 650, width: 400, height: 400 };
      presenter = mediaElement({ ...scene, id: `${scene.id}-presenter`, primaryVisual: { asset: copied, fit: "contain" } }, copied, presenterFrame, start);
    }
    if (scene.narration?.asset) {
      const copied = await copyAsset(projectDirectory, buildDirectory, scene.narration.asset);
      const id = `scene-${scene.id}-audio`;
      audioHtml.push(`<audio data-hf-id="${hfId(id)}" id="${id}" class="clip" src="${escapeAttribute(copied)}" preload="auto" data-start="${start}" data-duration="${scene.durationSeconds}" data-track-index="10" data-volume="1"></audio>`);
    }
    const captionFrame: Frame = {
      x: copyFrame.x,
      y: Math.min(copyFrame.y + Math.max(270, copyFrame.height - 150), 885),
      width: copyFrame.width,
      height: 130,
    };
    captionsHtml.push(captionElements(scene, start, captionFrame));
    const sectionId = `scene-${scene.id}`;
    sceneHtml.push(`<section data-hf-id="${hfId(sectionId)}" id="${sectionId}" class="clip scene-clip" data-start="${start}" data-duration="${scene.durationSeconds}" data-track-index="${index + 1}">
  <div data-hf-id="${hfId(`${sectionId}-inner`)}" id="${sectionId}-inner" class="scene-inner">
    <div data-hf-id="${hfId(`${sectionId}-rule`)}" class="top-rule"></div>
    ${media}
    ${presenter}
    <div data-hf-id="${hfId(`${sectionId}-folio`)}" class="folio" style="${frameCss({ x: copyFrame.x, y: 54, width: copyFrame.width, height: 40 })}">Scene ${String(index + 1).padStart(2, "0")} · ${escapeHtml(scene.layout)}</div>
    <h1 data-hf-id="${hfId(`${sectionId}-title`)}" id="${sectionId}-title" class="headline" style="${frameCss(copyFrame)}">${escapeHtml(scene.title)}</h1>
    <p data-hf-id="${hfId(`${sectionId}-purpose`)}" id="${sectionId}-purpose" class="purpose" style="${frameCss({ ...copyFrame, y: copyFrame.y + Math.min(copyFrame.height * 0.48, 250), height: Math.max(120, copyFrame.height * 0.45) })}">${escapeHtml(scene.purpose)}</p>
  </div>
</section>`);
    timelineStatements.push(`timeline.fromTo("#${sectionId}-inner",{opacity:0,x:${index === 0 ? 0 : 80}},{opacity:1,x:0,duration:0.55,ease:"power2.out"},${start.toFixed(6)});`);
    timelineStatements.push(`timeline.fromTo("#${sectionId}-title",{opacity:0,y:32},{opacity:1,y:0,duration:0.52,ease:"power3.out"},${(start + 0.14).toFixed(6)});`);
    if (index < manifest.scenes.length - 1) {
      const exitAt = Math.max(start, start + scene.durationSeconds - transitionOverlap);
      timelineStatements.push(`timeline.to("#${sectionId}-inner",{opacity:0,x:-60,duration:${transitionOverlap},ease:"power2.inOut"},${exitAt.toFixed(6)});`);
    }
  }

  const compositionId = `ytvf-${manifest.id}`;
  const dipStart = Math.max(0, totalDuration - 0.6);
  timelineStatements.push(`timeline.to("#final-dip",{opacity:1,duration:${(totalDuration - dipStart).toFixed(6)},ease:"power1.inOut"},${dipStart.toFixed(6)});`);
  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=${manifest.output.width},height=${manifest.output.height}">
<title>${escapeHtml(manifest.title)}</title>
<script src="assets/vendor/gsap.min.js"></script>
<style>
@font-face{font-family:"Newsreader";src:url("assets/fonts/newsreader.woff2") format("woff2");font-weight:200 800;font-display:block}
@font-face{font-family:"IBM Plex Sans";src:url("assets/fonts/ibm-plex-sans.woff2") format("woff2");font-weight:100 700;font-display:block}
@font-face{font-family:"IBM Plex Serif";src:url("assets/fonts/ibm-plex-serif.woff2") format("woff2");font-weight:400;font-display:block}
@font-face{font-family:"IBM Plex Mono";src:url("assets/fonts/ibm-plex-mono.woff2") format("woff2");font-weight:400;font-display:block}
*{box-sizing:border-box}html,body{margin:0;width:${manifest.output.width}px;height:${manifest.output.height}px;overflow:hidden;background:${palette.ink}}
body{font-family:"${typography.bodyFamily}",sans-serif;color:${palette.ink}}#root{position:relative;width:${manifest.output.width}px;height:${manifest.output.height}px;overflow:hidden}
.clip{position:absolute}.scene-clip{inset:0;overflow:hidden}.scene-inner{position:absolute;inset:0;background:${palette.colors[0]};overflow:hidden;opacity:0}
.top-rule{position:absolute;left:0;top:0;width:100%;height:18px;background:${palette.primary};z-index:10}
.scene-media{position:absolute;background:${palette.surface};border:1px solid ${palette.primary};display:block}
.folio{position:absolute;color:${palette.ink};font-size:20px;font-weight:650;letter-spacing:.14em;text-transform:uppercase;z-index:12}
.headline{position:absolute;margin:0;font-family:"${typography.titleFamily}",serif;font-size:70px;line-height:.98;letter-spacing:-.035em;font-weight:520;overflow:hidden;z-index:12}
.purpose{position:absolute;margin:0;color:${palette.muted};font-size:28px;line-height:1.34;overflow:hidden;z-index:12}
.scene-caption{padding:18px 20px;background:${palette.ink};color:${palette.colors[0]};border-left:5px solid ${palette.primary};font-size:32px;line-height:1.2;font-weight:570;z-index:30;overflow:hidden}
.final-dip{inset:0;background:${palette.ink};opacity:0;z-index:50;pointer-events:none}
</style></head><body>
<div data-hf-id="${hfId("root")}" id="root" data-composition-id="${compositionId}" data-start="0" data-duration="${totalDuration}" data-width="${manifest.output.width}" data-height="${manifest.output.height}" data-fps="${manifest.output.fps}">
${sceneHtml.join("\n")}
${audioHtml.join("\n")}
${captionsHtml.join("\n")}
<div data-hf-id="${hfId("final-dip")}" id="final-dip" class="clip final-dip" data-start="${dipStart}" data-duration="${totalDuration - dipStart}" data-track-index="50"></div>
</div>
<script>window.__timelines=window.__timelines||{};const timeline=gsap.timeline({paused:true});${timelineStatements.join("")}window.__timelines["${compositionId}"]=timeline;</script>
</body></html>`;

  await writeTextAtomic(join(buildDirectory, "index.html"), html);
  await writeJsonAtomic(join(buildDirectory, "hyperframes.json"), {
    $schema: "https://hyperframes.heygen.com/schema/hyperframes.json",
    registry: "https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry",
    paths: { blocks: "compositions", components: "compositions/components", assets: "assets" },
    media: { autoProxy: true },
  });
  await writeJsonAtomic(join(buildDirectory, "compile-receipt.json"), {
    schemaVersion: 1,
    manifestApprovalHash: manifest.approval.approvedHash,
    compositionId,
    durationSeconds: totalDuration,
    sceneStarts: starts,
    hyperframesVersion: "0.7.77",
  });
  return { directory: buildDirectory, compositionPath: join(buildDirectory, "index.html"), durationSeconds: totalDuration, sceneStarts: starts };
}
