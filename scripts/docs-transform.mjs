// Pure transforms from an openlakeforge Markdown page to a Starlight page
// (PLAN.md, Phase 3). No I/O here, so every rule is unit-tested.

import { posix } from "node:path";

const FENCE = /^ {0,3}(`{3,}|~{3,})/;
const ALERTS = { NOTE: "note", TIP: "tip", IMPORTANT: "note", WARNING: "caution", CAUTION: "danger" };
const SCHEME = /^[a-z][a-z0-9+.-]*:/i;

/** Lines outside fenced code blocks are prose; `fn` sees each with that flag. */
function mapProse(lines, fn) {
  let fence = null;
  return lines.map((line, index) => {
    const opener = FENCE.exec(line);
    if (opener && fence === null) {
      fence = opener[1];
      return line;
    }
    // A closing fence is the delimiter alone: ```js inside a ``` block is code.
    const bare = opener && line.slice(opener[0].length).trim() === "";
    if (bare && fence && opener[1][0] === fence[0] && opener[1].length >= fence.length) {
      fence = null;
      return line;
    }
    return fence === null ? fn(line, index) : line;
  });
}

/** For each line, whether it belongs to a fenced code block, delimiters included. */
function fencedLines(lines) {
  const prose = new Set();
  mapProse(lines, (line, index) => {
    prose.add(index);
    return line;
  });
  return lines.map((_, index) => !prose.has(index));
}

/** T1: the first `# ` heading outside code is the title, removed from the body. */
export function extractTitle(markdown) {
  const lines = markdown.split("\n");
  let title = null;
  let at = -1;
  mapProse(lines, (line, index) => {
    if (title === null) {
      const match = /^# (.+?)\s*#*\s*$/.exec(line);
      if (match) {
        title = plainText(match[1]);
        at = index;
      }
    }
    return line;
  });
  // The description is read after the title: a page can open with a comment
  // or a badge that is not its summary.
  const afterTitle = at >= 0 ? lines.slice(at + 1).join("\n") : markdown;
  if (at >= 0) lines.splice(at, 1);
  return { title, body: lines.join("\n").replace(/^\n+/, ""), afterTitle };
}

/** Inline Markdown as plain text, for titles and descriptions: links keep their
 * text, code loses its backticks, emphasis loses its delimiters, and
 * underscores inside words such as `PROJECT_CODE` stay. */
function plainText(markdown) {
  return markdown
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`/g, "")
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .replace(/(^|[^\w*])[*_]([^*_]+)[*_](?![\w*])/g, "$1$2");
}

/** T2: the first paragraph, as plain text, at most 160 characters. */
export function extractDescription(body) {
  const paragraph = [];
  const lines = body.split("\n");
  const fenced = fencedLines(lines);
  for (const [index, line] of lines.entries()) {
    if (fenced[index]) {
      if (paragraph.length) break;
      continue;
    }
    const text = line.trim();
    if (!text) {
      if (paragraph.length) break;
      continue;
    }
    if (/^(#|>|```|~~~|<|\||[-*+] |\d+\. )/.test(text) || /^([-*_])(\s*\1){2,}$/.test(text)) {
      if (paragraph.length) break;
      continue;
    }
    paragraph.push(text);
  }
  const plain = plainText(paragraph.join(" ")).replace(/\s+/g, " ").trim();
  return plain.length <= 160 ? plain : `${plain.slice(0, 157).replace(/\s+\S*$/, "")}…`;
}

/** T3: the site slug of a repository path, README as the folder index. */
export function defaultSlug(repoPath) {
  const path = repoPath.replace(/^docs\//, "").replace(/\.md$/, "");
  if (path === "README") return "";
  return path.endsWith("/README") ? path.slice(0, -"/README".length) : path;
}

/** The site route of a slug under the docs collection. */
export function routeFor(slug) {
  return slug ? `/docs/${slug}/` : "/docs/";
}

/**
 * T4: rewrite one link target found in `sourcePath`.
 * `published` maps repository paths to slugs; `assets` collects images to copy.
 */
export function rewriteTarget(target, { sourcePath, published, repoUrl, ref, assets }) {
  if (!target || target.startsWith("#") || target.startsWith("//") || SCHEME.test(target)) return target;
  const [pathPart, anchor] = splitAnchor(target);
  const repoPath = pathPart.startsWith("/")
    ? posix.normalize(pathPart.slice(1))
    : posix.normalize(posix.join(posix.dirname(sourcePath), decodeURI(pathPart)));
  if (repoPath.startsWith("..")) return target;
  if (repoPath in published) return routeFor(published[repoPath]) + (anchor ? `#${anchor}` : "");
  if (/\.(svg|png|jpe?g|gif|webp)$/i.test(repoPath)) {
    assets.add(repoPath);
    return `/docs-assets/${repoPath}`;
  }
  const kind = posix.extname(repoPath) ? "blob" : "tree";
  return `${repoUrl}/${kind}/${ref}/${repoPath}${anchor ? `#${anchor}` : ""}`;
}

function splitAnchor(target) {
  const at = target.indexOf("#");
  return at < 0 ? [target, ""] : [target.slice(0, at), target.slice(at + 1)];
}

/** T4 and T5 over a whole body: Markdown links and images, and HTML src/srcset/href. */
export function rewriteLinks(body, context) {
  const rewrite = (target) => rewriteTarget(target, context);
  return mapProse(body.split("\n"), (line) =>
    line
      .replace(/\]\(\s*<([^>]*)>/g, (_, target) => `](<${rewrite(target)}>`)
      .replace(/\]\(\s*([^)\s<>]+)/g, (_, target) => `](${rewrite(target)}`)
      .replace(/^(\s{0,3}\[[^\]^][^\]]*\]:\s*)(\S+)/, (_, head, target) => head + rewrite(target))
      .replace(/\b(src|href)=(["'])([^"']+)\2/gi, (_, name, quote, target) => `${name}=${quote}${rewrite(target)}${quote}`)
      .replace(/\bsrcset=(["'])([^"']+)\1/gi, (_, quote, value) =>
        `srcset=${quote}${value
          .split(",")
          .map((part) => part.trim().replace(/^\S+/, (url) => rewrite(url)))
          .join(", ")}${quote}`,
      ),
  ).join("\n");
}

/** T6: GitHub alerts become Starlight asides. */
export function convertAlerts(body) {
  const lines = body.split("\n");
  const fenced = fencedLines(lines);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const head = !fenced[i] && /^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*$/.exec(lines[i]);
    if (!head) {
      out.push(lines[i]);
      continue;
    }
    out.push(`:::${ALERTS[head[1]]}`);
    while (i + 1 < lines.length && /^>/.test(lines[i + 1])) {
      out.push(lines[++i].replace(/^>\s?/, ""));
    }
    out.push(":::");
  }
  return out.join("\n");
}

/** The whole page: frontmatter (T1, T2, T7), transformed body and provenance (T8). */
export function transformPage(markdown, { sourcePath, title: titleOverride, published, repoUrl, ref, sha, assets }) {
  const { title, body, afterTitle } = extractTitle(markdown);
  const pageTitle = titleOverride ?? title ?? posix.basename(sourcePath, ".md");
  const description = extractDescription(afterTitle);
  const transformed = convertAlerts(rewriteLinks(body, { sourcePath, published, repoUrl, ref, assets }));
  const frontmatter = [
    "---",
    `title: ${JSON.stringify(pageTitle)}`,
    ...(description ? [`description: ${JSON.stringify(description)}`] : []),
    `editUrl: ${JSON.stringify(`${repoUrl}/edit/main/${sourcePath}`)}`,
    "---",
  ].join("\n");
  const provenance = `\n\n---\n\n<small>Synced from openlakeforge @ \`${ref}\` (\`${sha.slice(0, 7)}\`), [${sourcePath}](${repoUrl}/blob/${sha}/${sourcePath}).</small>\n`;
  return `${frontmatter}\n\n${transformed.trimEnd()}${provenance}`;
}

/** The published pages and the Starlight sidebar from `docs/navigation.yaml`. */
export function readNavigation(navigation, listMarkdown) {
  const published = {};
  const titles = {};
  const sidebar = [];
  // An empty or misshapen manifest would publish nothing and wipe the docs, so
  // it fails the build instead.
  if (!Array.isArray(navigation?.sections) || navigation.sections.length === 0) {
    throw new Error("docs/navigation.yaml must have a non-empty `sections` list");
  }
  for (const section of navigation.sections) {
    const items = [];
    for (const item of section.items ?? []) {
      const path = typeof item === "string" ? item : item.path;
      const slug = typeof item === "object" && item.slug ? item.slug.replace(/^\/|\/$/g, "") : defaultSlug(path);
      published[path] = safeSlug(path, slug);
      if (typeof item === "object" && item.title) titles[path] = item.title;
      items.push({ slug: slug ? `docs/${slug}` : "docs" });
    }
    if (section.autogenerate) {
      safeSlug(section.autogenerate, section.autogenerate.replace(/\/$/, ""));
      for (const path of listMarkdown(section.autogenerate)) published[path] = safeSlug(path, defaultSlug(path));
      const directory = section.autogenerate.replace(/^docs\//, "").replace(/\/$/, "");
      items.push({ autogenerate: { directory: `docs/${directory}` } });
    }
    sidebar.push({ label: section.label, items });
  }
  return { published, titles, sidebar };
}

/** A slug becomes a file path under the content directory, so it may not climb out of it. */
function safeSlug(path, slug) {
  if (!/^([a-z0-9][a-z0-9/_.-]*)?$/i.test(slug) || slug.split("/").includes("..")) {
    throw new Error(`docs/navigation.yaml: ${path} has an unsafe slug or directory: ${slug}`);
  }
  return slug;
}
