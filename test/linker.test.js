import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, cp, lstat, readlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);
const here = dirname(fileURLToPath(import.meta.url));
const SETUP_SH = resolve(here, "..", "template", "setup.sh");

async function makeHarness() {
  const dir = await mkdtemp(join(tmpdir(), "cc-harness-"));
  for (const name of ["alpha", "beta"]) {
    await mkdir(join(dir, "skills", name), { recursive: true });
    await writeFile(
      join(dir, "skills", name, "SKILL.md"),
      `---\nname: ${name}\ndescription: ${name}\n---\n`,
    );
  }
  await writeFile(join(dir, "CLAUDE.md"), "# rules\n");
  await writeFile(join(dir, "AGENTS.md"), "# rules\n");
  await cp(SETUP_SH, join(dir, "setup.sh"));
  return dir;
}

async function makeHome(tools) {
  const home = await mkdtemp(join(tmpdir(), "cc-home-"));
  if (tools.includes("claude")) await mkdir(join(home, ".claude"), { recursive: true });
  if (tools.includes("opencode")) await mkdir(join(home, ".config", "opencode"), { recursive: true });
  if (tools.includes("codex")) await mkdir(join(home, ".codex"), { recursive: true });
  return home;
}

function runLinker(harness, home) {
  return run("bash", [join(harness, "setup.sh")], { env: { ...process.env, HOME: home, CC_SKIP_RTK: "1" } });
}

async function isSymlink(p) {
  try {
    return (await lstat(p)).isSymbolicLink();
  } catch {
    return false;
  }
}

test("links skills only to installed tools", async () => {
  const harness = await makeHarness();
  const home = await makeHome(["claude"]);
  await runLinker(harness, home);

  assert.ok(await isSymlink(join(home, ".claude/skills/alpha")));
  assert.ok(await isSymlink(join(home, ".claude/skills/beta")));
  assert.ok(!(await isSymlink(join(home, ".config/opencode/skills/alpha"))));
  assert.ok(!(await isSymlink(join(home, ".agents/skills/alpha"))));
});

test("symlink points back into the harness skills dir", async () => {
  const harness = await makeHarness();
  const home = await makeHome(["claude"]);
  await runLinker(harness, home);

  const dest = await readlink(join(home, ".claude/skills/alpha"));
  assert.ok(dest.startsWith(join(harness, "skills", "alpha")));
});

test("links to all three tool locations when all installed", async () => {
  const harness = await makeHarness();
  const home = await makeHome(["claude", "opencode", "codex"]);
  await runLinker(harness, home);

  assert.ok(await isSymlink(join(home, ".claude/skills/alpha")));
  assert.ok(await isSymlink(join(home, ".config/opencode/skills/alpha")));
  assert.ok(await isSymlink(join(home, ".agents/skills/alpha")));
});

test("links global config to each installed tool", async () => {
  const harness = await makeHarness();
  const home = await makeHome(["claude", "opencode", "codex"]);
  await runLinker(harness, home);

  assert.ok(await isSymlink(join(home, ".claude/CLAUDE.md")));
  assert.ok(await isSymlink(join(home, ".config/opencode/AGENTS.md")));
  assert.ok(await isSymlink(join(home, ".codex/AGENTS.md")));
});

test("backs up an existing global config before linking", async () => {
  const harness = await makeHarness();
  const home = await makeHome(["claude"]);
  await writeFile(join(home, ".claude/CLAUDE.md"), "MY EXISTING RULES");

  await runLinker(harness, home);

  assert.ok(await isSymlink(join(home, ".claude/CLAUDE.md")), "now a symlink");
  const backup = await readFile(join(home, ".claude/CLAUDE.md.bak"), "utf8");
  assert.equal(backup, "MY EXISTING RULES", "old config preserved in .bak");
});

test("re-running is idempotent", async () => {
  const harness = await makeHarness();
  const home = await makeHome(["claude"]);
  await runLinker(harness, home);
  await runLinker(harness, home);

  assert.ok(await isSymlink(join(home, ".claude/skills/alpha")));
  assert.ok(await isSymlink(join(home, ".claude/CLAUDE.md")));
});

test("no tools installed → no links, no error", async () => {
  const harness = await makeHarness();
  const home = await makeHome([]);
  const { stdout } = await runLinker(harness, home);

  assert.match(stdout, /Aucun outil/);
  assert.ok(!(await isSymlink(join(home, ".claude/skills/alpha"))));
});
