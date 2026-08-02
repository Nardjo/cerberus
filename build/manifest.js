// The curated starter: Matt Pocock's engineering + productivity workflow.
// Excludes upstream deprecated/personal/misc/in-progress skills.
// Source of truth for what the scaffolded harness ships with.
export const CATALOG_ORDER = [
  "setup-matt-pocock-skills",
  "ask-matt",
  "grill-with-docs",
  "grill-me",
  "grilling",
  "research",
  "prototype",
  "wayfinder",
  "to-spec",
  "to-tickets",
  "implement",
  "tdd",
  "code-review",
  "triage",
  "diagnosing-bugs",
  "improve-codebase-architecture",
  "codebase-design",
  "domain-modeling",
  "handoff",
  "resolving-merge-conflicts",
  "teach",
  "writing-great-skills",
  "caveman",
  "update-harness",
];

export const SKILLS = [
  { category: "engineering", name: "ask-matt" },
  { category: "engineering", name: "code-review" },
  { category: "engineering", name: "codebase-design" },
  { category: "engineering", name: "diagnosing-bugs" },
  { category: "engineering", name: "domain-modeling" },
  { category: "engineering", name: "grill-with-docs" },
  { category: "engineering", name: "implement" },
  { category: "engineering", name: "improve-codebase-architecture" },
  { category: "engineering", name: "prototype" },
  { category: "engineering", name: "research" },
  { category: "engineering", name: "resolving-merge-conflicts" },
  { category: "engineering", name: "setup-matt-pocock-skills" },
  { category: "engineering", name: "tdd" },
  { category: "engineering", name: "to-spec" },
  { category: "engineering", name: "to-tickets" },
  { category: "engineering", name: "triage" },
  { category: "engineering", name: "wayfinder" },
  { category: "productivity", name: "grill-me" },
  { category: "productivity", name: "grilling" },
  { category: "productivity", name: "handoff" },
  { category: "productivity", name: "teach" },
  { category: "productivity", name: "writing-great-skills" },
];

// Extra skills vendored under extras/<name>/ (outside mattpocock/skills).
export const EXTRAS = ["caveman", "update-harness"];
