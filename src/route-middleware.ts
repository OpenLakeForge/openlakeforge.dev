import { defineRouteMiddleware, type StarlightRouteData } from "@astrojs/starlight/route-data";

// One site, two sets of docs: OpenLakeForge under /docs/ and Floe under /floe/.
// Starlight builds one sidebar for both, so each page keeps only the groups of
// its own section, and previous/next links never cross from one to the other.
type Entry = StarlightRouteData["sidebar"][number];

const section = (href: string) => (href.startsWith("/floe/") ? "floe" : "docs");

/** The section of a sidebar entry: that of its first link. */
function entrySection(entry: Entry): string | undefined {
  if (entry.type === "link") return section(entry.href);
  for (const child of entry.entries) {
    const found = entrySection(child);
    if (found) return found;
  }
  return undefined;
}

export const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute;
  const current = section(context.url.pathname);
  route.sidebar = route.sidebar.filter((entry) => entrySection(entry) === current);
  const { prev, next } = route.pagination;
  route.pagination = {
    prev: prev && section(prev.href) === current ? prev : undefined,
    next: next && section(next.href) === current ? next : undefined,
  };
});
