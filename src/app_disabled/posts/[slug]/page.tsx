import { notFound } from "next/navigation";
import Link from "next/link";
import { marked } from "marked";
import { posts } from "@/generated/content";

export function generateStaticParams() {
  return posts.map((p) => ({
    slug: p.slug,
  }));
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return notFound();

  const html = marked.parse(post.content) as string;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="text-sm">
        <Link className="underline text-zinc-700" href="/posts">
          ← Tất cả bài viết
        </Link>
      </div>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight">{post.title}</h1>
      {post.excerpt ? <p className="mt-3 text-zinc-600">{post.excerpt}</p> : null}

      <article
        className="prose prose-zinc mt-10 max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </main>
  );
}
