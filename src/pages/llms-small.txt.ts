/**
 * /llms-small.txt: for a shorter context, the docs without the decision records
 * (half the text, and history rather than how-to), notes, tips, details or footers.
 */
import type { APIRoute } from "astro";
import { abridge, isDecisionRecord, docsRef, docsSections, llmsSummary, llmsTitle, pageMarkdown } from "../lib/llms";

export const GET: APIRoute = async ({ site }) => {
  const base = site!;
  const parts = [`${llmsTitle}\n\n${llmsSummary}\n\nThe abridged documentation of release \`${docsRef}\`.\n`];
  for (const { pages } of await docsSections()) {
    parts.push(...pages.filter(({ id }) => !isDecisionRecord(id)).map((entry) => abridge(pageMarkdown(entry, base))));
  }
  return new Response(parts.join("\n---\n\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
