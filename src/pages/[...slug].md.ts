/** Each docs page's Markdown twin: /docs/get-started/quickstart.md, linked from /llms.txt and the copy button. */
import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { isAgentPage, pageMarkdown } from "../lib/llms";

export const getStaticPaths = (async () =>
  (await getCollection("docs"))
    .filter(({ id }) => isAgentPage(id))
    .map((entry) => ({ params: { slug: entry.id }, props: { entry } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props, site }) =>
  new Response(pageMarkdown(props.entry, site!), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
