import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { copyFile, cp } from "node:fs/promises";
import { SKILLS, EXTRAS } from "./manifest.js";
import { assembleTemplate } from "./assemble.js";
import { generateCatalog } from "./catalog.js";
import { createGithubFetcher } from "./github.js";

const here = dirname(fileURLToPath(import.meta.url));
const templateDir = resolve(here, "..", "template");
const skillsDir = resolve(templateDir, "skills");
const extrasDir = resolve(here, "..", "extras");

const names = await assembleTemplate({
  skills: SKILLS,
  fetchSkill: createGithubFetcher(),
  outDir: skillsDir,
});

for (const name of EXTRAS) {
  await cp(resolve(extrasDir, name), resolve(skillsDir, name), { recursive: true });
}

await generateCatalog({ skillsDir, outFile: resolve(templateDir, "SKILLS.md") });
await copyFile(resolve(templateDir, "CLAUDE.md"), resolve(templateDir, "AGENTS.md"));

console.log(`✓ ${names.length} skills + ${EXTRAS.length} extra(s) + SKILLS.md + AGENTS.md générés`);
