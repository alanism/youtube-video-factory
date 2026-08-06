import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import sharp from "sharp";
import { allPalettes, designPacks, factoryPalettes, layouts, palettes, typographies } from "../src/design/registry.js";
import type { Frame, LayoutDefinition, PaletteDefinition } from "../src/types.js";

const layoutDirectory = "docs/assets/layouts";
const width = 960;
const height = 540;
const scaleX = width / 1920;
const scaleY = height / 1080;

const roleColors: Record<string, { fill: string; stroke: string }> = {
  presenter: { fill: "#5F5363", stroke: "#EEE6D8" },
  media: { fill: "#D8CBB8", stroke: "#A6793B" },
  media1: { fill: "#D8CBB8", stroke: "#A6793B" },
  media2: { fill: "#CDBEA7", stroke: "#A6793B" },
  media3: { fill: "#BDAE9B", stroke: "#A6793B" },
  title: { fill: "#EEE6D8", stroke: "#24202A" },
  subtitle: { fill: "#EEE6D8", stroke: "#5F5363" },
  text: { fill: "#EEE6D8", stroke: "#24202A" },
  quote: { fill: "#EEE6D8", stroke: "#24202A" },
  attribution: { fill: "#D8CBB8", stroke: "#5F5363" },
  caption: { fill: "#24202A", stroke: "#A6793B" },
  caption1: { fill: "#24202A", stroke: "#A6793B" },
  caption2: { fill: "#24202A", stroke: "#A6793B" },
  caption3: { fill: "#24202A", stroke: "#A6793B" },
  chart: { fill: "#EEE6D8", stroke: "#A6793B" },
  matrix: { fill: "#EEE6D8", stroke: "#A6793B" },
  canvas: { fill: "#EEE6D8", stroke: "#A6793B" },
  accentBar: { fill: "#A6793B", stroke: "#A6793B" },
  topBar: { fill: "#A6793B", stroke: "#A6793B" },
  bottomBar: { fill: "#5F5363", stroke: "#5F5363" },
  leftBar: { fill: "#A6793B", stroke: "#A6793B" },
  author: { fill: "#D8CBB8", stroke: "#5F5363" },
};

function xml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;");
}

function scaled(frame: Frame): Frame {
  return {
    x: Math.round(frame.x * scaleX),
    y: Math.round(frame.y * scaleY),
    width: Math.round(frame.width * scaleX),
    height: Math.round(frame.height * scaleY),
  };
}

function labelSize(frame: Frame): number {
  if (frame.width < 55 || frame.height < 24) return 9;
  if (frame.width < 110) return 11;
  return 15;
}

function frameElements(layout: LayoutDefinition): string {
  return Object.entries(layout.frames).map(([name, frame]) => {
    const box = scaled(frame);
    const colors = roleColors[name] ?? { fill: "#EEE6D8", stroke: "#A6793B" };
    const label = name.replace(/\d$/, " $&");
    return `<g>
  <rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="3" fill="${colors.fill}" fill-opacity="0.88" stroke="${colors.stroke}" stroke-width="2"/>
  <text x="${box.x + 8}" y="${box.y + Math.min(box.height - 6, 22)}" font-family="IBM Plex Sans, Arial, sans-serif" font-size="${labelSize(box)}" font-weight="700" fill="${name.startsWith("caption") ? "#EEE6D8" : "#24202A"}">${xml(label)}</text>
</g>`;
  }).join("\n");
}

function layoutSvg(layout: LayoutDefinition): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="${width}" height="${height}" fill="#24202A"/>
<rect x="0" y="0" width="${width}" height="${height}" fill="#EEE6D8"/>
<rect x="0" y="0" width="${width}" height="10" fill="#A6793B"/>
${frameElements(layout)}
<text x="30" y="515" font-family="IBM Plex Mono, monospace" font-size="18" font-weight="700" fill="#24202A">${xml(layout.id)}</text>
</svg>`;
}

function swatches(colors: string[]): string {
  return colors.map((color) => `<span style="display:inline-block;width:34px;height:18px;background:${color};border:1px solid #24202A22"></span>`).join("");
}

function paletteRow(palette: PaletteDefinition): string {
  return `| \`${palette.id}\` | ${palette.label} | ${palette.group} | ${swatches(palette.colors)} | ${palette.colors.map((color) => `\`${color}\``).join(" ")} | ${palette.primary} | ${palette.surface} | ${palette.ink} |`;
}

function frameTable(layout: LayoutDefinition): string {
  return Object.entries(layout.frames).map(([name, frame]) => `| ${name} | ${frame.x}, ${frame.y} | ${frame.width} x ${frame.height} |`).join("\n");
}

function markdown(): string {
  const layoutSections = layouts.map((layout) => `### ${layout.id}

![${layout.id}](docs/assets/layouts/${layout.id}.png)

${layout.purpose}

| Frame | Origin | Size |
|---|---:|---:|
${frameTable(layout)}
`).join("\n");

  return `# Design System

Generated from \`src/design/registry.ts\`. Do not hand-edit layout, palette, or typography tables without updating the registry and rerunning \`pnpm ytvf:design-docs\`.

## Layout Templates

The factory ships ${layouts.length} YouTube layouts. Each preview is a 16:9 wireframe rendered from the exact 1920x1080 frame geometry used by the HyperFrames compiler.

${layoutSections}

## Palettes

The registry contains ${palettes.length} original palettes plus ${factoryPalettes.length} factory palette.

| ID | Name | Group | Swatches | Hex Values | Primary | Surface | Ink |
|---|---|---|---|---|---|---|---|
${allPalettes.map(paletteRow).join("\n")}

## Typography

The public typography system is IBM Plex complete:

- IBM Plex Sans for body text, captions, and modern headlines
- IBM Plex Serif for editorial headlines and long-form authority
- IBM Plex Mono for technical labels, scene IDs, code, and research-style layouts

Newsreader remains vendored as an optional legacy/editorial font for older compositions, but the five built-in typography systems below use the IBM Plex family.

| ID | Name | Description | Title | Body | Caption | Mono |
|---|---|---|---|---|---|---|
${typographies.map((type) => `| \`${type.id}\` | ${type.label} | ${type.description} | ${type.titleFamily} | ${type.bodyFamily} | ${type.captionFamily} | ${type.monoFamily} |`).join("\n")}

## Design Packs

| ID | Name | Palette | Typography | Default Layout | Motion |
|---|---|---|---|---|---|
${designPacks.map((pack) => `| \`${pack.id}\` | ${pack.label} | ${pack.palette} | ${pack.typography} | ${pack.defaultLayout} | ${pack.motion} |`).join("\n")}

## Add A New Design

1. Create a project-local design pack JSON using \`examples/design-pack.json\`.
2. Keep every palette to exactly five colors.
3. Choose typography from IBM Plex Sans, IBM Plex Serif, and IBM Plex Mono unless a licensed project font is vendored with notices.
4. Run \`pnpm ytvf design add <project> <design-pack.json>\`.
5. Run \`pnpm ytvf design preview <project>\` for a local catalog.
6. Promote reusable design packs only after recording provenance, intended use, and preview evidence.
`;
}

async function main(): Promise<void> {
  await mkdir(layoutDirectory, { recursive: true });
  for (const layout of layouts) {
    await sharp(Buffer.from(layoutSvg(layout))).png().toFile(join(layoutDirectory, `${layout.id}.png`));
  }
  await writeFile("DESIGN_SYSTEM.md", markdown());
  await mkdir(dirname(".acdf/changes/youtube-video-factory-v1/evidence/t04_design_docs.log"), { recursive: true });
  await writeFile(".acdf/changes/youtube-video-factory-v1/evidence/t04_design_docs.log", `Generated ${layouts.length} layout PNGs and DESIGN_SYSTEM.md from registry.\n`);
}

await main();
