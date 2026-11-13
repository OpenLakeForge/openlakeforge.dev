// Sync the openlakeforge and Floe documentation into the site before every
// build (PLAN.md, Phase 3). The refs come from docs.lock and floe.lock, or
// OLF_DOCS_REF and FLOE_DOCS_REF; set OLF_DOCS_DIR or FLOE_DOCS_DIR to an
// existing checkout to skip its clone while writing docs.

import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, posix } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { readNavigation, transformPage } from "./docs-transform.mjs";

const site = join(dirname(fileURLToPath(import.meta.url)), "..");
const sidebarFile = join(site, "src/generated/sidebar.json");
const releaseFile = join(site, "src/generated/release.json");

// OpenLakeForge's docs are served under /docs/, Floe's under /floe/. Each repo
// has its own lock file and env overrides; both use docs/navigation.yaml.
const olf = syncDocs({
  repoUrl: "https://github.com/OpenLakeForge/openlakeforge",
  base: "docs",
  ref: process.env.OLF_DOCS_REF || readFileSync(join(site, "docs.lock"), "utf8").trim(),
  dir: process.env.OLF_DOCS_DIR,
  sparse: ["/docs/", "/CHANGELOG.md", "/README.md", "/tools/olf/README.md"],
});
const floe = syncDocs({
  repoUrl: "https://github.com/OpenLakeForge/floe",
  base: "floe",
  ref: process.env.FLOE_DOCS_REF || readFileSync(join(site, "floe.lock"), "utf8").trim(),
  dir: process.env.FLOE_DOCS_DIR,
  sparse: ["/docs/"],
});

// The OpenLakeForge changelog, at /changelog/.
const { ref, sha, source, published } = olf;
const assetsDir = join(site, "public/docs-assets");
const changelogAssets = new Set();
write(
  join(site, "src/content/docs/changelog.md"),
  transformPage(readFileSync(join(source, "CHANGELOG.md"), "utf8"), {
    sourcePath: "CHANGELOG.md",
    title: "Changelog",
    published,
    repoUrl: olf.repoUrl,
    ref,
    sha,
    assets: changelogAssets,
  }),
);
copyAssets(changelogAssets, source, assetsDir, ref);
// The release and the JSON Schemas of the files an agent edits, for /llms.txt.
const schemaDir = "docs/schema";
const schemas = listSchemas(join(source, schemaDir)).map((file) => {
  cpSync(join(source, schemaDir, file), join(assetsDir, schemaDir, file));
  return { file, title: JSON.parse(readFileSync(join(source, schemaDir, file), "utf8")).title ?? file };
});
write(sidebarFile, `${JSON.stringify([...olf.sidebar, ...floe.sidebar], null, 2)}\n`);
write(releaseFile, `${JSON.stringify({ ref, sha, schemas, floe: { ref: floe.ref, sha: floe.sha } }, null, 2)}\n`);

/** Sync one repository's published docs into src/content/docs/<base>/ and public/<base>-assets/. */
function syncDocs({ repoUrl, base, ref, dir, sparse }) {
  const name = posix.basename(repoUrl);
  const source = dir || checkout(repoUrl, ref, sparse);
  const sha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: source, encoding: "utf8" }).trim();
  const contentDir = join(site, "src/content/docs", base);
  const assetsDir = join(site, "public", `${base}-assets`);
  const navigation = parse(readFileSync(join(source, "docs/navigation.yaml"), "utf8"));
  const { published, titles, sidebar } = readNavigation(
    navigation,
    (directory) => listMarkdown(join(source, directory)).map((file) => posix.join(directory.replace(/\/$/, ""), file)),
    base,
  );

  rmSync(contentDir, { recursive: true, force: true });
  rmSync(assetsDir, { recursive: true, force: true });
  const assets = new Set();
  for (const [path, slug] of Object.entries(published)) {
    const file = join(source, path);
    if (!existsSync(file)) throw new Error(`${name} docs/navigation.yaml lists ${path}, which does not exist at ${ref}`);
    const page = transformPage(readFileSync(file, "utf8"), { sourcePath: path, title: titles[path], published, repoUrl, ref, sha, assets, base });
    write(join(contentDir, slug ? `${slug}.md` : "index.md"), page);
  }
  copyAssets(assets, source, assetsDir, ref);
  console.log(`Synced ${Object.keys(published).length} pages and ${assets.size} assets from ${name} @ ${ref} (${sha.slice(0, 7)}).`);
  return { repoUrl, ref, sha, source, published, sidebar };
}

function copyAssets(assets, source, assetsDir, ref) {
  for (const asset of assets) {
    const from = join(source, asset);
    if (!existsSync(from)) throw new Error(`a published page references ${asset}, which does not exist at ${ref}`);
    mkdirSync(dirname(join(assetsDir, asset)), { recursive: true });
    cpSync(from, join(assetsDir, asset));
  }
}

function listSchemas(dir) {
  if (!existsSync(dir)) return [];
  mkdirSync(join(site, "public/docs-assets", schemaDir), { recursive: true });
  return readdirSync(dir).filter((file) => file.endsWith(".schema.json")).sort();
}

function checkout(repoUrl, ref, sparse) {
  const dir = join(site, ".cache", posix.basename(repoUrl));
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const run = (...args) => execFileSync("git", args, { cwd: dir, stdio: "inherit" });
  // A sparse, shallow fetch of one ref: the docs and the files they publish,
  // not the whole repository.
  run("init", "-q");
  run("remote", "add", "origin", `${repoUrl}.git`);
  run("sparse-checkout", "set", "--no-cone", ...sparse);
  run("fetch", "-q", "--depth", "1", "--filter=blob:none", "origin", ref);
  run("checkout", "-q", "FETCH_HEAD");
  return dir;
}

function listMarkdown(directory) {
  return readdirSync(directory, { recursive: true })
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.split("\\").join("/"))
    .sort();
}

function write(file, text) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, text);
}
