import assert from "node:assert/strict";
import { test } from "node:test";
import {
  convertAlerts,
  defaultSlug,
  extractDescription,
  extractTitle,
  readNavigation,
  rewriteLinks,
  transformPage,
} from "./docs-transform.mjs";

const context = (sourcePath, assets = new Set()) => ({
  sourcePath,
  published: { "docs/README.md": "", "docs/get-started/quickstart.md": "get-started/quickstart", "tools/olf/README.md": "reference/cli" },
  repoUrl: "https://github.com/OpenLakeForge/openlakeforge",
  ref: "main",
  assets,
});

test("the title is the first heading outside code, removed from the body", () => {
  const { title, body } = extractTitle("```bash\n# not a title\n```\n\n# Quickstart\n\nDeploy it.\n");
  assert.equal(title, "Quickstart");
  assert.equal(body, "```bash\n# not a title\n```\n\n\nDeploy it.\n");
  assert.equal(extractTitle("# Sign in with GitHub (`issuer: github`)\n").title, "Sign in with GitHub (issuer: github)");
});

test("the description is the first paragraph as plain text, at most 160 characters", () => {
  assert.equal(extractDescription("> [!NOTE]\n> skip\n\nDeploy [OpenLakeForge](x.md) with `olf`.\nOn kind.\n\nMore."), "Deploy OpenLakeForge with olf. On kind.");
  const long = extractDescription(`${"word ".repeat(60)}end`);
  assert.ok(long.length <= 160 && long.endsWith("…"));
});

test("slugs follow the path under docs/, README as the folder index", () => {
  assert.equal(defaultSlug("docs/README.md"), "");
  assert.equal(defaultSlug("docs/adr/README.md"), "adr");
  assert.equal(defaultSlug("docs/get-started/quickstart.md"), "get-started/quickstart");
});

test("links to published pages become site routes, keeping the anchor", () => {
  const out = rewriteLinks("[Quickstart](../get-started/quickstart.md#2-deploy) and [CLI](../../tools/olf/README.md)", context("docs/tutorial/01-tour.md"));
  assert.equal(out, "[Quickstart](/docs/get-started/quickstart/#2-deploy) and [CLI](/docs/reference/cli/)");
});

test("links to unpublished files go to GitHub at the synced ref; external links stay", () => {
  const out = rewriteLinks("[agents](../AGENTS.md) [infra](/infra/terraform) [web](https://example.com) [top](#top)", context("docs/README.md"));
  assert.equal(
    out,
    "[agents](https://github.com/OpenLakeForge/openlakeforge/blob/main/AGENTS.md) [infra](https://github.com/OpenLakeForge/openlakeforge/tree/main/infra/terraform) [web](https://example.com) [top](#top)",
  );
});

test("images, including picture srcset, are collected and served from /docs-assets/", () => {
  const assets = new Set();
  const out = rewriteLinks(
    '<source srcset="docs/assets/chart-dark.svg"><img src="docs/assets/chart.svg"> ![a](assets/b.png)',
    context("README.md", assets),
  );
  assert.equal(out, '<source srcset="/docs-assets/docs/assets/chart-dark.svg"><img src="/docs-assets/docs/assets/chart.svg"> ![a](/docs-assets/assets/b.png)');
  assert.deepEqual([...assets].sort(), ["assets/b.png", "docs/assets/chart-dark.svg", "docs/assets/chart.svg"]);
});

test("links inside code blocks are left alone", () => {
  const body = "```md\n[x](../AGENTS.md)\n```";
  assert.equal(rewriteLinks(body, context("docs/README.md")), body);
});

test("GitHub alerts become Starlight asides", () => {
  assert.equal(convertAlerts("> [!WARNING]\n> Billable.\n> Tear down.\n\nAfter."), ":::caution\nBillable.\nTear down.\n:::\n\nAfter.");
  assert.equal(convertAlerts("> A plain quote."), "> A plain quote.");
});

test("a page gets frontmatter, an edit link to openlakeforge and its provenance", () => {
  const page = transformPage("# Quickstart\n\nDeploy it.\n", { ...context("docs/get-started/quickstart.md"), sha: "0123456789abcdef" });
  assert.match(page, /^---\ntitle: "Quickstart"\ndescription: "Deploy it."\neditUrl: "https:\/\/github.com\/OpenLakeForge\/openlakeforge\/edit\/main\/docs\/get-started\/quickstart.md"\n---\n\nDeploy it./);
  assert.match(page, /Synced from openlakeforge @ `main` \(`0123456`\)/);
});

test("the navigation gives the published pages, title overrides and the sidebar", () => {
  const { published, titles, sidebar } = readNavigation(
    {
      sections: [
        { label: "Get started", items: ["docs/README.md", { path: "tools/olf/README.md", slug: "reference/cli", title: "olf CLI" }] },
        { label: "Decisions", autogenerate: "docs/adr" },
      ],
    },
    () => ["docs/adr/README.md", "docs/adr/0001-baseline.md"],
  );
  assert.deepEqual(published, { "docs/README.md": "", "tools/olf/README.md": "reference/cli", "docs/adr/README.md": "adr", "docs/adr/0001-baseline.md": "adr/0001-baseline" });
  assert.deepEqual(titles, { "tools/olf/README.md": "olf CLI" });
  assert.deepEqual(sidebar, [
    { label: "Get started", items: [{ slug: "docs" }, { slug: "docs/reference/cli" }] },
    { label: "Decisions", items: [{ autogenerate: { directory: "docs/adr" } }] },
  ]);
});

test("titles keep underscores inside words and drop only emphasis", () => {
  assert.equal(extractTitle("# Configure PROJECT_CODE_IMAGE_REPOSITORY\n").title, "Configure PROJECT_CODE_IMAGE_REPOSITORY");
  assert.equal(extractTitle("# A **bold** and _quiet_ title\n").title, "A bold and quiet title");
});

test("the description skips a fenced code block before the first paragraph", () => {
  assert.equal(extractDescription("```bash\nolf deploy\n```\n\nDeploy the platform."), "Deploy the platform.");
});

test("alert syntax inside a code block stays as written", () => {
  const body = "```md\n> [!NOTE]\n> An example.\n```";
  assert.equal(convertAlerts(body), body);
});

test("a manifest without sections fails instead of publishing nothing", () => {
  assert.throws(() => readNavigation([{ label: "Get started", items: [] }], () => []), /non-empty `sections` list/);
  assert.throws(() => readNavigation({}, () => []), /non-empty `sections` list/);
});

test("the description starts after the title and skips thematic breaks", () => {
  const page = transformPage("<!--\nGenerated; do not edit.\n-->\n\n# Matrix\n\n---\n\nVersions of PROJECT_CODE_IMAGE_REPOSITORY.\n", {
    ...context("docs/reference/matrix.md"),
    sha: "0123456789abcdef",
  });
  assert.match(page, /description: "Versions of PROJECT_CODE_IMAGE_REPOSITORY."/);
});

test("a slug that climbs out of the content directory fails the sync", () => {
  assert.throws(
    () => readNavigation({ sections: [{ label: "X", items: [{ path: "docs/a.md", slug: "../../pages/index" }] }] }, () => []),
    /unsafe slug/,
  );
});

test("an autogenerate directory that climbs out fails the sync", () => {
  assert.throws(() => readNavigation({ sections: [{ label: "X", autogenerate: "../outside" }] }, () => []), /unsafe slug/);
});

test("a fence line with an info string inside a block is code, not a closing fence", () => {
  const body = "```text\n```js\n[x](../AGENTS.md)\n```\n```";
  assert.equal(rewriteLinks(body, context("docs/README.md")), body);
});
