#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";

const project = resolve(process.argv[2] ?? "");
if (!project) throw new Error("Usage: node scripts/prepare-reference-fidelity-manifests.mjs <project-directory>");
const activate = process.argv[3] ?? "a";
if (activate !== "a" && activate !== "b") throw new Error("Optional active variant must be a or b.");

const readManifest = async (path) => JSON.parse(await readFile(path, "utf8"));
const writeManifest = async (path, manifest) => {
  await mkdir(resolve(path, ".."), { recursive: true });
  await writeFile(path, `${JSON.stringify(manifest, null, 2)}\n`);
};

const editorial = {
  a: [
    ["Something is spreading.", "UNCOMMON CORE / OPEN SIGNAL • 01", "A place where students meet, build, and share what they make.", "MEET  •  BUILD  •  SHARE"],
    ["A daily challenge.", "UNCOMMON CORE / DAILY SIGNAL • 02", "Pick a mission. Make it yours. Bring your remix back to the server.", "CHALLENGE  •  CREATE  •  SHARE"],
    ["Join. Build. Show.", "UNCOMMON CORE / COMMUNITY SIGNAL • 03", "Choose a mission, make something small, then show what you made.", "SERVER  •  PROJECTS  •  FEEDBACK"],
    ["Join the Server.", "UNCOMMON CORE / YOUR NEXT MOVE • 04", "", "JOIN  •  MAKE  •  SHARE", "Download UnCommon Core.", "Powered by Hermes Thrice Great"],
  ],
  b: [
    ["What if homework\nlooked like this?", "UNCOMMON CORE / OPEN SIGNAL • 01", "A place to build with people who get it.", "MEET  •  BUILD  •  SHARE"],
    ["More missions.\nLess busywork.", "UNCOMMON CORE / DAILY SIGNAL • 02", "Choose a challenge and make it your own.", "CHALLENGE  •  CREATE  •  SHARE"],
    ["Projects become\nconversations.", "UNCOMMON CORE / COMMUNITY SIGNAL • 03", "Challenges, projects, and conversations stay connected in the server.", "SERVER  •  PROJECTS  •  FEEDBACK"],
    ["Join the Server.", "UNCOMMON CORE / YOUR NEXT MOVE • 04", "", "JOIN  •  MAKE  •  SHARE", "Download UnCommon Core.", "Powered by Hermes Thrice Great"],
  ],
};

function rebuild(manifest, variant) {
  manifest.release.version = `v3-reference-fidelity-${variant}`;
  manifest.release.keyMessage = "UnCommon Core is a place where students meet, take on missions, make things, and share them with a community.";
  manifest.release.learnerOutcome = "Viewers understand the peer-community value and can choose to join the server and download UnCommon Core.";
  manifest.release.qualityGate.blockers = [...new Set([...manifest.release.qualityGate.blockers, "hero-gutters", "hero-body-crop", "detached-caption", "reference-hierarchy-failure"])];
  manifest.providers.openrouter = { ...manifest.providers.openrouter, sourceAspectRatio: "1:1", outputAspectRatio: "1:1", generateAudio: false };
  const suffix = variant === "a" ? "a-fomo" : "b-homework-reimagined";
  manifest.output.destination = `output/uncommon-core-join-the-server-${suffix}-reference-rebuild.mp4`;
  manifest.renditions = manifest.renditions.map((rendition) => ({ ...rendition, destination: manifest.output.destination }));
  manifest.scenes = manifest.scenes.map((scene, index) => {
    const [title, eyebrow, body, rail, secondary, attribution] = editorial[variant][index];
    const montage = index === 3 ? "03" : String(index + 1).padStart(2, "0");
    return {
      ...scene,
      title,
      primaryVisual: { asset: `assets/edits-square/scene-${montage}-montage-square.mp4`, fit: "cover", aspectRatio: "1:1" },
      squareHero: true,
      editorialPanel: { eyebrow, body, rail, ...(secondary ? { secondary } : {}), ...(attribution ? { attribution } : {}) },
      transition: index === 3 ? "dip-to-dusk" : "none",
      proofCard: undefined,
      ctaCard: undefined,
      captions: undefined,
    };
  });
  manifest.approval = { status: "pending" };
  return manifest;
}

const a = rebuild(await readManifest(join(project, "production-manifest.json")), "a");
const b = rebuild(await readManifest(join(project, "versions/b-85/production-manifest.json")), "b");
await writeManifest(join(project, "versions/a-reference-fidelity/production-manifest.json"), a);
await writeManifest(join(project, "versions/b-reference-fidelity/production-manifest.json"), b);
await writeManifest(join(project, "production-manifest.json"), activate === "a" ? a : b);
console.log(`Prepared pending reference-fidelity manifests for versions A and B; activated ${activate.toUpperCase()}.`);
