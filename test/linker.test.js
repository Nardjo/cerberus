import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, cp, lstat, readlink, symlink } from "node:fs/promises";
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
  if (tools.includes("antigravity")) await mkdir(join(home, ".gemini"), { recursive: true });
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

async function pathExists(p) {
  try {
    await lstat(p);
    return true;
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

test("links skills to every installed tool location", async () => {
  const harness = await makeHarness();
  const home = await makeHome(["claude", "opencode", "codex", "antigravity"]);
  await runLinker(harness, home);

  assert.ok(await isSymlink(join(home, ".claude/skills/alpha")));
  assert.ok(await isSymlink(join(home, ".config/opencode/skills/alpha")));
  assert.ok(await isSymlink(join(home, ".agents/skills/alpha")));
  assert.ok(await isSymlink(join(home, ".gemini/skills/alpha")));
});

test("links global config to each installed tool", async () => {
  const harness = await makeHarness();
  const home = await makeHome(["claude", "opencode", "codex", "antigravity"]);
  await runLinker(harness, home);

  assert.ok(await isSymlink(join(home, ".claude/CLAUDE.md")));
  assert.ok(await isSymlink(join(home, ".config/opencode/AGENTS.md")));
  assert.ok(await isSymlink(join(home, ".codex/AGENTS.md")));
  assert.ok(await isSymlink(join(home, ".gemini/GEMINI.md")), "Antigravity GEMINI.md linked");
  assert.equal(await readlink(join(home, ".gemini/GEMINI.md")), join(harness, "AGENTS.md"));
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

test("adopts a personal skill into the harness, then links it back", async () => {
  const harness = await makeHarness();
  const home = await makeHome(["claude"]);
  await mkdir(join(home, ".claude/skills/mine"), { recursive: true });
  await writeFile(
    join(home, ".claude/skills/mine/SKILL.md"),
    "---\nname: mine\ndescription: mine\n---\n",
  );

  await runLinker(harness, home);

  const adopted = await readFile(join(harness, "skills/mine/SKILL.md"), "utf8");
  assert.match(adopted, /name: mine/, "moved into the harness");
  assert.ok(await isSymlink(join(home, ".claude/skills/mine")), "linked back");
  const dest = await readlink(join(home, ".claude/skills/mine"));
  assert.ok(dest.startsWith(join(harness, "skills", "mine")));
});

test("adopts personal commands and agents, linked back as whole-dir symlinks", async () => {
  const harness = await makeHarness();
  const home = await makeHome(["claude"]);
  await mkdir(join(home, ".claude/commands"), { recursive: true });
  await writeFile(join(home, ".claude/commands/deploy.md"), "deploy cmd");
  await mkdir(join(home, ".claude/agents"), { recursive: true });
  await writeFile(join(home, ".claude/agents/scout.md"), "scout agent");

  await runLinker(harness, home);

  // adopted into per-tool harness dirs
  assert.equal(await readFile(join(harness, "commands/claude/deploy.md"), "utf8"), "deploy cmd");
  assert.equal(await readFile(join(harness, "agents/claude/scout.md"), "utf8"), "scout agent");
  // commands/ and agents/ themselves are symlinks to the harness dir (not file-by-file)
  assert.ok(await isSymlink(join(home, ".claude/commands")), "commands is a whole-dir symlink");
  assert.ok(await isSymlink(join(home, ".claude/agents")), "agents is a whole-dir symlink");
  assert.equal(await readlink(join(home, ".claude/commands")), join(harness, "commands/claude"));
  assert.equal(await readlink(join(home, ".claude/agents")), join(harness, "agents/claude"));
  // and the personal content is reachable through the symlink
  assert.equal(await readFile(join(home, ".claude/commands/deploy.md"), "utf8"), "deploy cmd");
});

test("on a skill name conflict, keeps both (personal suffixed -local)", async () => {
  const harness = await makeHarness(); // ships skills alpha, beta
  const home = await makeHome(["claude"]);
  await mkdir(join(home, ".claude/skills/alpha"), { recursive: true });
  await writeFile(
    join(home, ".claude/skills/alpha/SKILL.md"),
    "---\nname: alpha\ndescription: MINE\n---\n",
  );

  await runLinker(harness, home);

  const official = await readFile(join(harness, "skills/alpha/SKILL.md"), "utf8");
  assert.match(official, /description: alpha/, "official skill untouched");
  const mine = await readFile(join(harness, "skills/alpha-local/SKILL.md"), "utf8");
  assert.match(mine, /description: MINE/, "personal kept as -local");
  assert.ok(await isSymlink(join(home, ".claude/skills/alpha")));
  assert.ok(await isSymlink(join(home, ".claude/skills/alpha-local")));
});

test("on a command file conflict, suffix is inserted before the extension", async () => {
  const harness = await makeHarness();
  await mkdir(join(harness, "commands/claude"), { recursive: true });
  await writeFile(join(harness, "commands/claude/ship.md"), "official ship");
  const home = await makeHome(["claude"]);
  await mkdir(join(home, ".claude/commands"), { recursive: true });
  await writeFile(join(home, ".claude/commands/ship.md"), "my ship");

  await runLinker(harness, home);

  assert.equal(await readFile(join(harness, "commands/claude/ship.md"), "utf8"), "official ship");
  assert.equal(await readFile(join(harness, "commands/claude/ship-local.md"), "utf8"), "my ship");
});

test("appends a personal config into the harness, then backs it up", async () => {
  const harness = await makeHarness();
  const home = await makeHome(["claude"]);
  await writeFile(join(home, ".claude/CLAUDE.md"), "PERSONAL RULE 42");

  await runLinker(harness, home);

  const merged = await readFile(join(harness, "CLAUDE.md"), "utf8");
  assert.match(merged, /# rules/, "original harness config kept");
  assert.match(merged, /cerberus:imported:Claude Code/, "import marker added");
  assert.match(merged, /PERSONAL RULE 42/, "personal content appended");
  assert.ok(await isSymlink(join(home, ".claude/CLAUDE.md")));
  assert.equal(
    await readFile(join(home, ".claude/CLAUDE.md.bak"), "utf8"),
    "PERSONAL RULE 42",
    "original preserved in .bak",
  );
});

test("adoption is idempotent — a second run changes nothing", async () => {
  const harness = await makeHarness();
  const home = await makeHome(["claude"]);
  await mkdir(join(home, ".claude/skills/mine"), { recursive: true });
  await writeFile(
    join(home, ".claude/skills/mine/SKILL.md"),
    "---\nname: mine\ndescription: mine\n---\n",
  );
  await writeFile(join(home, ".claude/CLAUDE.md"), "PERSONAL RULE 42");

  await runLinker(harness, home);
  const afterFirst = await readFile(join(harness, "CLAUDE.md"), "utf8");
  await runLinker(harness, home);
  const afterSecond = await readFile(join(harness, "CLAUDE.md"), "utf8");

  assert.equal(afterSecond, afterFirst, "config not appended twice");
  assert.ok(await isSymlink(join(home, ".claude/skills/mine")));
  assert.ok(
    !(await pathExists(join(harness, "skills/mine-local"))),
    "not re-adopted into a -local copy",
  );
});

test("whole-dir command symlink is idempotent — no -local on re-run", async () => {
  const harness = await makeHarness();
  const home = await makeHome(["claude"]);
  await mkdir(join(home, ".claude/commands"), { recursive: true });
  await writeFile(join(home, ".claude/commands/deploy.md"), "deploy cmd");

  await runLinker(harness, home);
  await runLinker(harness, home);

  assert.ok(await isSymlink(join(home, ".claude/commands")));
  assert.equal(await readFile(join(harness, "commands/claude/deploy.md"), "utf8"), "deploy cmd");
  assert.ok(
    !(await pathExists(join(harness, "commands/claude/deploy-local.md"))),
    "content not re-adopted through the symlink",
  );
});

test("a pre-existing symlink is not adopted", async () => {
  const harness = await makeHarness();
  const home = await makeHome(["claude"]);
  const external = join(home, "external-skill");
  await mkdir(external, { recursive: true });
  await writeFile(join(external, "SKILL.md"), "ext");
  await mkdir(join(home, ".claude/skills"), { recursive: true });
  await symlink(external, join(home, ".claude/skills/ext"));

  await runLinker(harness, home);

  assert.ok(
    !(await pathExists(join(harness, "skills/ext"))),
    "external symlink left in place, not pulled into the harness",
  );
});

test("Antigravity: adopts ~/.gemini skills and appends a non-empty GEMINI.md", async () => {
  const harness = await makeHarness();
  const home = await makeHome(["antigravity"]);
  await mkdir(join(home, ".gemini/skills/mine"), { recursive: true });
  await writeFile(
    join(home, ".gemini/skills/mine/SKILL.md"),
    "---\nname: mine\ndescription: mine\n---\n",
  );
  await writeFile(join(home, ".gemini/GEMINI.md"), "MES NOTES GEMINI");

  await runLinker(harness, home);

  assert.match(await readFile(join(harness, "skills/mine/SKILL.md"), "utf8"), /name: mine/);
  assert.ok(await isSymlink(join(home, ".gemini/skills/mine")));
  const merged = await readFile(join(harness, "AGENTS.md"), "utf8");
  assert.match(merged, /cerberus:imported:Antigravity/);
  assert.match(merged, /MES NOTES GEMINI/);
  assert.ok(await isSymlink(join(home, ".gemini/GEMINI.md")));
  assert.equal(await readFile(join(home, ".gemini/GEMINI.md.bak"), "utf8"), "MES NOTES GEMINI");
});

test("an empty personal config is not appended into the harness", async () => {
  const harness = await makeHarness();
  const home = await makeHome(["antigravity"]);
  await writeFile(join(home, ".gemini/GEMINI.md"), ""); // 0-byte, like a fresh GEMINI.md

  await runLinker(harness, home);

  const merged = await readFile(join(harness, "AGENTS.md"), "utf8");
  assert.ok(!merged.includes("cerberus:imported"), "empty config not imported");
  assert.ok(await isSymlink(join(home, ".gemini/GEMINI.md")), "still linked to the harness");
});
