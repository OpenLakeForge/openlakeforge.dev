# openlakeforge.dev

The public website of [OpenLakeForge](https://github.com/OpenLakeForge/openlakeforge):
a presentation page and the documentation, served at
**https://openlakeforge.dev**.

Built with Astro and Starlight in the OpenLakeForge **Deep Water** design
system ([Figma](https://www.figma.com/design/40rDaa8G9IWLD26TYjcIRz)). The
documentation is synced at build time from the openlakeforge repository at
the ref in `docs.lock` (`main` until v0.5-alpha is released, then the release
tag) by `scripts/sync-docs.mjs`, which runs before `dev` and `build`.

## Develop

Requires Node.js 22 or later.

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # static site in dist/
npm run preview   # serve dist/
```

- `/` is the presentation page (`src/pages/index.astro`, copy in `src/data/landing.ts`).
- `/style-guide/` shows every documentation element in the theme.

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

**Status:** the presentation page and the docs sync are built. The docs come
from openlakeforge `main` (`docs.lock`) until v0.5-alpha is released, then
from the release tag. See [PLAN.md](PLAN.md).
