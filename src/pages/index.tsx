export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Shopee Affiliate</h1>
        <p className="mt-3 text-zinc-600">
          Trang này được build tĩnh từ GitHub Pages và đồng bộ theme từ database.
        </p>

        <div className="mt-8 grid gap-3">
          <a
            className="inline-flex w-fit items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
            href="https://itriu.vercel.app/admin"
            target="_blank"
            rel="noreferrer"
          >
            Mở Admin
          </a>

          <a className="w-fit text-sm text-zinc-700 underline" href="/posts/">
            Xem bài viết
          </a>

          <a className="w-fit text-sm text-zinc-700 underline" href="/tags/">
            Xem tags
          </a>
        </div>

        <div className="mt-10 rounded-lg border border-zinc-200 p-4 text-sm text-zinc-700">
          Nếu bạn thấy trang này, nghĩa là GitHub Pages deploy đã OK. Bước tiếp theo là tạo bài viết và
          render theo layout/theme.
        </div>
      </main>
    </div>
  );
}
