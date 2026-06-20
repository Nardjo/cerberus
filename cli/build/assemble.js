import { rm, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { parseFrontmatter } from "./frontmatter.js";

// Assemble the bundled skill template from a fetched source.
// `fetchSkill(category, name)` resolves to [{ path, content }] for one skill folder.
// outDir is regenerated from scratch each run so the result is reproducible.
export async function assembleTemplate({ skills, fetchSkill, outDir }) {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  for (const { category, name } of skills) {
    const files = await fetchSkill(category, name);

    const skillMd = files.find((f) => f.path === "SKILL.md");
    if (!skillMd) {
      throw new Error(`${name}: SKILL.md manquant`);
    }

    const fm = parseFrontmatter(skillMd.content);
    if (!fm.name || !fm.description) {
      throw new Error(`${name}: frontmatter incomplet (name et description requis)`);
    }

    for (const file of files) {
      const dest = join(outDir, name, file.path);
      await mkdir(dirname(dest), { recursive: true });
      await writeFile(dest, file.content);
    }
  }

  return skills.map((s) => s.name);
}
