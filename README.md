# openlakeforge.dev

The public website of [OpenLakeForge](https://github.com/OpenLakeForge/openlakeforge):
a presentation page and the documentation, served at
**https://openlakeforge.dev**.

Built with Astro and Starlight in the OpenLakeForge **Deep Water** design
system ([Figma](https://www.figma.com/design/40rDaa8G9IWLD26TYjcIRz)). The
documentation is synced at build time from the openlakeforge repository at
the ref in `docs.lock` (the latest release tag) by `scripts/sync-docs.mjs`,
which runs before `dev` and `build`. A new release bumps `docs.lock` and the
announcement bar (`release` in `src/data/landing.ts`) together.

The [Floe](https://github.com/OpenLakeForge/floe) documentation is synced the
same way, from the Floe ref in `floe.lock` (`main` until a Floe release ships
`docs/navigation.yaml`), and served under **/floe/** with its own sidebar
(`src/route-middleware.ts` shows each page only the sidebar of its section).
`FLOE_DOCS_REF` and `FLOE_DOCS_DIR` override it like `OLF_DOCS_REF` and
`OLF_DOCS_DIR`. Floe's `CHANGELOG.md` is published at `/floe/changelog/`, last in the Floe sidebar.

## Develop

Requires Node.js 22 or later.

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # static site in dist/
npm run preview   # serve dist/
```

- `/` is the presentation page (`src/pages/index.astro`, copy in `src/data/landing.ts`).
- `/docs/` is the OpenLakeForge documentation, `/floe/` the Floe documentation, both synced.
- `/style-guide/` shows every documentation element in the theme.
- `/llms.txt`, `/llms-full.txt`, `/llms-small.txt` and `/<docs page>.md` serve the
  synced docs of OpenLakeForge and Floe as Markdown for AI agents (`src/lib/llms.ts`).

## Contribute and deploy

`main` is production: **merging a pull request into `main` deploys
openlakeforge.dev.** The site is hosted on Cloudflare, configured in
[`wrangler.jsonc`](wrangler.jsonc), and built by **Cloudflare Workers Builds**,
which is connected to this repository (no token lives in GitHub).

| Branch | What Cloudflare does |
| --- | --- |
| `main` | `npm run build` then `npx wrangler deploy` → https://openlakeforge.dev |
| any other branch | `npm run build` then `npx wrangler preview` → a Preview per branch, linked on the PR |

`main` is protected: changes land only through pull requests, the
[CI](.github/workflows/ci.yml) build must pass, and the code owner
([`CODEOWNERS`](.github/CODEOWNERS)) approves.

**If a merge does not deploy:** check that the commit on `main` has a
`Workers Builds: openlakeforge-website` check, and compare the live banner with
`release` in [`src/data/landing.ts`](src/data/landing.ts). Cloudflare starts a
build only from a push, so with no build for the commit (as after the
2026-11-13 Workers API incident, when #21 never built) *Retry build* in the
dashboard has nothing to retry. Merge another pull request, or deploy by hand
from a clean checkout of `main`: `npm ci && npm run build && npx wrangler deploy`
after `npx wrangler login`.

**Status:** the presentation page and the docs sync are built. The docs come
from the openlakeforge `v0.6.0-alpha.3` tag (`docs.lock`). See
[PLAN.md](PLAN.md).
