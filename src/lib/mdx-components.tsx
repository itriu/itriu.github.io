import type { ComponentProps, ReactNode } from "react";
import { rewriteGoProtocol, toShortlinkHref } from "@/lib/shortlinks";

function MdxA(props: ComponentProps<"a">) {
  const href = typeof props.href === "string" ? props.href : "";
  const rewritten = rewriteGoProtocol(href);
  const finalHref = rewritten ?? href;

  const isExternal = /^https?:\/\//i.test(finalHref);
  const rel = isExternal ? "noopener noreferrer" : undefined;
  const target = isExternal ? "_blank" : undefined;

  return <a {...props} href={finalHref} rel={rel} target={target} />;
}

function Callout({
  type,
  children,
}: {
  type?: "info" | "warn" | "danger";
  children?: ReactNode;
}) {
  const t = type ?? "info";
  const cls =
    t === "warn"
      ? "border-amber-200 bg-amber-50"
      : t === "danger"
        ? "border-red-200 bg-red-50"
        : "border-zinc-200 bg-zinc-50";

  return <div className={`my-4 rounded-lg border p-4 text-sm text-zinc-800 ${cls}`}>{children}</div>;
}

function Button({
  href,
  children,
}: {
  href: string;
  children?: ReactNode;
}) {
  const rewritten = rewriteGoProtocol(href);
  const finalHref = rewritten ?? href;

  const isExternal = /^https?:\/\//i.test(finalHref);
  const rel = isExternal ? "noopener noreferrer" : undefined;
  const target = isExternal ? "_blank" : undefined;

  return (
    <a
      className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
      href={finalHref}
      rel={rel}
      target={target}
    >
      {children}
    </a>
  );
}

function Deal({
  code,
  title,
  price,
  children,
}: {
  code: string;
  title?: string;
  price?: string;
  children?: ReactNode;
}) {
  const href = toShortlinkHref(code);
  return (
    <div className="my-6 rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-zinc-900">{title ?? code}</div>
          {price ? <div className="mt-1 text-sm text-zinc-600">{price}</div> : null}
        </div>
        {href ? (
          <a
            className="shrink-0 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            Mua ngay
          </a>
        ) : null}
      </div>
      {children ? <div className="mt-3 text-sm text-zinc-700">{children}</div> : null}
    </div>
  );
}

export const mdxComponents = {
  a: MdxA,
  Callout,
  Button,
  Deal,
};
