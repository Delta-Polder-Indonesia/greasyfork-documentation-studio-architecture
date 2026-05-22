import { allowedTags, globalAllowedAttributes, tagAttributes, type AllowedTag } from "@/lib/greasyforkSchema";
import { hasProtocol, isHttpUrl, isRelativeUrl } from "@/utils/url";
import type { ValidationWarning } from "@/types/editor";
import DOMPurify from "dompurify";

const ALLOWED_IFRAME_PREFIXES = [
  "https://www.youtube.com/",
  "https://www.youtube-nocookie.com/",
  "https://player.bilibili.com/player.html",
];

const allowedTagSet = new Set(allowedTags);
const dropContentTags = new Set(["script", "style", "object", "embed", "link", "meta"]);

function isAllowedUrlByContext(tag: AllowedTag, attr: string, value: string): boolean {
  if ((attr === "href" && tag === "a") || (attr === "cite" && (tag === "blockquote" || tag === "q"))) {
    return hasProtocol(value, ["http", "https", "mailto", "ftp"]) || isRelativeUrl(value) || isHttpUrl(value);
  }

  if (tag === "iframe" && attr === "src") {
    return ALLOWED_IFRAME_PREFIXES.some((prefix) => value.startsWith(prefix));
  }

  if ((tag === "img" || tag === "video") && attr === "src") {
    return value.toLowerCase().startsWith("https://");
  }

  if (tag === "video" && attr === "poster") {
    return value.toLowerCase().startsWith("https://");
  }

  if (tag === "time" && attr === "datetime") {
    return Boolean(value.trim());
  }

  return true;
}

export function sanitizeGreasyforkHtml(input: string): { sanitizedHtml: string; warnings: ValidationWarning[] } {
  const parser = new DOMParser();
  const documentNode = parser.parseFromString(`<div id="gf-root">${input}</div>`, "text/html");
  const root = documentNode.getElementById("gf-root");
  const warnings: ValidationWarning[] = [];

  if (!root) {
    return { sanitizedHtml: "", warnings: [{ message: "Tidak bisa memproses konten HTML." }] };
  }

  const walk = (node: Node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    const element = node as HTMLElement;
    const tag = element.tagName.toLowerCase();

    if (!allowedTagSet.has(tag as AllowedTag)) {
      warnings.push({ message: `Tag <${tag}> dihapus karena tidak diizinkan.`, tag });
      const parent = element.parentNode;
      if (parent) {
        if (!dropContentTags.has(tag)) {
          while (element.firstChild) {
            parent.insertBefore(element.firstChild, element);
          }
        }
        parent.removeChild(element);
      }
      return;
    }

    const allowedForTag = new Set(tagAttributes[tag as AllowedTag]);

    for (const attr of [...element.attributes]) {
      const attrName = attr.name.toLowerCase();
      const attrValue = attr.value.trim();

      if (attrName.startsWith("on")) {
        element.removeAttribute(attr.name);
        warnings.push({
          message: `Event handler ${attrName} dihapus dari <${tag}>.`,
          tag,
          attribute: attrName,
        });
        continue;
      }

      const isKnownAttribute = allowedForTag.has(attrName) || globalAllowedAttributes.has(attrName);
      if (!isKnownAttribute) {
        element.removeAttribute(attr.name);
        warnings.push({
          message: `Attribute ${attrName} dihapus dari <${tag}>.`,
          tag,
          attribute: attrName,
        });
        continue;
      }

      if (!isAllowedUrlByContext(tag as AllowedTag, attrName, attrValue)) {
        element.removeAttribute(attr.name);
        warnings.push({
          message: `Nilai attribute ${attrName} pada <${tag}> tidak valid untuk GreasyFork.`,
          tag,
          attribute: attrName,
        });
      }
    }

    for (const child of [...element.childNodes]) {
      walk(child);
    }
  };

  for (const child of [...root.childNodes]) {
    walk(child);
  }

  const purified = DOMPurify.sanitize(root.innerHTML, {
    FORBID_TAGS: ["script", "style"],
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });

  return {
    sanitizedHtml: purified,
    warnings,
  };
}
