import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const ignoredDirs = new Set([
  ".git",
  ".next",
  "node_modules",
  "coverage",
  ".playwright-cli",
]);
const scanExtensions = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".md",
  ".json",
]);
const allowedFiles = new Set([
  path.join(root, "scripts/check-real-uat-policy.mjs"),
]);

const joinWords = (...parts) => parts.join("");
const bannedPatterns = [
  ["same-machine test data bypass", new RegExp(joinWords("local", "-", "uat"), "i")],
  ["same-machine UAT wording", new RegExp(joinWords("local", "\\s+", "UAT"), "i")],
  ["UAT bypass wording", new RegExp(joinWords("UAT", "\\s+", "fall", "back"), "i")],
  ["mocked Supabase wording", new RegExp(joinWords("mock", "\\s+", "Supabase"), "i")],
  ["synthetic auth wording", new RegExp(joinWords("fake", "\\s+", "auth"), "i")],
  ["synthetic account wording", new RegExp(joinWords("demo", "\\s+", "user"), "i")],
  ["same-machine test bypass wording", new RegExp(joinWords("local", "\\s+", "test", "\\s+", "fall", "back"), "i")],
  ["example test domain", new RegExp(joinWords("example", "\\.", "test"), "i")],
  ["same-machine data directory", new RegExp(joinWords("\\.", "local", "-", "uat", "-", "data"), "i")],
  ["old same-machine store guard", new RegExp(joinWords("canUse", "Local", "Uat", "Store"))],
  ["old same-machine trip guard", new RegExp(joinWords("is", "Local", "Trip", "Id"))],
  ["old schema warning", new RegExp(joinWords("saved", "With", "Limited", "Schema"))],
  ["old basic schema insert", new RegExp(joinWords("BASIC", "_", "TRIP"))],
];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) {
        files.push(...(await walk(fullPath)));
      }
      continue;
    }

    if (!entry.isFile() || allowedFiles.has(fullPath)) {
      continue;
    }

    const extension = path.extname(entry.name);
    if (scanExtensions.has(extension)) {
      files.push(fullPath);
    }
  }

  return files;
}

const matches = [];

for (const filePath of await walk(root)) {
  const fileStat = await stat(filePath);
  if (fileStat.size > 1_000_000) {
    continue;
  }

  const text = await readFile(filePath, "utf8");
  const relativePath = path.relative(root, filePath);

  for (const [label, pattern] of bannedPatterns) {
    if (pattern.test(text)) {
      matches.push(`${relativePath}: ${label}`);
    }
  }
}

if (matches.length > 0) {
  console.error("Real Supabase UAT policy violations found:");
  for (const match of matches) {
    console.error(`- ${match}`);
  }
  process.exit(1);
}

console.log("Real Supabase UAT policy check passed.");
