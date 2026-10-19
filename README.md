# openlakeforge.dev

The public website of [OpenLakeForge](https://github.com/OpenLakeForge/openlakeforge):
a presentation page and the documentation, served at
**https://openlakeforge.dev**.

Built with Astro and Starlight in the OpenLakeForge **Deep Water** design
system ([Figma](https://www.figma.com/design/40rDaa8G9IWLD26TYjcIRz)). The
documentation is synced at build time from the openlakeforge repository at
its latest release tag.

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

## Release

The site is hosted on Cloudflare, configured in [`wrangler.jsonc`](wrangler.jsonc).
To release, bump `version` in `package.json`, merge, then push the matching tag:

```bash
git tag v0.2.0 && git push origin v0.2.0
```

[`release.yml`](.github/workflows/release.yml) builds and deploys it to
openlakeforge.dev. It needs the `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID` secrets in the `production` environment.

**Status:** the presentation page is built; the docs sync is next. See
[PLAN.md](PLAN.md).
