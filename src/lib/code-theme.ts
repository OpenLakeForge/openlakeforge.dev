import { ExpressiveCodeTheme } from "@astrojs/starlight/expressive-code";

/**
 * "Deep Water" code theme. Code blocks are dark in both site themes (the
 * Figma Code block component sits on bg/code), so there is one theme only.
 * Colours are the Deep Water primitives: shallows for keywords and prompts,
 * reed for types and YAML keys, sand for constants, abyss for the rest.
 */
const deepWater = {
  name: "deep-water",
  type: "dark",
  colors: {
    "editor.background": "#0f2a40",
    "editor.foreground": "#e4eef5",
    "editor.selectionBackground": "#1c4260",
    "editorLineNumber.foreground": "#3d6b8c",
    "terminal.ansiGreen": "#3dd68c",
    "terminal.ansiYellow": "#f5c451",
    "terminal.ansiRed": "#ff6b7a",
    "terminal.ansiBlue": "#69b6f2",
    "terminal.ansiCyan": "#5cc9ff",
  },
  tokenColors: [
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "#6a91ae", fontStyle: "italic" } },
    { scope: ["string", "string.quoted", "string.unquoted"], settings: { foreground: "#a6e1ff" } },
    { scope: ["keyword", "storage", "keyword.control", "keyword.operator.word"], settings: { foreground: "#5cc9ff" } },
    { scope: ["constant.numeric", "constant.language", "constant.other", "constant.character"], settings: { foreground: "#f5c451" } },
    { scope: ["entity.name.function", "support.function", "meta.function-call"], settings: { foreground: "#69b6f2" } },
    { scope: ["entity.name.type", "entity.name.class", "support.type", "entity.name.tag", "entity.name.tag.yaml"], settings: { foreground: "#3dd68c" } },
    { scope: ["variable.parameter", "variable.other.property", "support.type.property-name", "meta.object-literal.key", "entity.other.attribute-name"], settings: { foreground: "#c7d9e6" } },
    { scope: ["punctuation", "meta.brace", "keyword.operator"], settings: { foreground: "#9cbad0" } },
    { scope: ["markup.inserted"], settings: { foreground: "#3dd68c" } },
    { scope: ["markup.deleted"], settings: { foreground: "#ff6b7a" } },
  ],
};

export const deepWaterTheme = ExpressiveCodeTheme.fromJSONString(JSON.stringify(deepWater));
