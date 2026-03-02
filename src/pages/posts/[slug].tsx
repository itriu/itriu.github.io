import type { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import { posts, type GeneratedPost } from "@/generated/content";
import { mdxComponents } from "@/lib/mdx-components";

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: posts.map((p) => ({ params: { slug: p.slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<{
  post: GeneratedPost;
  mdxSource: MDXRemoteSerializeResult;
}> = async (ctx) => {
  const slug = String(ctx.params?.slug ?? "");
  const post = posts.find((p) => p.slug === slug);
  if (!post) return { notFound: true };

  const mdxSource = await serialize(post.content);

  return {
    props: {
      post,
      mdxSource,
    },
  };
};

export default function PostPage({
  post,
  mdxSource,
}: {
  post: GeneratedPost;
  mdxSource: MDXRemoteSerializeResult;
}) {
  const siteBaseUrl = (process.env.NEXT_PUBLIC_SITE_BASE_URL ?? "https://itriu.github.io").replace(/\/$/, "");
  const canonicalUrl = `${siteBaseUrl}/posts/${encodeURIComponent(post.slug)}`;
  const description = post.excerpt ?? "";
  const ogImage = post.coverUrl ?? undefined;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: description || undefined,
    datePublished: post.publishedAt || undefined,
    dateModified: post.updatedAt || post.publishedAt || undefined,
    mainEntityOfPage: canonicalUrl,
    image: ogImage ? [ogImage] : undefined,
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Head>
        <title>{post.title}</title>
        {description ? <meta name="description" content={description} /> : null}
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        {description ? <meta property="og:description" content={description} /> : null}
        <meta property="og:url" content={canonicalUrl} />
        {ogImage ? <meta property="og:image" content={ogImage} /> : null}

        <meta name="twitter:card" content={ogImage ? "summary_large_image" : "summary"} />
        <meta name="twitter:title" content={post.title} />
        {description ? <meta name="twitter:description" content={description} /> : null}
        {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      </Head>

      <div className="text-sm">
        <Link className="underline text-zinc-700" href="/posts/">
          ← Tất cả bài viết
        </Link>
      </div>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight">{post.title}</h1>
      {post.excerpt ? <p className="mt-3 text-zinc-600">{post.excerpt}</p> : null}

      {post.coverUrl ? (
        <div className="mt-8 overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <img className="h-auto w-full" src={post.coverUrl} alt={post.title} loading="lazy" />
        </div>
      ) : null}

      <article className="prose prose-zinc mt-10 max-w-none">
        <MDXRemote {...mdxSource} components={mdxComponents} />
      </article>
    </main>
  );
}
