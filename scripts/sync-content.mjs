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

function toSlug(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-")
    .replace(/^\-+|\-+$/g, "");
}

async function main() {
  const connectionString = getConnectionString();
  if (!connectionString) {
    console.warn(
      "sync-content: DATABASE_URL is missing; skipping content sync (local build/dev).",
    );
    return;
  }

  const pool = new Pool({ connectionString, max: 1 });

  const postsRes = await pool.query(
    `
      SELECT id, title, slug, excerpt, content_mdx, cover_blob_url, status, published_at, updated_at
      FROM posts
      WHERE status = 'published'
      ORDER BY published_at DESC NULLS LAST, updated_at DESC;
    `,
  );

  const tagsRes = await pool.query(
    `
      SELECT id, name, slug
      FROM tags
      ORDER BY name ASC;
    `,
  );

  const relRes = await pool.query(
    `
      SELECT pt.post_id, pt.tag_id
      FROM post_tags pt;
    `,
  );

  await pool.end();

  const root = process.cwd();
  const generatedDir = path.join(root, "src", "generated");
  fs.mkdirSync(generatedDir, { recursive: true });

  const posts = postsRes.rows.map((p) => ({
    id: String(p.id),
    title: String(p.title),
    slug: String(p.slug),
    excerpt: p.excerpt == null ? null : String(p.excerpt),
    content: String(p.content_mdx),
    coverUrl: p.cover_blob_url == null ? null : String(p.cover_blob_url),
    publishedAt: p.published_at ? new Date(p.published_at).toISOString() : null,
    updatedAt: p.updated_at ? new Date(p.updated_at).toISOString() : null,
  }));

  const tags = tagsRes.rows.map((t) => ({
    id: String(t.id),
    name: String(t.name),
    slug: String(t.slug || toSlug(t.name)),
  }));

  const postTags = relRes.rows.map((r) => ({
    postId: String(r.post_id),
    tagId: String(r.tag_id),
  }));

  const assetTag =
    process.env.GITHUB_SHA ??
    process.env.VERCEL_GIT_COMMIT_SHA ??
    String(Date.now());

  const ts =
    `export type GeneratedPost = {\n` +
    `  id: string;\n` +
    `  title: string;\n` +
    `  slug: string;\n` +
    `  excerpt: string | null;\n` +
    `  content: string;\n` +
    `  coverUrl: string | null;\n` +
    `  publishedAt: string | null;\n` +
    `  updatedAt: string | null;\n` +
    `};\n\n` +
    `export type GeneratedTag = { id: string; name: string; slug: string };\n` +
    `export type GeneratedPostTag = { postId: string; tagId: string };\n\n` +
    `export const contentAssetTag = ${JSON.stringify(assetTag)} as const;\n` +
    `export const posts: GeneratedPost[] = ${JSON.stringify(posts, null, 2)};\n` +
    `export const tags: GeneratedTag[] = ${JSON.stringify(tags, null, 2)};\n` +
    `export const postTags: GeneratedPostTag[] = ${JSON.stringify(postTags, null, 2)};\n`;

  fs.writeFileSync(path.join(generatedDir, "content.ts"), ts, "utf8");

  console.log(`Synced ${posts.length} posts, ${tags.length} tags`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
