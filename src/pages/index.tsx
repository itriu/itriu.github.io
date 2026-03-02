import Link from "next/link";
import { posts, postTags, tags } from "@/generated/content";

function formatDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("vi-VN");
}

export default function Home() {
  const featured = posts.slice(0, 3);
  const latest = posts.slice(0, 8);

  const tagCount = new Map<string, number>();
  for (const rel of postTags) {
    tagCount.set(rel.tagId, (tagCount.get(rel.tagId) ?? 0) + 1);
  }

  const popularTags = [...tags]
    .sort((a, b) => (tagCount.get(b.id) ?? 0) - (tagCount.get(a.id) ?? 0))
    .slice(0, 12);

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <main className="mx-auto max-w-5xl px-6 py-14">
        <header className="grid gap-6 rounded-2xl border border-zinc-200 bg-white p-8">
          <div>
            <div className="text-sm font-medium text-zinc-500">Shopee Affiliate</div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">Săn deal tốt, mua thông minh</h1>
            <p className="mt-3 max-w-2xl text-zinc-600">
              Tổng hợp bài viết, gợi ý sản phẩm và hướng dẫn mua hàng Shopee. Nội dung được cập nhật liên tục
              và build tĩnh cho tốc độ tải nhanh.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              className="inline-flex w-fit items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
              href="/posts/"
            >
              Xem bài viết
            </Link>
            <Link
              className="inline-flex w-fit items-center justify-center rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-900"
              href="/tags/"
            >
              Danh mục / Tags
            </Link>
            <a
              className="inline-flex w-fit items-center justify-center rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-900"
              href="https://itriu.vercel.app/admin"
              target="_blank"
              rel="noreferrer"
            >
              Admin
            </a>
          </div>
        </header>

        <section className="mt-10">
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Deal nổi bật</h2>
            <Link className="text-sm text-zinc-700 underline" href="/posts/">
              Xem tất cả
            </Link>
          </div>

          {featured.length === 0 ? (
            <p className="mt-4 text-zinc-600">Chưa có bài viết nào được publish.</p>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {featured.map((p) => (
                <article key={p.id} className="rounded-xl border border-zinc-200 p-5">
                  {p.coverUrl ? (
                    <div className="mb-3 overflow-hidden rounded-lg border border-zinc-200 bg-white">
                      <img className="h-auto w-full" src={p.coverUrl} alt={p.title} loading="lazy" />
                    </div>
                  ) : null}
                  <div className="text-xs font-medium text-zinc-500">{formatDate(p.publishedAt) ?? ""}</div>
                  <h3 className="mt-2 text-base font-semibold leading-6">
                    <Link className="underline" href={`/posts/${p.slug}`}>
                      {p.title}
                    </Link>
                  </h3>
                  {p.excerpt ? <p className="mt-2 text-sm text-zinc-600">{p.excerpt}</p> : null}
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10 grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="flex items-end justify-between">
              <h2 className="text-xl font-semibold tracking-tight">Bài mới</h2>
              <Link className="text-sm text-zinc-700 underline" href="/posts/">
                Xem tất cả
              </Link>
            </div>

            {latest.length === 0 ? (
              <p className="mt-4 text-zinc-600">Chưa có bài viết nào.</p>
            ) : (
              <div className="mt-4 grid gap-3">
                {latest.map((p) => (
                  <article key={p.id} className="rounded-xl border border-zinc-200 p-4">
                    {p.coverUrl ? (
                      <div className="mb-3 overflow-hidden rounded-lg border border-zinc-200 bg-white">
                        <img className="h-auto w-full" src={p.coverUrl} alt={p.title} loading="lazy" />
                      </div>
                    ) : null}
                    <div className="text-xs font-medium text-zinc-500">
                      {formatDate(p.publishedAt) ?? ""}
                    </div>
                    <h3 className="mt-1 text-base font-semibold">
                      <Link className="underline" href={`/posts/${p.slug}`}>
                        {p.title}
                      </Link>
                    </h3>
                    {p.excerpt ? <p className="mt-1 text-sm text-zinc-600">{p.excerpt}</p> : null}
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside>
            <h2 className="text-xl font-semibold tracking-tight">Danh mục</h2>
            {popularTags.length === 0 ? (
              <p className="mt-4 text-zinc-600">Chưa có tag nào.</p>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                {popularTags.map((t) => (
                  <Link
                    key={t.id}
                    href={`/tags/${t.slug}`}
                    className="rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-800"
                  >
                    {t.name}
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-6 rounded-xl border border-zinc-200 p-4 text-sm text-zinc-700">
              Mẹo: Bạn có thể publish bài mới trong Admin, GitHub Actions sẽ build lại và cập nhật trang
              này.
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
