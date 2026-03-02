import { adminBaseUrl } from "@/generated/content";

export function toShortlinkHref(code: string) {
  const c = String(code ?? "").trim();
  if (!c) return null;
  const base = String(adminBaseUrl ?? "").replace(/\/+$/, "");
  if (!base) return null;
  return `${base}/go/${encodeURIComponent(c)}`;
}

export function rewriteGoProtocol(href: string) {
  const h = String(href ?? "");
  if (h.toLowerCase().startsWith("go:")) {
    const code = h.slice(3);
    return toShortlinkHref(code);
  }
  if (h.toLowerCase().startsWith("short:")) {
    const code = h.slice(6);
    return toShortlinkHref(code);
  }
  return null;
}
