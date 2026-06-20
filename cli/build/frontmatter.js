// Minimal YAML frontmatter reader — only the scalar fields we validate.
export function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};

  const result = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) {
      result[kv[1]] = kv[2].replace(/^["']|["']$/g, "").trim();
    }
  }
  return result;
}
