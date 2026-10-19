# OpenLakeForge website: build plan

This plan builds the public site for OpenLakeForge: a **presentation page** that
tells any visitor what OpenLakeForge does and why it helps them, and a
**documentation** section rendered from the Markdown in the
[openlakeforge](https://github.com/OpenLakeForge/openlakeforge) repository.

- **Design source of truth:** Figma, [OpenLakeForge — Design System](https://www.figma.com/design/40rDaa8G9IWLD26TYjcIRz),
  pages *Shared resources* (tokens, type, components) and *Website* (landing
  and docs page).
- **Status:** plan, nothing built yet. Phases are ordered; each ends with a
  checkable "done when".

---

## 1. References and what we take from them

| Site | Why it is a reference | What we reuse |
| --- | --- | --- |
| [supabase.com](https://supabase.com) / [docs](https://supabase.com/docs) | Closest product shape: an open-source platform assembled from well-known OSS parts, self-hostable, with docs people praise | One hero sentence + one install path; a section per capability; "open source from day one"; docs sidebar grouped by *what you are doing*; a self-hosting guide written as one page with a table of contents |
| [dagster.io](https://dagster.io) / [docs](https://docs.dagster.io) | Same domain and audience (data engineers), one of OpenLakeForge's components | Docs split into Getting started → Tutorial → Build → Automate → Operate → API; a version picker; "Edit this page"; code-first examples |
| [pi.dev](https://pi.dev) | Tone of the design system | Serif display headline, mono labels, terminal install block with tabs |
| [Pulsarr docs](https://jamcalli.github.io/Pulsarr/docs/installation/quick-start) | Tone of the docs page | Three columns (sidebar, prose, on-this-page), mono navigation, strong code blocks |

## 2. Decisions

| Decision | Choice | Why |
| --- | --- | --- |
| Framework | **Astro 7** + **Starlight 0.42** | Static output, same stack as the portal, Starlight gives sidebar, search (Pagefind), TOC, dark/light, i18n and accessibility for free |
| Landing page | A **custom Astro page** at `/`, not a Starlight splash page | The landing follows the Figma design section by section; Starlight's splash template is too constrained |
| Docs content | **Synced at build time** from the openlakeforge repo at a **release tag** | Docs stay next to the code they describe (changed in the same PR); the site shows docs that match a released version |
| Sidebar order | A **`docs/navigation.yaml` manifest in openlakeforge** | The docs owner controls structure without frontmatter in every file (GitHub renders frontmatter as a table, which hurts the in-repo reading experience) |
| Page titles and descriptions | Taken from the page's **H1** and **first paragraph** by the sync | No frontmatter needed in the source repo |
| Styling | Starlight's CSS variables mapped onto the **Deep Water tokens** (`tokens.css`) | One visual language across portal and site |
| Hosting | **Cloudflare** (Workers static assets, configured in `wrangler.jsonc`), deployed by GitHub Actions on release tags | The domain is on Cloudflare; hosting, custom domain and certificate are all code in this repo |
| Versioned docs | **Latest release only** at launch; add `starlight-versions` once there are users on older releases | Keeps v1 simple |

### Decided (2026-10-19)

- **Domain**: **openlakeforge.dev**, bought on Cloudflare (2026-10-19). The
  site is served there by Cloudflare (see Hosting); `site` in
  `astro.config.mjs` defaults to it. GitHub Pages is no longer used; the
  repository keeps its `openlakeforge.github.io` name (renaming it is
  optional, GitHub redirects old URLs).
- **Releases**: the site is released by pushing a tag `vX.Y.Z` that matches
  `package.json`; only a release deploys to production.
- **Docs ref**: always the **latest released tag**, never `main`. The docs
  restructure (Phase 4) lands in milestone **v0.5-alpha**, so the first
  release whose docs follow the new structure is `v0.5.0-alpha.1`.
- **Analytics**: **none at launch**. If page-level readership becomes useful,
  add a cookie-free tool (Umami self-hosted, or Plausible): no consent banner,
  no data sent to an ad network.

## 3. Site map

```text
/                         presentation page (custom Astro page)
/docs/                    docs home: "Choose your path" (from docs/README.md)
/docs/get-started/...     introduction, quickstart, first data product, concepts
/docs/guides/...          how-to guides
/docs/reference/...       CLI, openlakeforge.yaml, lakehouse.yaml, source.yaml, catalogs
/docs/architecture/...    overview, diagrams, provider contracts, identity…
/docs/decisions/...       ADRs 0001–00xx
/changelog/               CHANGELOG.md of the synced release
/llms.txt, /llms-full.txt machine-readable docs for AI agents (see Phase 6)
```

## 4. Repository layout (target)

```text
openlakeforge.github.io/
├── astro.config.mjs            Starlight config, sidebar built from the manifest
├── package.json
├── docs.lock                   the openlakeforge ref the docs are synced from (e.g. v0.4.0-alpha.1)
├── navigation.fallback.yaml    sidebar for tags released before docs/navigation.yaml existed
├── scripts/
│   └── sync-docs.ts            clone + transform the docs (Phase 3)
├── src/
│   ├── pages/index.astro       the presentation page
│   ├── components/landing/     Hero, LogoStrip, HowItWorks, Why, EverythingAsCode,
│   │                           StagePromotion, YourProject, DeployAnywhere, GoodFit, FinalCta
│   ├── components/starlight/   overrides: Header, ThemeSelect, PageTitle if needed
│   ├── content/docs/docs/      GENERATED by sync-docs (git-ignored)
│   ├── content/docs/style-guide/ hand-written theme check pages (kept; not in the docs sidebar)
│   ├── assets/docs/            GENERATED: charts and images from the synced docs
│   ├── assets/logos/           component logos (from openlakeforge logos.json)
│   └── styles/
│       ├── tokens.css          Deep Water tokens (same file as the portal)
│       └── starlight.css       Starlight variables → Deep Water tokens
└── .github/workflows/
    ├── ci.yml                  sync, build, link check on every PR
    └── release.yml             on a vX.Y.Z tag: build + deploy to Cloudflare (openlakeforge.dev)
```

---

## Phase 1: Scaffold and theme

1. Create the Astro + Starlight project (`@astrojs/starlight`, `@astrojs/sitemap`,
   Fontsource for Instrument Serif, Space Grotesk, Inter, JetBrains Mono).
2. Copy `tokens.css` from the portal (`src/styles/tokens.css` in openlakeforge-portal).
3. Map Starlight to Deep Water in `starlight.css`:
   - `--sl-color-accent*` → `--olf-accent`, `--olf-link`, `--olf-highlight`
   - `--sl-color-gray-1…7`, `--sl-color-black/white` → the `abyss` scale (dark) and its light inverse
   - `--sl-font` → Inter, `--sl-font-mono` → JetBrains Mono; headings → Space Grotesk
   - Starlight's theme attribute is `data-theme`, the same one `tokens.css` uses, so the light/dark switch drives both.
4. Expressive Code (Starlight's code blocks): a custom theme from `bg/code`,
   `text/*` and `accent/highlight`, with mono `[ COPY ]` styling and
   **tabs** for local / AWS / Azure (Starlight `<Tabs syncKey="provider">`).
5. Header: OpenLakeForge mark + wordmark, nav (Docs, Architecture, Changelog,
   GitHub ↗), search (Pagefind, `Ctrl K`), theme toggle.

**Done when** `npm run build` produces a site whose header, sidebar, prose,
callouts and code blocks match the Figma *Website → Documentation* frame in
dark and light.

**Status: done.** Two style-guide pages (`/style-guide/`,
`/style-guide/components/`) render every element: prose, lists, tables,
callouts, code (bash, YAML, Python), provider tabs, steps, badges and cards.
Both themes were checked in the browser. `/` is a placeholder until Phase 2.
Notes for later phases:

- Starlight ≥ 0.39 wants autogenerated groups as
  `{ label, items: [{ autogenerate: { directory } }] }`; the Phase 3 sidebar
  builder must emit that shape.
- The sync writes under `src/content/docs/docs/` only, so it never touches
  the style guide.
- Header links (`src/lib/nav.ts`) point at routes Phase 3 creates; they 404
  until then.

## Phase 2: Presentation page

Build `src/pages/index.astro` from the Figma *Website → Presentation* frame.
One component per section; copy is final in Figma.

| # | Section | Content | Source |
| --- | --- | --- | --- |
| 1 | Announcement + nav | Latest release line, link to changelog | `docs.lock` + CHANGELOG |
| 2 | **Hero** | "Your modern lakehouse, *forged in one command.*", what-it-is line, install terminal (`uv tool install openlakeforge`, `olf init`, `olf deploy --provider local`), *Quick start* / *Star on GitHub* | Figma |
| 3 | Logo strip | "Assembled from open source you already know": dlt, Floe, Iceberg, Polaris, dbt, Trino, Dagster, OpenMetadata, Superset, Kubernetes | `logos.json` in openlakeforge |
| 4 | How it works | Architecture chart + Bronze / Silver / Gold cards | `docs/assets/architecture-local-{dark,light}.svg` |
| 5 | Why OpenLakeForge | Six cards (small teams, modular, self-hosted, portable, Iceberg, infra included) | README "Why OpenLakeForge?" |
| 6 | **Everything as code** | "Every layer is code. *Every layer is AI-ready.*", layer → file table, illustrative agent session | Figma |
| 7 | From a commit to PROD | Stage-promotion chart + one paragraph | `docs/assets/stage-promotion-{dark,light}.svg` |
| 8 | Your project | Project tree + Slim / Full presets | README "Your project", "Slim or Full?" |
| 9 | Deploy anywhere | Local / AWS / Azure cards | README "Deploy to the cloud" |
| 10 | Is it a good fit? | Good fit / Not yet | README "Is it a good fit?" |
| 11 | Final CTA | "The lake is yours. *We bring the forge.*" + Quick start / Browse the docs | Figma |

Details:

- **Charts** are imported from the synced docs (same files as the README), shown
  with theme-aware `<picture>`/`<img>` pairs (Phase 3, rule T5), and wrapped in a
  bordered card with zoom (`starlight-image-zoom` or a plain dialog).
- **Install command** must be the real one from the synced README's Quickstart
  (read at build time, not hard-coded), so the landing never drifts from the docs.
- Accessibility: one `h1`, alt text on charts (reuse the SVG `<title>`/`<desc>`),
  visible focus, reduced motion respected.
- Responsive: single column under 48rem; the logo strip wraps; charts scroll
  horizontally inside their card on phones rather than shrinking to unreadable.

**Done when** the page matches Figma at 1440 px and 375 px in both themes,
Lighthouse ≥ 95 for performance, accessibility, best practices and SEO, and the
install command comes from the synced README.

**Status: built.** `src/pages/index.astro` renders the eleven sections from
`src/components/landing/`, with the copy in `src/data/landing.ts`. It was
checked at 1440 px (dark and light) and 375 px (dark). The theme toggle shares
Starlight's stored preference. Still open:

- **Charts and logos are copies** in `src/assets/charts/` and
  `src/assets/logos/`, taken from openlakeforge `main` @ `dfc76b7`: they were
  added after `v0.4.0-alpha.1`, so no release has them yet. Once a release
  ships them, Phase 3 can source them from the synced tag.
- **Install commands are in `landing.ts`**, not yet read from the synced
  README (needs Phase 3).
- **Lighthouse** has not been run yet.
- Links to `/docs/...` and `/changelog/` 404 until Phase 3.

## Phase 3: Docs sync pipeline

`scripts/sync-docs.ts` runs before `astro build` (`"prebuild"` script) and in
`npm run dev`.

**Inputs**

- `docs.lock`: the openlakeforge git ref (`v0.4.0-alpha.1`), overridable with
  `OLF_DOCS_REF` (CI on openlakeforge PRs can preview `main` or a branch).
- A shallow, sparse clone of openlakeforge at that ref:
  `docs/`, `README.md`, `CHANGELOG.md`, `tools/olf/README.md`,
  `docs/architecture/diagrams/src/overview/logos.json`.
- `docs/navigation.yaml` from that ref (the manifest, see below). Tags
  released before the manifest existed (`v0.4.0-alpha.1` and earlier) don't
  have one: for those, the sync uses `navigation.fallback.yaml` in this repo,
  which maps the paths as they are in that tag. Once a release ships its own
  manifest, the fallback is deleted.

**Manifest (`docs/navigation.yaml` in openlakeforge)**

```yaml
# Order and grouping of the published docs. Paths are relative to the repo root.
# Anything under docs/ that is not listed here is not published.
- label: Get started
  items:
    - docs/get-started/introduction.md
    - docs/get-started/quickstart.md
    - docs/get-started/first-data-product.md
    - docs/get-started/concepts.md
- label: Reference
  items:
    - { path: tools/olf/README.md, slug: reference/cli, title: olf CLI }
    - docs/reference/deployment-profile.md
- label: Decisions
  autogenerate: docs/adr          # every file in the folder, sorted by name
```

**Transforms** (each one unit-tested against fixtures)

| # | Rule |
| --- | --- |
| T1 | **Title** = first ATX `# ` heading *outside fenced code blocks* (several current pages have `# ` comments inside code). The heading is removed from the body; Starlight renders the title. |
| T2 | **Description** = first paragraph after the title, stripped of Markdown, truncated to 160 characters (meta description and search snippet). |
| T3 | **Slug** = path under `docs/` without `.md`; `README.md` → the folder index. Manifest entries can override slug and title. |
| T4 | **Links**: relative `.md` links and repo-absolute `/docs/…` links → site routes, keeping `#anchors`. Links to unpublished repo files (`AGENTS.md`, source code, schemas) → `https://github.com/OpenLakeForge/openlakeforge/blob/<ref>/<path>`. |
| T5 | **Images**: copy referenced files into `src/assets/docs/` (Astro optimises rasters). Turn `<picture>` with `prefers-color-scheme` into a light/dark pair keyed on Starlight's `data-theme`, so the chart follows the site toggle and not only the OS. |
| T6 | **Admonitions**: GitHub alerts (`> [!NOTE]`, `> [!WARNING]`…) → Starlight asides, so they render as the Callout component on the site and as alerts on GitHub. |
| T7 | **Edit link**: frontmatter `editUrl` → `https://github.com/OpenLakeForge/openlakeforge/edit/main/<path>` (edits go to the docs repo, not the website repo). |
| T8 | **Provenance**: a footer line "Synced from openlakeforge @ `<ref>`". |

**Checks**

- `starlight-links-validator` fails the build on a broken internal link or
  anchor, so a moved doc can't silently break the site.
- The sync fails if a manifest entry does not exist, or if a file under `docs/`
  is neither listed nor in an explicit `exclude:` list (nothing gets published
  or dropped by accident).

**Done when** every page listed in the manifest renders with the right title,
working links and theme-aware charts. The released `v0.4.0-alpha.1` docs must
sync through `navigation.fallback.yaml` with no change to the openlakeforge
repo, so the site does not wait for the restructure.

## Phase 4: Docs restructure (in openlakeforge, separate PRs)

The goal is a structure a newcomer can follow: **Get started → Guides →
Reference → Architecture → Decisions**, one kind of page per section (the
[Diátaxis](https://diataxis.fr) split that Dagster and Supabase both use).

### Target tree and move map

| Today | Target | Notes |
| --- | --- | --- |
| *(README "What / Why / Fit")* | `docs/get-started/introduction.md` | **New**: what OpenLakeForge is, who it is for, good fit / not yet |
| `docs/setup/local.md` (3.6k words) | `docs/get-started/quickstart.md` + `docs/guides/local-access-and-identity.md` + `docs/guides/local-troubleshooting.md` | Split: the 10-minute path stays in Quickstart |
| `docs/getting-started/first-data-product.md` | `docs/get-started/first-data-product.md` | Tutorial |
| *(new)* | `docs/get-started/concepts.md` | Medallion layers, data products, stages, project revisions, presets, provider contracts, one paragraph each, linking out |
| *(parts of first-data-product)* | `docs/guides/add-a-bronze-source.md`, `write-silver-contracts.md`, `model-gold-with-dbt.md`, `publish-dashboards.md` | How-tos extracted from the tutorial |
| `docs/reference/ci-cd.md` | `docs/guides/promote-dev-to-prod.md` | It is a guide |
| `docs/setup/github-oauth-app.md` | `docs/guides/sign-in-with-github.md` | |
| `docs/setup/identity-secret-rotation.md` | `docs/guides/rotate-identity-secrets.md` | |
| `docs/setup/aws.md`, `azure.md`, `cloud-poc-setup.md` | `docs/guides/deploy-to-aws.md`, `deploy-to-azure.md`, `prepare-a-cloud-account.md` | |
| `tools/olf/README.md` | stays; published as `reference/cli` via the manifest | |
| *(schema only)* | `docs/reference/deployment-profile.md` | **New**: `openlakeforge.yaml` field by field |
| `docs/reference/domain-descriptor.md` | `docs/reference/lakehouse-descriptor.md` + `docs/reference/source-descriptor.md` | Split per file |
| `docs/release/component-catalog.md`, `compatibility-matrix.md` | `docs/reference/` | |
| `docs/architecture/*` | stays; `diagrams/README.md` → `architecture/diagrams.md`; identity pages grouped under `architecture/identity/` | |
| `docs/adr/*` | stays (published as *Decisions*) | |
| `docs/release/releasing.md`, `docs/technical-debt.md`, `docs/testing/*` | stay, **not published** (`exclude:` in the manifest) | Maintainer material |

### Writing conventions (added to AGENTS.md)

- One `# ` title per page; the first paragraph says what the page is for in one
  or two sentences (it becomes the search snippet).
- Relative links only; link to other docs, not to GitHub URLs.
- Charts as `-light.svg` / `-dark.svg` pairs in `docs/assets/`, embedded with `<picture>`.
- Use GitHub alerts (`> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`) for callouts.
- No emoji in headings; tables for comparisons, numbered lists for procedures.
- Every command block is copy-pasteable and runs as written.

### Moving files safely

Doc paths are referenced outside `docs/` in about 30 files: `olf`'s
`checks/_structure.py` (28 paths), `release/_compatibility.py`,
`scaffold/_templates.py`, `initialization.py`, the e2e modules, the release
workflow, Terraform comments, `README.md` and `AGENTS.md`. So:

1. **One PR per section** (Get started, Guides, Reference, Architecture).
   Each PR moves its files with `git mv`, updates every reference
   (`git grep` for the old path must return nothing), updates
   `_structure.py` and `navigation.yaml`, and passes the four gates.
2. Add a check to `olf check` that every relative link in `docs/` and the
   README resolves, so the restructure cannot leave dead links in the repo
   either.
3. Old site URLs don't exist yet, so the website needs no redirects before
   launch. After launch, a move adds a redirect in `astro.config.mjs`
   (`redirects:`).

**Done when** the manifest lists every published page under the five
sections, no reference to an old path remains in openlakeforge, and the
website builds against the new tag with zero broken links.

## Phase 5: Build, deploy, automation

- **`ci.yml`** (done): on PRs and `main`: `npm ci` → `astro build` →
  `wrangler deploy --dry-run` (validates the Cloudflare config). Adds the docs
  sync and link validation with Phase 3.
- **`release.yml`** (done): on a `vX.Y.Z` tag matching `package.json`, or by
  hand: build with `SITE_URL=https://openlakeforge.dev` and `wrangler deploy`
  through `cloudflare/wrangler-action` (pinned by SHA), in the `production`
  environment.
  - **One-time setup** (repository settings): create the `production`
    environment with the secrets `CLOUDFLARE_API_TOKEN` (permissions:
    *Workers Scripts: Edit* on the account; *Workers Routes: Edit* and
    *DNS: Edit* on the `openlakeforge.dev` zone) and
    `CLOUDFLARE_ACCOUNT_ID`.
- **Release hook in openlakeforge**: the existing `release.yml` (on `v*` tags)
  gets a final job that sends `repository_dispatch` to openlakeforge.github.io
  with the tag. A small workflow there opens a PR bumping `docs.lock`; merging
  it and tagging a website release deploys the new docs, so the site never
  changes without a commit.
- **PR previews** (optional, later): `wrangler versions upload` on each PR
  gives a preview URL without touching production.
- **Docs preview on openlakeforge PRs** (optional, later): a job that builds
  the site with `OLF_DOCS_REF=<pr head sha>` and uploads it as an artifact, so
  doc changes are checked as rendered pages before merge.

**Done when** tagging an openlakeforge release produces a website PR that
updates `docs.lock`, and merging it deploys the site.

## Phase 6: Polish

- **`llms.txt` / `llms-full.txt`** (`starlight-llms-txt`): the docs as plain
  Markdown for AI agents, which backs up the landing's "AI-ready" claim. Add a
  "Copy page as Markdown" button on docs pages.
- **SEO**: sitemap, canonical URLs, Open Graph images generated per page
  (title + Deep Water background + mark), `robots.txt`.
- **404 page** in the Deep Water style ("This part of the lake is uncharted").
- **Charts in the site palette**: add a Deep Water theme to
  `docs/architecture/diagrams/src/overview/charts.py`, so the README charts
  and the site share colours (the current charts use a neighbouring grey-blue).
- **Shared brand package**: once portal and website both exist, move
  `tokens.css`, the mark and the logos to one package (`@openlakeforge/brand`)
  so the two sites can't drift apart.
- **Versions** (`starlight-versions`) when a release ships breaking doc changes.

---

## Order and dependencies

```text
Phase 1 ─┬─> Phase 2 (landing) ─────────────┐
         └─> Phase 3 (sync, current paths) ─┼─> Phase 5 (deploy, launch)
             Phase 4 (restructure PRs) ─────┘   Phase 6 (any time after launch)
```

- Phases 2 and 3 can run in parallel after Phase 1.
- Phase 4 happens in openlakeforge, within milestone **v0.5-alpha**. The site
  does not wait for it: it can launch on the `v0.4.0-alpha.1` docs through the
  fallback manifest, then switch to the restructured docs when
  `v0.5.0-alpha.1` is tagged (a `docs.lock` bump).
- Launch = Phases 1, 2, 3, 5. Phase 4 ships with v0.5-alpha.
- Add the restructure to the v0.5-alpha milestone as one issue per section
  (Get started, Guides, Reference, Architecture), each with its move map
  rows from Phase 4.

## Risks

| Risk | Mitigation |
| --- | --- |
| Moving docs breaks paths used by `olf` checks and messages | One PR per section, `git grep` for old paths, gates must pass |
| GitHub rendering and site rendering diverge | Conventions use GitHub-native syntax only (alerts, `<picture>`); the sync converts |
| Site shows docs that don't match the installed version | Sync from a release tag; provenance footer; versions plugin later |
| Charts unreadable on phones | Horizontal scroll inside the card + zoom; text alternative in the alt |
| Two copies of the design tokens (portal, website) drift | Brand package in Phase 6; until then, the Figma variables are the reference |
