import { allowedTags, tagAttributes, tagCategories, type AllowedTag } from "@/lib/greasyforkSchema";

export interface TagDoc {
  tag: AllowedTag;
  category: string;
  description: string;
  attributes: string[];
  example: string;
  snippet: string;
}

const exampleMap: Partial<Record<AllowedTag, string>> = {
  a: `<a href="https://example.com">Buka docs</a>`,
  img: `<img src="https://example.com/image.png" alt="Example">`,
  iframe:
    `<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" width="560" height="315" allowfullscreen></iframe>`,
  video: `<video src="https://example.com/video.mp4" width="640" height="360" poster="https://example.com/poster.jpg"></video>`,
  details: `<details open><summary>Show details</summary><p>Isi dokumentasi.</p></details>`,
  code: `<code>const message = "hello";</code>`,
  pre: `<pre><code>npm run build</code></pre>`,
  table: `<table><thead><tr><th>Version</th><th>Note</th></tr></thead><tbody><tr><td>1.0.0</td><td>Initial release</td></tr></tbody></table>`,
};

function createDefaultExample(tag: AllowedTag): string {
  if (["br", "hr"].includes(tag)) {
    return `<${tag}>`;
  }
  return `<${tag}>Contoh ${tag}</${tag}>`;
}

function createDefaultSnippet(tag: AllowedTag): string {
  if (["br", "hr"].includes(tag)) {
    return `<${tag}>\n`;
  }
  if (tag === "img") {
    return `<img src="https://" alt="">\n`;
  }
  if (tag === "iframe") {
    return `<iframe src="https://www.youtube.com/" width="560" height="315" allowfullscreen></iframe>\n`;
  }
  if (tag === "video") {
    return `<video src="https://" width="640" height="360"></video>\n`;
  }
  return `<${tag}></${tag}>\n`;
}

export const tagDocs: TagDoc[] = allowedTags.map((tag) => ({
  tag,
  category: tagCategories[tag],
  description: `Tag <${tag}> diizinkan untuk dokumentasi GreasyFork dan bisa dipakai pada konten deskripsi script.`,
  attributes: tagAttributes[tag],
  example: exampleMap[tag] ?? createDefaultExample(tag),
  snippet: createDefaultSnippet(tag),
}));
