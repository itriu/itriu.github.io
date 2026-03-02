import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { posts, postTags, tags, type GeneratedPost, type GeneratedTag } from "@/generated/content";

type Props = { tag: GeneratedTag; taggedPosts: GeneratedPost[] };

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: tags.map((t) => ({ params: { slug: t.slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props> = async (ctx) => {
  const slug = String(ctx.params?.slug ?? "");
  const tag = tags.find((t) => t.slug === slug);
  if (!tag) return { notFound: true };

  const postIds = new Set(postTags.filter((r) => r.tagId === tag.id).map((r) => r.postId));
  const taggedPosts = posts.filter((p) => postIds.has(p.id));

  return {
    props: {
      tag,
      taggedPosts,
    },
  };
};

export default function TagPage({ tag, taggedPosts }: Props) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="text-sm">
        <Link className="underline text-zinc-700" href="/tags/">
          ← Tất cả tags
        </Link>
      </div>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight">{tag.name}</h1>

      {taggedPosts.length === 0 ? (
        <p className="mt-4 text-zinc-600">Chưa có bài viết nào trong tag này.</p>
      ) : (
        <div className="mt-6 grid gap-4">
          {taggedPosts.map((p) => (
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
