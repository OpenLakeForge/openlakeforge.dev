// Sync the openlakeforge documentation into the site before every build
// (PLAN.md, Phase 3). The ref comes from docs.lock, or OLF_DOCS_REF; set
// OLF_DOCS_DIR to an existing checkout to skip the clone while writing docs.

import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, posix } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { readNavigation, transformPage } from "./docs-transform.mjs";

const REPO_URL = "https://github.com/OpenLakeForge/openlakeforge";
const site = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(site, "src/content/docs/docs");
const changelogPage = join(site, "src/content/docs/changelog.md");
const assetsDir = join(site, "public/docs-assets");
const sidebarFile = join(site, "src/generated/sidebar.json");
const releaseFile = join(site, "src/generated/release.json");

const ref = process.env.OLF_DOCS_REF || readFileSync(join(site, "docs.lock"), "utf8").trim();
const source = process.env.OLF_DOCS_DIR || checkout(ref);
const git = (...args) => execFileSync("git", args, { cwd: source, encoding: "utf8" }).trim();
const sha = git("rev-parse", "HEAD");

const navigation = parse(readFileSync(join(source, "docs/navigation.yaml"), "utf8"));
const { published, titles, sidebar } = readNavigation(navigation, (directory) =>
  listMarkdown(join(source, directory)).map((file) => posix.join(directory.replace(/\/$/, ""), file)),
);

rmSync(contentDir, { recursive: true, force: true });
rmSync(assetsDir, { recursive: true, force: true });
const assets = new Set();
for (const [path, slug] of Object.entries(published)) {
  const file = join(source, path);
  if (!existsSync(file)) throw new Error(`docs/navigation.yaml lists ${path}, which does not exist at ${ref}`);
  const page = transformPage(readFileSync(file, "utf8"), {
    sourcePath: path,
    title: titles[path],
    published,
    repoUrl: REPO_URL,
    ref,
    sha,
    assets,
  });
  write(join(contentDir, slug ? `${slug}.md` : "index.md"), page);
}
write(
  changelogPage,
  transformPage(readFileSync(join(source, "CHANGELOG.md"), "utf8"), {
    sourcePath: "CHANGELOG.md",
    title: "Changelog",
    published,
    repoUrl: REPO_URL,
    ref,
    sha,
    assets,
  }),
);
for (const asset of assets) {
  const from = join(source, asset);
  if (!existsSync(from)) throw new Error(`a published page references ${asset}, which does not exist at ${ref}`);
  mkdirSync(dirname(join(assetsDir, asset)), { recursive: true });
  cpSync(from, join(assetsDir, asset));
}
// The release and the JSON Schemas of the files an agent edits, for /llms.txt.
const schemaDir = "docs/schema";
const schemas = listSchemas(join(source, schemaDir)).map((file) => {
  cpSync(join(source, schemaDir, file), join(assetsDir, schemaDir, file));
  return { file, title: JSON.parse(readFileSync(join(source, schemaDir, file), "utf8")).title ?? file };
});
write(sidebarFile, `${JSON.stringify(sidebar, null, 2)}\n`);
write(releaseFile, `${JSON.stringify({ ref, sha, schemas }, null, 2)}\n`);
console.log(`Synced ${Object.keys(published).length} pages and ${assets.size} assets from openlakeforge @ ${ref} (${sha.slice(0, 7)}).`);

function listSchemas(dir) {
  if (!existsSync(dir)) return [];
  mkdirSync(join(assetsDir, schemaDir), { recursive: true });
  return readdirSync(dir).filter((file) => file.endsWith(".schema.json")).sort();
}

function checkout(ref) {
  const dir = join(site, ".cache/openlakeforge");
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const run = (...args) => execFileSync("git", args, { cwd: dir, stdio: "inherit" });
  // A sparse, shallow fetch of one ref: the docs, the changelog and the
  // published READMEs, not the whole platform.
  run("init", "-q");
  run("remote", "add", "origin", `${REPO_URL}.git`);
  run("sparse-checkout", "set", "--no-cone", "/docs/", "/CHANGELOG.md", "/README.md", "/tools/olf/README.md");
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
