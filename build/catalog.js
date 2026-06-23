import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseFrontmatter } from "./frontmatter.js";

// Generate SKILLS.md — a catalog of the bundled skills, from their frontmatter.
// `descriptions` is an optional name → description map; a present entry overrides
// the skill's frontmatter description (used to ship a French catalog).
export async function generateCatalog({ skillsDir, outFile, descriptions = {} }) {
  const names = (await readdir(skillsDir, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  const rows = [];
  for (const name of names) {
    const content = await readFile(join(skillsDir, name, "SKILL.md"), "utf8");
    const fm = parseFrontmatter(content);
    const desc = (descriptions[name] ?? fm.description ?? "").replace(/\|/g, "\\|");
    rows.push(`| \`${fm.name || name}\` | ${desc} |`);
  }

  const md = [
    "# Skills",
    "",
    "Skills disponibles dans ce harness. Chacun vit dans `skills/<nom>/SKILL.md`.",
    "",
    "| Skill | Description |",
    "| --- | --- |",
    ...rows,
    "",
  ].join("\n");

  await writeFile(outFile, md);
  return names;
}
