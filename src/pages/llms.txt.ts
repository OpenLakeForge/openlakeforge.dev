/** /llms.txt (https://llmstxt.org/): an index of every docs page, each linked to its Markdown. */
import type { APIRoute } from "astro";
import { changelog, docsRef, docsSections, llmsSummary, llmsTitle, markdownHref, schemaFiles, schemaHref } from "../lib/llms";

export const GET: APIRoute = async ({ site }) => {
  const base = site!;
  const link = (path: string) => new URL(path, base).href;
  const lines = [
    llmsTitle,
    "",
    llmsSummary,
    "",
    `These docs are synced from the openlakeforge repository at release \`${docsRef}\`. Every page below links to its Markdown source; append \`.md\` to a docs URL to get the same. Pages use Starlight asides (\`:::note\`, \`:::caution\`).`,
    "",
    `- [Complete documentation](${link("/llms-full.txt")}): every page below in one file, plus the JSON Schemas`,
    `- [Abridged documentation](${link("/llms-small.txt")}): the same pages without the decision records, notes, tips and footers`,
  ];
  for (const { label, pages } of await docsSections()) {
    lines.push("", `## ${label}`, "");
    for (const { id, data } of pages) {
      lines.push(`- [${data.title}](${link(markdownHref(id))})${data.description ? `: ${data.description}` : ""}`);
    }
  }
  if (schemaFiles.length > 0) {
    lines.push("", "## JSON Schemas", "", "The schemas `olf` validates a project's files against.", "");
    for (const { file, title } of schemaFiles) lines.push(`- [${title}](${link(schemaHref(file))}): \`${file}\``);
  }
  const log = await changelog();
  lines.push("", "## Optional", "");
  if (log) lines.push(`- [Changelog](${link(markdownHref(log.id))}): the release notes of every version`);
  lines.push("- [Source repository](https://github.com/OpenLakeForge/openlakeforge): the platform, its docs and the `olf` CLI");
  return new Response(`${lines.join("\n")}\n`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
