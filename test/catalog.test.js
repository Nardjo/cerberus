import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generateCatalog } from "../build/catalog.js";

async function makeSkills(skills) {
  const dir = await mkdtemp(join(tmpdir(), "cc-cat-"));
  for (const { name, description } of skills) {
    await mkdir(join(dir, name), { recursive: true });
    await writeFile(
      join(dir, name, "SKILL.md"),
      `---\nname: ${name}\ndescription: ${description}\n---\nbody`,
    );
  }
  return dir;
}

test("catalog lists every skill with its description, sorted", async () => {
  const skillsDir = await makeSkills([
    { name: "tdd", description: "Test-driven development" },
    { name: "ask-matt", description: "Router over the skills" },
  ]);
  const out = join(skillsDir, "..", "SKILLS.md");

  const names = await generateCatalog({ skillsDir, outFile: out });
  assert.deepEqual(names, ["ask-matt", "tdd"]);

  const md = await readFile(out, "utf8");
  assert.match(md, /\| `tdd` \| Test-driven development \|/);
  assert.match(md, /\| `ask-matt` \| Router over the skills \|/);
  assert.ok(md.indexOf("ask-matt") < md.indexOf("tdd"), "sorted alphabetically");
});

test("catalog uses an override description when provided, falling back otherwise", async () => {
  const skillsDir = await makeSkills([
    { name: "tdd", description: "Test-driven development" },
    { name: "teach", description: "Teach a concept" },
  ]);
  const out = join(skillsDir, "..", "SKILLS.md");

  await generateCatalog({ skillsDir, outFile: out, descriptions: { tdd: "Développement piloté par les tests" } });

  const md = await readFile(out, "utf8");
  assert.match(md, /\| `tdd` \| Développement piloté par les tests \|/, "override used");
  assert.match(md, /\| `teach` \| Teach a concept \|/, "frontmatter fallback kept");
});

test("catalog escapes pipes in descriptions", async () => {
  const skillsDir = await makeSkills([
    { name: "x", description: "does a | b | c" },
  ]);
  const out = join(skillsDir, "..", "SKILLS.md");
  await generateCatalog({ skillsDir, outFile: out });
  const md = await readFile(out, "utf8");
  assert.match(md, /does a \\\| b \\\| c/);
});
