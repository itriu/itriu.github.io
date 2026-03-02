import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { Pool } from "pg";

function getConnectionString() {
  const cs =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_PRISMA_URL;

  return cs ?? null;
}

async function main() {
  const connectionString = getConnectionString();
  if (!connectionString) {
    console.warn(
      "sync-theme: DATABASE_URL is missing; skipping theme sync (local build/dev).",
    );
    return;
  }

  const pool = new Pool({
    connectionString,
    max: 1,
  });

  const res = await pool.query(
    `
      SELECT tv.version, tv.global_css, tv.global_js
      FROM themes t
      JOIN theme_versions tv ON tv.id = t.active_version_id
      LIMIT 1;
    `,
  );

  await pool.end();

  const row = res.rows[0];
  if (!row) {
    throw new Error("Theme not initialized in DB");
  }

  const root = process.cwd();
  const publicDir = path.join(root, "public");
  fs.mkdirSync(publicDir, { recursive: true });

  fs.writeFileSync(path.join(publicDir, "theme.css"), row.global_css ?? "", "utf8");
  fs.writeFileSync(path.join(publicDir, "theme.js"), row.global_js ?? "", "utf8");

  const generatedDir = path.join(root, "src", "generated");
  fs.mkdirSync(generatedDir, { recursive: true });

  const assetTag =
    process.env.GITHUB_SHA ??
    process.env.VERCEL_GIT_COMMIT_SHA ??
    String(Number(row.version) || 1);

  const ts = `export const themeAssetTag = ${JSON.stringify(assetTag)} as const;\n`;
  fs.writeFileSync(path.join(generatedDir, "theme.ts"), ts, "utf8");

  console.log(`Synced theme v${row.version}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
