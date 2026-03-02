import Link from "next/link";
import { posts } from "@/generated/content";

export default function PostsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Bài viết</h1>

      {posts.length === 0 ? (
        <p className="mt-4 text-zinc-600">Chưa có bài viết nào.</p>
      ) : (
        <div className="mt-6 grid gap-4">
          {posts.map((p) => (
            <article key={p.id} className="rounded-lg border border-zinc-200 p-4">
              <h2 className="text-lg font-semibold">
                <Link className="underline" href={`/posts/${p.slug}`}> 
                  {p.title}
                </Link>
              </h2>
              {p.excerpt ? <p className="mt-2 text-zinc-600">{p.excerpt}</p> : null}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
