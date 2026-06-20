import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SKILLS } from "./manifest.js";
import { assembleTemplate } from "./assemble.js";
import { createGithubFetcher } from "./github.js";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, "..", "template", "skills");

const names = await assembleTemplate({
  skills: SKILLS,
  fetchSkill: createGithubFetcher(),
  outDir,
});

console.log(`✓ ${names.length} skills assemblés dans template/skills/`);
