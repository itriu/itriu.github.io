import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { posts, type GeneratedPost } from "@/generated/content";
import { renderMarkdown } from "@/lib/markdown";

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: posts.map((p) => ({ params: { slug: p.slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<{ post: GeneratedPost; html: string }> = async (ctx) => {
  const slug = String(ctx.params?.slug ?? "");
  const post = posts.find((p) => p.slug === slug);
  if (!post) return { notFound: true };

  const html = renderMarkdown(post.content);

  return {
    props: {
      post,
      html,
    },
  };
};

export default function PostPage({ post, html }: { post: GeneratedPost; html: string }) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="text-sm">
        <Link className="underline text-zinc-700" href="/posts/">
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
