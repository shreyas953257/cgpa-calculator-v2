import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const assets = [
  "gradebook-logo_37220e98.png",
  "cinematic-academic-grid_1932fd90.jpg",
  "gradebook-hero-ledger_5218b0b4.jpg",
  "gradebook-formula_b08efe24.jpg",
  "gradebook-semester_6c21de1e.jpg",
  "space-earthlike-edge_a7349942.png",
  "space-ringed-planet-edge_64f3fb9a.png",
  "space-moon-realistic_af01dd28.png",
  "space-nebula-film_643d2c97.png",
];

const assetOrigin = "https://cgpacalc-oln2ubku.manus.space/manus-storage";
const targetDirectory = path.resolve(import.meta.dirname, "..", "dist", "public", "assets", "cgpa-calculator");

await rm(targetDirectory, { recursive: true, force: true });
await mkdir(targetDirectory, { recursive: true });

for (const asset of assets) {
  const response = await fetch(`${assetOrigin}/${asset}`);
  if (!response.ok) {
    throw new Error(`Could not download required offline asset: ${asset}`);
  }

  const content = Buffer.from(await response.arrayBuffer());
  await writeFile(path.join(targetDirectory, asset), content);
}

await cp(path.resolve(import.meta.dirname, "..", "client", "public"), path.resolve(import.meta.dirname, "..", "dist", "public"), { recursive: true });
