import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseFrontmatter } from "./frontmatter.js";

// Generate SKILLS.md — a catalog of the bundled skills, from their frontmatter.
export async function generateCatalog({ skillsDir, outFile }) {
  const names = (await readdir(skillsDir, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  const rows = [];
  for (const name of names) {
    const content = await readFile(join(skillsDir, name, "SKILL.md"), "utf8");
    const fm = parseFrontmatter(content);
    const desc = (fm.description || "").replace(/\|/g, "\\|");
    rows.push(`| \`${fm.name || name}\` | ${desc} |`);
  }

  const md = [
    "# Skills",
    "",
    "Skills available in this harness. Each lives in `skills/<name>/SKILL.md`.",
    "",
    "| Skill | What it does |",
    "| --- | --- |",
    ...rows,
    "",
  ].join("\n");

  await writeFile(outFile, md);
  return names;
}
