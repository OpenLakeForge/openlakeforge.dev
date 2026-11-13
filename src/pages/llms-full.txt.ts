/** /llms-full.txt: every docs page in sidebar order, then the Floe docs, then the JSON Schemas. */
import type { APIRoute } from "astro";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { docsRef, docsSections, floeRef, floeSummary, llmsSummary, llmsTitle, pageMarkdown, schemaFiles, schemaHref } from "../lib/llms";

export const GET: APIRoute = async ({ site }) => {
  const base = site!;
  const parts = [`${llmsTitle}\n\n${llmsSummary}\n\nThe complete documentation of release \`${docsRef}\`.\n`];
  for (const { pages } of await docsSections()) parts.push(...pages.map((entry) => pageMarkdown(entry, base)));
  const floe = await docsSections("floe");
  if (floe.length > 0) parts.push(`# Floe\n\n${floeSummary}\n\nThe Floe documentation at \`${floeRef}\`.\n`);
  for (const { pages } of floe) parts.push(...pages.map((entry) => pageMarkdown(entry, base)));
  for (const { file, title } of schemaFiles) {
    const schema = readFileSync(join(process.cwd(), "public", schemaHref(file)), "utf8");
    parts.push(`# JSON Schema: ${title} (\`${file}\`)\n\n\`\`\`json\n${schema.trim()}\n\`\`\`\n`);
  }
  return new Response(parts.join("\n---\n\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
