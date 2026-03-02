import { marked } from "marked";
import { rewriteGoProtocol } from "@/lib/shortlinks";

const renderer = new marked.Renderer();

renderer.link = (token) => {
  const href = token.href ?? "";
  const rewritten = rewriteGoProtocol(href);
  const finalHref = rewritten ?? href;

  const text = token.text ?? "";
  const titleAttr = token.title ? ` title="${escapeHtmlAttr(token.title)}"` : "";

  const isExternal = /^https?:\/\//i.test(finalHref);
  const rel = isExternal ? "noopener noreferrer" : "";
  const target = isExternal ? "_blank" : "";

  const relAttr = rel ? ` rel="${rel}"` : "";
  const targetAttr = target ? ` target="${target}"` : "";

  return `<a href="${escapeHtmlAttr(finalHref)}"${titleAttr}${targetAttr}${relAttr}>${text}</a>`;
};

export function renderMarkdown(md: string) {
  return marked.parse(md ?? "", { renderer }) as string;
}

function escapeHtmlAttr(input: string) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
