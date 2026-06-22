import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { copyFile } from "node:fs/promises";
import { SKILLS } from "./manifest.js";
import { assembleTemplate } from "./assemble.js";
import { generateCatalog } from "./catalog.js";
import { createGithubFetcher } from "./github.js";

const here = dirname(fileURLToPath(import.meta.url));
const templateDir = resolve(here, "..", "template");
const skillsDir = resolve(templateDir, "skills");

const names = await assembleTemplate({
  skills: SKILLS,
  fetchSkill: createGithubFetcher(),
  outDir: skillsDir,
});

await generateCatalog({ skillsDir, outFile: resolve(templateDir, "SKILLS.md") });
await copyFile(resolve(templateDir, "CLAUDE.md"), resolve(templateDir, "AGENTS.md"));

console.log(`✓ ${names.length} skills + SKILLS.md + AGENTS.md générés`);
