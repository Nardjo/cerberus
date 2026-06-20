#!/usr/bin/env node
import { scaffold } from "../src/scaffold.js";
import { link } from "../src/link.js";

try {
  const target = await scaffold(process.argv[2]);
  await link(target);
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
