import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

function stripJsonc(source) {
  let text = source.replace(/\/\*[\s\S]*?\*\//g, "");
  text = text.replace(/^\s*\/\/.*$/gm, "");
  text = text.replace(/,\s*(?=[}\]])/g, "");
  return text;
}

function getDbName() {
  const raw = readFileSync("wrangler.jsonc", "utf8");
  const parsed = JSON.parse(stripJsonc(raw));
  const db = parsed?.d1_databases?.[0];
  if (!db?.database_name) {
    throw new Error("Cannot find d1_databases[0].database_name in wrangler.jsonc");
  }
  return db.database_name;
}

function getMode() {
  const args = new Set(process.argv.slice(2));
  if (args.has("--remote")) return "remote";
  return "local";
}

const dbName = getDbName();
const mode = getMode();
const sqlFiles = readdirSync("drizzle")
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (sqlFiles.length === 0) {
  console.error("No drizzle/*.sql files found.");
  process.exit(1);
}

const npxCmd = process.platform === "win32" ? "npx.cmd" : "npx";

for (const file of sqlFiles) {
  const fullPath = join("drizzle", file);
  console.log(`[db] applying ${fullPath} to ${mode} database "${dbName}"`);
  const result = spawnSync(
    npxCmd,
    [
      "wrangler",
      "d1",
      "execute",
      dbName,
      `--${mode}`,
      "--config",
      "wrangler.jsonc",
      "--file",
      fullPath,
    ],
    { stdio: "inherit" }
  );
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("[db] migrations complete");

