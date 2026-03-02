import Link from "next/link";
import { tags, postTags } from "@/generated/content";

export default function TagsPage() {
  const counts = new Map<string, number>();
  for (const rel of postTags) counts.set(rel.tagId, (counts.get(rel.tagId) ?? 0) + 1);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Tags</h1>

      {tags.length === 0 ? (
        <p className="mt-4 text-zinc-600">Chưa có tag nào.</p>
      ) : (
        <div className="mt-6 flex flex-wrap gap-2">
          {tags.map((t) => (
            <Link
              key={t.id}
              href={`/tags/${t.slug}`}
              className="rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-800"
            >
              {t.name} ({counts.get(t.id) ?? 0})
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
