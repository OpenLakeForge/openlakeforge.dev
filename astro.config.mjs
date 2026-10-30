import { readFileSync } from "node:fs";
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import sitemap from "@astrojs/sitemap";
import { deepWaterTheme } from "./src/lib/code-theme.ts";
import { repositoryUrl } from "./src/lib/nav.ts";
import { docsRedirects } from "./src/lib/redirects.ts";

// The public URL lives here only (canonical links, sitemap). Served by
// Cloudflare from wrangler.jsonc; SITE_URL overrides it for previews.
const site = process.env.SITE_URL ?? "https://openlakeforge.dev";

export default defineConfig({
  site,
  redirects: docsRedirects,
  integrations: [
    sitemap(),
    starlight({
      title: "OpenLakeForge",
      description: "The open-source lakehouse for small data teams: your modern lakehouse, forged in one command.",
      favicon: "/favicon.svg",
      social: [{ icon: "github", label: "GitHub", href: repositoryUrl }],
      customCss: [
        "@fontsource-variable/fraunces/full.css",
        "@fontsource-variable/fraunces/full-italic.css",
        "@fontsource-variable/space-grotesk",
        "@fontsource-variable/inter",
        "@fontsource-variable/jetbrains-mono",
        "./src/styles/tokens.css",
        "./src/styles/starlight.css",
      ],
      components: {
        SiteTitle: "./src/components/starlight/SiteTitle.astro",
        SocialIcons: "./src/components/starlight/SocialIcons.astro",
        PageTitle: "./src/components/starlight/PageTitle.astro",
      },
      expressiveCode: {
        themes: [deepWaterTheme],
        useStarlightUiThemeColors: false,
        styleOverrides: {
          borderRadius: "10px",
          borderColor: "#1c4260",
          codeFontFamily: "var(--olf-font-mono)",
          uiFontFamily: "var(--olf-font-mono)",
          codeFontSize: "0.875rem",
          frames: {
            shadowColor: "transparent",
            editorTabBarBackground: "#0b2235",
            editorActiveTabBackground: "#0f2a40",
            editorActiveTabIndicatorBottomColor: "#5cc9ff",
            editorActiveTabIndicatorTopColor: "transparent",
            terminalTitlebarBackground: "#0b2235",
            terminalTitlebarBorderBottomColor: "#1c4260",
            terminalTitlebarDotsOpacity: "0.35",
            terminalBackground: "#0f2a40",
            inlineButtonBorder: "#3d6b8c",
            inlineButtonForeground: "#9cbad0",
          },
        },
      },
      // Built from openlakeforge's docs/navigation.yaml by scripts/sync-docs.mjs,
      // which runs before dev and build. The style guide stays reachable by URL.
      sidebar: JSON.parse(readFileSync(new URL("./src/generated/sidebar.json", import.meta.url), "utf8")),
    }),
  ],
});
