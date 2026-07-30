import { copyFile, mkdir, readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Frame, ProductionManifest, Rendition, RenditionId, SceneManifest } from "../types.js";
import { getLayout } from "../design/registry.js";
import { assertContained, escapeAttribute, escapeHtml, sha256, writeJsonAtomic, writeTextAtomic } from "../core/files.js";

const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const transitionOverlap = 0.6;
const landscapeTemplateRoot = resolve(sourceRoot, "../UCC-Slidedeck-YT-generator/src/youtube");
const portraitTemplateContractPath = resolve(sourceRoot, "../media-library/templates/portrait-9x16/portrait-template-contract.json");

interface PortraitTemplateContract {
  canvas: { width: number; height: number };
  sharedZones: Record<"techniqueVisual" | "copy" | "presenter" | "captionSafe", Frame>;
  templates: Array<{ id: string }>;
}

function hfId(value: string): string {
  return `hf-${sha256(value).slice(0, 8)}`;
}

function frameCss(frame: Frame): string {
  return `left:${frame.x}px;top:${frame.y}px;width:${frame.width}px;height:${frame.height}px`;
}

function assertSquareHeroMedia(assetPath: string, sceneId: string): void {
  const probe = spawnSync("ffprobe", ["-v", "error", "-show_entries", "stream=width,height", "-of", "json", assetPath], { encoding: "utf8" });
  if (probe.status !== 0) throw new Error(`Scene ${sceneId} square hero could not be probed: ${assetPath}`);
  const stream = JSON.parse(probe.stdout).streams?.[0] as { width?: number; height?: number } | undefined;
  if (!stream?.width || !stream.height || stream.width !== stream.height) {
    throw new Error(`Scene ${sceneId} square hero must be 1:1 media; received ${stream?.width ?? "?"}×${stream?.height ?? "?"}.`);
  }
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
  muted = true,
  fitOverride?: "cover" | "contain",
  trackIndex = 4,
): string {
  const id = `scene-${scene.id}-media`;
  const style = frameCss(frame);
  const duration = scene.durationSeconds;
  const fit = fitOverride ?? scene.primaryVisual?.fit ?? "contain";
  const extension = extname(source).toLowerCase();
  if ([".mp4", ".webm", ".mov", ".m4v"].includes(extension)) {
    return `<video data-hf-id="${hfId(id)}" id="${id}" class="clip scene-media" style="${style};object-fit:${fit}" src="${escapeAttribute(source)}"${muted ? " muted" : ""} playsinline preload="auto" data-start="${sceneStart}" data-duration="${duration}" data-track-index="${trackIndex}"></video>`;
  }
  return `<img data-hf-id="${hfId(id)}" id="${id}" class="scene-media" style="${style};object-fit:${fit}" src="${escapeAttribute(source)}" alt="">`;
}

function captionElements(scene: SceneManifest, sceneStart: number, frame: Frame, trackIndex: number): string {
  return (scene.captions ?? []).map((caption, index) => {
    const start = sceneStart + caption.start;
    const duration = Math.max(0.05, caption.end - caption.start);
    const id = `scene-${scene.id}-caption-${index + 1}`;
    return `<div data-hf-id="${hfId(id)}" id="${id}" class="clip scene-caption" style="${frameCss(frame)}" data-start="${start}" data-duration="${duration}" data-track-index="${trackIndex}">${escapeHtml(caption.text)}</div>`;
  }).join("\n");
}

function portraitCopyElements(scene: SceneManifest, sectionId: string, copyFrame: Frame): string {
  if (scene.editorialPanel) {
    const editorial = scene.editorialPanel;
    return `<div data-hf-id="${hfId(`${sectionId}-editorial`)}" id="${sectionId}-editorial" class="editorial-panel" style="${frameCss({ x: copyFrame.x, y: copyFrame.y, width: copyFrame.width, height: 520 })}">
      <div class="editorial-eyebrow">${escapeHtml(editorial.eyebrow)}</div>
      <h1 data-hf-id="${hfId(`${sectionId}-title`)}" id="${sectionId}-title" class="editorial-title">${escapeHtml(scene.title)}</h1>
      <p class="editorial-body">${escapeHtml(editorial.body)}</p>
      ${editorial.secondary ? `<div class="editorial-secondary">${escapeHtml(editorial.secondary)}</div>` : ""}
      ${editorial.attribution ? `<div class="editorial-attribution">${escapeHtml(editorial.attribution)}</div>` : ""}
      <div class="editorial-rail">${escapeHtml(editorial.rail)}</div>
    </div>`;
  }
  if (scene.ctaCard) {
    const cta = scene.ctaCard;
    return `<div data-hf-id="${hfId(`${sectionId}-cta`)}" id="${sectionId}-cta" class="cta-card" style="${frameCss({ x: copyFrame.x, y: copyFrame.y + 8, width: copyFrame.width, height: 510 })}">
      <div class="cta-brand">${escapeHtml(cta.brand)}</div>
      <div class="cta-primary">${escapeHtml(cta.primary)}</div>
      <div class="cta-secondary">${escapeHtml(cta.secondary)}</div>
      ${cta.body ? `<div class="cta-body">${escapeHtml(cta.body)}</div>` : ""}
      <div class="cta-attribution">${escapeHtml(cta.attribution)}</div>
    </div>`;
  }
  if (scene.proofCard) {
    const proof = scene.proofCard;
    const chips = (proof.chips ?? []).map((chip) => `<span class="proof-chip">${escapeHtml(chip)}</span>`).join("");
    return `<div data-hf-id="${hfId(`${sectionId}-proof`)}" id="${sectionId}-proof" class="proof-card" style="${frameCss({ x: copyFrame.x, y: copyFrame.y + 8, width: copyFrame.width, height: 520 })}">
      <div class="proof-eyebrow">${escapeHtml(proof.eyebrow)}${proof.illustrative ? " · ILLUSTRATIVE" : ""}</div>
      <div class="proof-title">${escapeHtml(proof.title)}</div>
      <div class="proof-body">${escapeHtml(proof.body)}</div>
      <div class="proof-chips">${chips}</div>
    </div>`;
  }
  return `<h1 data-hf-id="${hfId(`${sectionId}-title`)}" id="${sectionId}-title" class="headline" style="${frameCss({ x: copyFrame.x, y: copyFrame.y + 44, width: copyFrame.width, height: 200 })}">${escapeHtml(scene.title)}</h1>
    <p data-hf-id="${hfId(`${sectionId}-purpose`)}" id="${sectionId}-purpose" class="purpose" style="${frameCss({ x: copyFrame.x, y: copyFrame.y + 270, width: copyFrame.width, height: 160 })}">${escapeHtml(scene.purpose)}</p>`;
}

export interface CompileResult {
  directory: string;
  compositionPath: string;
  durationSeconds: number;
  sceneStarts: number[];
  rendition: Rendition;
}

function getRendition(manifest: ProductionManifest, id: RenditionId): Rendition {
  const rendition = manifest.renditions.find((item) => item.id === id);
  if (!rendition) throw new Error(`Approved release is missing rendition ${id}.`);
  return rendition;
}

async function validateTemplateSource(rendition: Rendition, manifest: ProductionManifest): Promise<PortraitTemplateContract | undefined> {
  if (rendition.id === "landscape-16x9") {
    const indexPath = join(landscapeTemplateRoot, "index.ts");
    if (!existsSync(indexPath)) throw new Error(`Official UCC landscape template source is unavailable: ${landscapeTemplateRoot}`);
    const source = await readFile(indexPath, "utf8");
    const unresolved = manifest.scenes.filter((scene) => !source.includes(`"${scene.layout}"`)).map((scene) => scene.layout);
    if (unresolved.length) throw new Error(`Official UCC landscape templates are missing: ${[...new Set(unresolved)].join(", ")}`);
    return undefined;
  }
  if (!existsSync(portraitTemplateContractPath)) throw new Error(`Official UCC portrait template contract is unavailable: ${portraitTemplateContractPath}`);
  const contract = JSON.parse(await readFile(portraitTemplateContractPath, "utf8")) as PortraitTemplateContract;
  if (!contract.templates.some((template) => template.id === rendition.defaultTemplate)) {
    throw new Error(`Official UCC portrait template is unknown: ${rendition.defaultTemplate}`);
  }
  if (contract.canvas.width !== rendition.width || contract.canvas.height !== rendition.height) {
    throw new Error(`Portrait template contract dimensions do not match ${rendition.id}.`);
  }
  return contract;
}

export async function compileHyperFrames(
  projectDirectoryInput: string,
  manifest: ProductionManifest,
  renditionId: RenditionId = manifest.renditions[0]?.id ?? "landscape-16x9",
): Promise<CompileResult> {
  const projectDirectory = resolve(projectDirectoryInput);
  const rendition = getRendition(manifest, renditionId);
  const portrait = await validateTemplateSource(rendition, manifest);
  const buildDirectory = join(projectDirectory, "build/hyperframes", rendition.id);
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
    if (index < manifest.scenes.length - 1 && scene.transition !== "none") cursor -= Math.min(transitionOverlap, scene.durationSeconds / 4);
  });
  const totalDuration = Number(cursor.toFixed(6));

  const sceneHtml: string[] = [];
  const mediaHtml: string[] = [];
  const audioHtml: string[] = [];
  const captionsHtml: string[] = [];
  const timelineStatements: string[] = [];

  for (const [index, scene] of manifest.scenes.entries()) {
    const start = starts[index] ?? 0;
    const mediaFrame = portrait?.sharedZones.techniqueVisual ?? firstFrame(scene);
    const copyFrame = portrait?.sharedZones.copy ?? textFrame(scene);
    let media = "";
    if (scene.primaryVisual?.asset) {
      if (portrait && scene.squareHero) assertSquareHeroMedia(join(projectDirectory, scene.primaryVisual.asset), scene.id);
      const copied = await copyAsset(projectDirectory, buildDirectory, scene.primaryVisual.asset);
      // The official portrait template's primary-visual zone is a full-bleed 1:1 frame.
      // Portrait media must fill that frame; letterboxing is a release-blocking layout defect.
      media = mediaElement(scene, copied, mediaFrame, start, true, portrait ? "cover" : undefined, 100 + index);
    }
    const layoutMedia = portrait ? [] : getLayout(scene.layout).media ?? [];
    for (const [supportIndex, visual] of (scene.supportingVisuals ?? []).entries()) {
      const mediaDefinition = layoutMedia[supportIndex + 1];
      const targetFrame = mediaDefinition ? getLayout(scene.layout).frames[mediaDefinition.frame] : undefined;
      if (!targetFrame) throw new Error(`Rendition ${rendition.id} has no media slot ${supportIndex + 2} for scene ${scene.id}.`);
      const copied = await copyAsset(projectDirectory, buildDirectory, visual.asset);
      media += mediaElement(
        { ...scene, id: `${scene.id}-support-${supportIndex + 1}`, primaryVisual: visual },
        copied,
        targetFrame,
        start,
        true,
        undefined,
        120 + index * 4 + supportIndex,
      );
    }
    let presenter = "";
    if (scene.presenter?.asset) {
      const copied = await copyAsset(projectDirectory, buildDirectory, scene.presenter.asset);
      const presenterFrame = portrait?.sharedZones.presenter ?? getLayout(scene.layout).frames.presenter ?? { x: 1480, y: 650, width: 400, height: 400 };
      presenter = mediaElement({ ...scene, id: `${scene.id}-presenter`, primaryVisual: { asset: copied, fit: "contain" } }, copied, presenterFrame, start, scene.presenter.muted !== false, undefined, 160 + index);
    }
    if (scene.narration?.asset) {
      const copied = await copyAsset(projectDirectory, buildDirectory, scene.narration.asset);
      const id = `scene-${scene.id}-audio`;
      const audioDuration = scene.captions?.at(-1)?.end ?? scene.durationSeconds;
      audioHtml.push(`<audio data-hf-id="${hfId(id)}" id="${id}" class="clip" src="${escapeAttribute(copied)}" preload="auto" data-start="${start}" data-duration="${audioDuration}" data-track-index="10" data-volume="1"></audio>`);
    }
    const captionFrame: Frame = portrait && scene.editorialPanel
      ? { x: 44, y: 1306, width: 992, height: 46 }
      : portrait && (scene.proofCard || scene.ctaCard)
        ? { x: 44, y: 1625, width: 992, height: 120 }
      : portrait?.sharedZones.captionSafe ?? {
      x: copyFrame.x,
      y: Math.min(copyFrame.y + Math.max(270, copyFrame.height - 150), 885),
      width: copyFrame.width,
      height: 130,
    };
    captionsHtml.push(captionElements(scene, start, captionFrame, 20 + index));
    const sectionId = `scene-${scene.id}`;
    mediaHtml.push(media, presenter);
    const copyElements = portrait
      ? portraitCopyElements(scene, sectionId, copyFrame)
      : `<h1 data-hf-id="${hfId(`${sectionId}-title`)}" id="${sectionId}-title" class="headline" style="${frameCss(copyFrame)}">${escapeHtml(scene.title)}</h1>
    <p data-hf-id="${hfId(`${sectionId}-purpose`)}" id="${sectionId}-purpose" class="purpose" style="${frameCss({ ...copyFrame, y: copyFrame.y + Math.min(copyFrame.height * 0.48, 250), height: Math.max(120, copyFrame.height * 0.45) })}">${escapeHtml(scene.purpose)}</p>`;
    sceneHtml.push(`<section data-hf-id="${hfId(sectionId)}" id="${sectionId}" class="clip scene-clip" data-start="${start}" data-duration="${scene.durationSeconds}" data-track-index="${200 + index}">
  <div data-hf-id="${hfId(`${sectionId}-inner`)}" id="${sectionId}-inner" class="scene-inner">
    <div data-hf-id="${hfId(`${sectionId}-rule`)}" class="top-rule"></div>
    <div data-hf-id="${hfId(`${sectionId}-folio`)}" class="folio" style="${frameCss(portrait ? { x: 44, y: 1805, width: 590, height: 50 } : { x: copyFrame.x, y: 54, width: copyFrame.width, height: 40 })}">UnCommon Core</div>
    ${copyElements}
  </div>
</section>`);
    timelineStatements.push(`timeline.fromTo("#${sectionId}-inner",{opacity:0,x:${index === 0 ? 0 : 80}},{opacity:1,x:0,duration:0.55,ease:"power2.out"},${start.toFixed(6)});`);
    const copyAnimationTarget = scene.editorialPanel ? `${sectionId}-editorial` : scene.ctaCard ? `${sectionId}-cta` : scene.proofCard ? `${sectionId}-proof` : `${sectionId}-title`;
    timelineStatements.push(`timeline.fromTo("#${copyAnimationTarget}",{opacity:0,y:32},{opacity:1,y:0,duration:0.52,ease:"power3.out"},${(start + 0.14).toFixed(6)});`);
    if (index < manifest.scenes.length - 1 && scene.transition !== "none") {
      const exitAt = Math.max(start, start + scene.durationSeconds - transitionOverlap);
      timelineStatements.push(`timeline.to("#${sectionId}-inner",{opacity:0,x:-60,duration:${transitionOverlap},ease:"power2.inOut"},${exitAt.toFixed(6)});`);
    }
  }

  const compositionId = `ytvf-${manifest.id}-${rendition.id}`;
  const dipStart = Math.max(0, totalDuration - 0.6);
  timelineStatements.push(`timeline.to("#final-dip",{opacity:1,duration:${(totalDuration - dipStart).toFixed(6)},ease:"power1.inOut"},${dipStart.toFixed(6)});`);
  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=${rendition.width},height=${rendition.height}">
<title>${escapeHtml(manifest.title)}</title>
<script src="assets/vendor/gsap.min.js"></script>
<style>
@font-face{font-family:"Newsreader";src:url("assets/fonts/newsreader.woff2") format("woff2");font-weight:200 800;font-display:block}
@font-face{font-family:"IBM Plex Sans";src:url("assets/fonts/ibm-plex-sans.woff2") format("woff2");font-weight:100 700;font-display:block}
@font-face{font-family:"IBM Plex Serif";src:url("assets/fonts/ibm-plex-serif.woff2") format("woff2");font-weight:400;font-display:block}
@font-face{font-family:"IBM Plex Mono";src:url("assets/fonts/ibm-plex-mono.woff2") format("woff2");font-weight:400;font-display:block}
*{box-sizing:border-box}html,body{margin:0;width:${rendition.width}px;height:${rendition.height}px;overflow:hidden;background:${palette.ink}}
body{font-family:"${typography.bodyFamily}",sans-serif;color:${palette.surface}}#root{position:relative;width:${rendition.width}px;height:${rendition.height}px;overflow:hidden}
.clip{position:absolute}.scene-clip{inset:0;overflow:hidden}.scene-inner{position:absolute;inset:0;background:${portrait ? palette.ink : palette.colors[0]};overflow:hidden;opacity:0}
.top-rule{position:absolute;left:0;top:0;width:100%;height:18px;background:${palette.primary};z-index:10;${portrait ? "display:none" : ""}}
.scene-media{position:absolute;background:${palette.surface};border:${portrait ? `5px solid ${palette.secondary}` : `1px solid ${palette.primary}`};display:block}
.folio{position:absolute;color:${palette.surface};font-size:20px;font-weight:650;letter-spacing:.14em;text-transform:uppercase;z-index:12}
.headline{position:absolute;margin:0;padding-top:10px;font-family:"${typography.titleFamily}",serif;font-size:${portrait ? 56 : 70}px;line-height:.98;letter-spacing:-.035em;font-weight:520;overflow:hidden;z-index:12}
.purpose{position:absolute;margin:0;color:${palette.surface};font-size:${portrait ? 30 : 28}px;line-height:1.34;overflow:hidden;z-index:12}
.proof-card,.cta-card{position:absolute;z-index:12;border:2px solid ${palette.surface};background:${palette.ink};padding:30px 32px;overflow:hidden;box-shadow:14px 14px 0 ${palette.secondary}}
.proof-eyebrow,.cta-brand{font-family:"${typography.monoFamily}",monospace;color:${palette.colors[2]};font-size:20px;font-weight:700;letter-spacing:.09em;line-height:1.2}
.proof-title{margin-top:18px;color:${palette.surface};font-family:"${typography.titleFamily}",serif;font-size:47px;font-weight:520;letter-spacing:-.03em;line-height:.98}
.proof-body{margin-top:19px;color:${palette.surface};font-size:26px;line-height:1.24;font-weight:500;max-width:850px}
.proof-chips{display:flex;gap:12px;flex-wrap:wrap;margin-top:25px}.proof-chip{display:inline-block;padding:10px 14px;border-radius:999px;background:${palette.colors[2]};color:${palette.ink};font-size:20px;font-weight:750;line-height:1}
.cta-card{background:${palette.surface};border-color:${palette.ink};box-shadow:14px 14px 0 ${palette.secondary};padding:36px 34px}.cta-brand{color:${palette.ink};font-size:27px;letter-spacing:.04em}.cta-primary{margin-top:26px;color:${palette.ink};font-family:"${typography.titleFamily}",serif;font-size:68px;line-height:.88;font-weight:600;letter-spacing:-.05em}.cta-secondary{display:inline-block;margin-top:26px;padding:15px 18px;background:${palette.primary};color:${palette.surface};font-size:29px;font-weight:800;line-height:1}.cta-body{margin-top:23px;color:${palette.ink};font-size:23px;font-weight:550;line-height:1.2}.cta-attribution{margin-top:22px;color:${palette.muted};font-family:"${typography.monoFamily}",monospace;font-size:17px;font-weight:700;letter-spacing:.04em}
.editorial-panel{position:absolute;z-index:12;padding:0;background-image:linear-gradient(rgba(245,214,219,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(245,214,219,.05) 1px,transparent 1px);background-size:56px 56px;overflow:hidden}.editorial-eyebrow{position:absolute;left:0;top:36px;font-family:"${typography.monoFamily}",monospace;color:${palette.surface};font-size:22px;font-weight:700;letter-spacing:.12em;line-height:1.15;text-transform:uppercase}.editorial-title{position:absolute;left:0;top:65px;width:100%;height:170px;margin:0;padding-top:14px;color:${palette.surface};font-family:"${typography.titleFamily}",serif;font-size:70px;font-weight:570;letter-spacing:-.055em;line-height:.9;overflow:hidden}.editorial-body{position:absolute;left:0;top:290px;width:930px;height:133px;margin:0;padding-top:3px;color:${palette.surface};font-size:32px;font-weight:520;line-height:1.18;overflow:hidden}.editorial-secondary{position:absolute;left:0;top:354px;color:${palette.colors[2]};font-family:"${typography.titleFamily}",serif;font-size:42px;font-weight:580;letter-spacing:-.03em;line-height:1.02}.editorial-attribution{position:absolute;left:0;top:402px;color:${palette.surface};font-family:"${typography.monoFamily}",monospace;font-size:18px;font-weight:650;letter-spacing:.04em;line-height:1.1}.editorial-rail{position:absolute;left:0;bottom:10px;width:100%;height:58px;padding:15px 20px;border:2px solid ${palette.primary};font-family:"${typography.monoFamily}",monospace;color:${palette.surface};font-size:20px;font-weight:700;letter-spacing:.08em;line-height:1;text-transform:uppercase}.scene-caption{padding:0;background:transparent;color:${palette.colors[2]};font-family:"${typography.monoFamily}",monospace;font-size:${portrait ? 27 : 32}px;letter-spacing:.04em;line-height:1.2;font-weight:650;z-index:30;overflow:hidden}
.final-dip{inset:0;background:${palette.ink};opacity:0;z-index:50}
</style></head><body>
<div data-hf-id="${hfId("root")}" id="root" data-composition-id="${compositionId}" data-template="${escapeAttribute(rendition.defaultTemplate)}" data-start="0" data-duration="${totalDuration}" data-width="${rendition.width}" data-height="${rendition.height}" data-fps="${manifest.output.fps}">
${sceneHtml.join("\n")}
${mediaHtml.join("\n")}
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
    rendition,
    templateSource: rendition.id === "landscape-16x9" ? landscapeTemplateRoot : portraitTemplateContractPath,
  });
  return { directory: buildDirectory, compositionPath: join(buildDirectory, "index.html"), durationSeconds: totalDuration, sceneStarts: starts, rendition };
}
