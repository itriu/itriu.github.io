export type GeneratedPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverUrl: string | null;
  publishedAt: string | null;
  updatedAt: string | null;
};

export type GeneratedTag = { id: string; name: string; slug: string };
export type GeneratedPostTag = { postId: string; tagId: string };

export const contentAssetTag = "dev" as const;
export const adminBaseUrl = "https://itriu.vercel.app/" as const;
export const posts: GeneratedPost[] = [];
export const tags: GeneratedTag[] = [];
export const postTags: GeneratedPostTag[] = [];
