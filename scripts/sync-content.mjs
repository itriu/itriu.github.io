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

function xmlEscape(input) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function ensureTrailingSlash(url) {
  if (!url) return url;
  return url.endsWith("/") ? url : `${url}/`;
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

  const settingsRes = await pool.query(
    `
      SELECT base_url, site_name, site_description
      FROM site_settings
      WHERE id = 1;
    `,
  );

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

  const settings = settingsRes.rows[0] ?? null;
  const baseUrl = ensureTrailingSlash(settings?.base_url || "https://itriu.github.io/");
  const siteName = settings?.site_name ? String(settings.site_name) : "Shopee Affiliate";
  const siteDescription = settings?.site_description ? String(settings.site_description) : "";

  const root = process.cwd();
  const publicDir = path.join(root, "public");
  fs.mkdirSync(publicDir, { recursive: true });
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

  const urls = [];
  urls.push({ loc: `${baseUrl}`, lastmod: null });
  urls.push({ loc: `${baseUrl}posts/`, lastmod: null });
  urls.push({ loc: `${baseUrl}tags/`, lastmod: null });

  for (const p of posts) {
    const lastmod = p.updatedAt || p.publishedAt;
    urls.push({ loc: `${baseUrl}posts/${encodeURIComponent(p.slug)}/`, lastmod });
  }

  for (const t of tags) {
    urls.push({ loc: `${baseUrl}tags/${encodeURIComponent(t.slug)}/`, lastmod: null });
  }

  const sitemapXml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map((u) => {
        const parts = [`  <url>`, `    <loc>${xmlEscape(u.loc)}</loc>`];
        if (u.lastmod) parts.push(`    <lastmod>${xmlEscape(u.lastmod)}</lastmod>`);
        parts.push(`  </url>`);
        return parts.join("\n");
      })
      .join("\n") +
    `\n</urlset>\n`;

  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemapXml, "utf8");

  const rssItems = posts.slice(0, 30).map((p) => {
    const link = `${baseUrl}posts/${encodeURIComponent(p.slug)}/`;
    const pubDate = p.publishedAt ? new Date(p.publishedAt).toUTCString() : new Date().toUTCString();
    const desc = p.excerpt ?? "";
    return (
      `    <item>\n` +
      `      <title>${xmlEscape(p.title)}</title>\n` +
      `      <link>${xmlEscape(link)}</link>\n` +
      `      <guid>${xmlEscape(link)}</guid>\n` +
      `      <pubDate>${xmlEscape(pubDate)}</pubDate>\n` +
      `      <description>${xmlEscape(desc)}</description>\n` +
      `    </item>`
    );
  });

  const rssXml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0">\n` +
    `  <channel>\n` +
    `    <title>${xmlEscape(siteName)}</title>\n` +
    `    <link>${xmlEscape(baseUrl)}</link>\n` +
    `    <description>${xmlEscape(siteDescription)}</description>\n` +
    `    <language>vi</language>\n` +
    rssItems.join("\n") +
    `\n  </channel>\n` +
    `</rss>\n`;

  fs.writeFileSync(path.join(publicDir, "rss.xml"), rssXml, "utf8");

  console.log(`Synced ${posts.length} posts, ${tags.length} tags`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
