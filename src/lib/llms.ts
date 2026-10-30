/**
 * The docs as plain Markdown for AI agents (PLAN.md, Phase 6): /llms.txt,
 * /llms-full.txt, /llms-small.txt and one /<page>.md per docs page. The synced
 * pages are Markdown already, so agents get their source, not rendered HTML.
 */
import { getCollection, type CollectionEntry } from "astro:content";
import sidebar from "../generated/sidebar.json";
import release from "../generated/release.json";

type Entry = CollectionEntry<"docs">;
type SidebarItem = { label?: string; slug?: string; items?: SidebarItem[]; autogenerate?: { directory: string } };

export interface Section {
  label: string;
  pages: Entry[];
}

export interface Schema {
  file: string;
  title: string;
}

export const schemaFiles: Schema[] = release.schemas;
export const schemaHref = (file: string) => `/docs-assets/docs/schema/${file}`;

/** The released platform version the docs are synced from. */
export const docsRef = release.ref;

/** The page's Markdown twin: /docs/get-started/quickstart/ → /docs/get-started/quickstart.md. */
export const markdownHref = (id: string) => `/${id}.md`;

/** Pages served as Markdown: the synced docs and the changelog, not the style guide. */
export const isAgentPage = (id: string) => id === "docs" || id.startsWith("docs/") || id === "changelog";

export const isDecisionRecord = (id: string) => id === "docs/adr" || id.startsWith("docs/adr/");

/** Every synced docs page, grouped and ordered as the sidebar shows them. */
export async function docsSections(): Promise<Section[]> {
  const entries = (await getCollection("docs")).filter(({ id }) => id === "docs" || id.startsWith("docs/"));
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  const placed = new Set<string>();
  const take = (id: string) => {
    const entry = byId.get(id);
    if (!entry || placed.has(id)) return [];
    placed.add(id);
    return [entry];
  };
  const collect = (items: SidebarItem[]): Entry[] =>
    items.flatMap((item) => {
      if (item.slug !== undefined) return take(item.slug);
      if (item.items) return collect(item.items);
      if (item.autogenerate) {
        const dir = item.autogenerate.directory.replace(/\/$/, "");
        const children = entries.map(({ id }) => id).filter((id) => id.startsWith(`${dir}/`)).sort();
        return [dir, ...children].flatMap(take);
      }
      return [];
    });

  const sections = (sidebar as SidebarItem[])
    .map((group) => ({ label: group.label ?? "Docs", pages: collect(group.items ?? [group]) }))
    .filter(({ pages }) => pages.length > 0);
  const rest = entries.filter(({ id }) => !placed.has(id)).sort((a, b) => a.id.localeCompare(b.id));
  if (rest.length > 0) sections.push({ label: "More", pages: rest });
  return sections;
}

export async function changelog(): Promise<Entry | undefined> {
  return (await getCollection("docs")).find(({ id }) => id === "changelog");
}

/** Root-relative links and images become absolute, so they work outside the site. */
export function absoluteLinks(markdown: string, site: URL): string {
  return markdown.replace(/(\]\(|href="|src=")\/(?!\/)/g, (_, open) => `${open}${new URL("/", site)}`);
}

/** One page as Markdown: its title, description and source, then its body. */
export function pageMarkdown(entry: Entry, site: URL): string {
  const { title, description } = entry.data;
  const url = new URL(entry.id === "docs" ? "/docs/" : `/${entry.id}/`, site);
  const head = [`# ${title}`];
  if (description) head.push(`> ${description}`);
  head.push(`Source: ${url}`);
  return `${head.join("\n\n")}\n\n${absoluteLinks((entry.body ?? "").trim(), site)}\n`;
}

/**
 * The abridged version: drops the note and tip asides, HTML <details> and the
 * "Synced from" footers, and squeezes blank lines. Cautions and dangers stay,
 * since they keep an agent out of trouble.
 */
export function abridge(markdown: string): string {
  return markdown
    .replace(/^:::(note|tip)\b[^\n]*\n[\s\S]*?^:::[ \t]*$\n?/gm, "")
    .replace(/<details\b[\s\S]*?<\/details>\n?/g, "")
    .replace(/^<small>Synced from[^\n]*<\/small>[ \t]*$\n?/gm, "")
    .replace(/\n{3,}/g, "\n\n");
}

/** The header shared by the three llms files. */
export const llmsTitle = "# OpenLakeForge";
export const llmsSummary =
  "> OpenLakeForge is an open-source lakehouse platform defined as code: infrastructure, data contracts, " +
  "SQL models, pipelines, dashboards and CI live in one Git repository, deployed by the `olf` CLI on local " +
  "Kubernetes (kind) today, with AWS and Azure in preview. The stack is Apache Iceberg, Apache Polaris, Trino, dlt, Floe, dbt, " +
  "Dagster, Superset and OpenMetadata.";
