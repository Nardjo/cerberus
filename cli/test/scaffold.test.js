import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, lstat, readFile, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { scaffold } from "../src/scaffold.js";

async function pathExists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

test("scaffolds a harness folder with skills and README", async () => {
  const base = await mkdtemp(join(tmpdir(), "cc-scaffold-"));
  const target = join(base, "mon-harness");
  const returned = await scaffold(target);

  assert.equal(returned, target);
  assert.ok((await lstat(join(target, "skills"))).isDirectory());
  assert.ok((await lstat(join(target, "skills", "tdd", "SKILL.md"))).isFile());
  const readme = await readFile(join(target, "README.md"), "utf8");
  assert.match(readme, /harness/i);
  assert.ok(!(await pathExists(join(target, ".git"))));
});

test("errors when name is missing", async () => {
  await assert.rejects(() => scaffold(undefined), /Usage/);
});

test("errors when target already exists", async () => {
  const base = await mkdtemp(join(tmpdir(), "cc-scaffold-"));
  const target = join(base, "dup");
  await scaffold(target);
  await assert.rejects(() => scaffold(target), /existe déjà/);
});
