import type { Board } from "../data/boards";
import type { Reference } from "../data/references";

export type Brief = NonNullable<Board["brief"]>;
export type TokenFormat = "css" | "tailwind" | "figma";
export type AiTool =
  "claude" | "cursor" | "antigravity" | "loveable" | "chatgpt";
export type PrototypeKind = "landing" | "dashboard" | "components";

export const tokenFormats: { id: TokenFormat; label: string; title: string }[] =
  [
    { id: "css", label: "CSS Variables", title: "CSS Variables" },
    {
      id: "tailwind",
      label: "Tailwind Config",
      title: "Tailwind Config (v4 @theme)",
    },
    { id: "figma", label: "Figma Tokens", title: "Figma Tokens (JSON)" },
  ];

export const prototypeKinds: {
  id: PrototypeKind;
  label: string;
  what: string;
}[] = [
  { id: "landing", label: "Landing page", what: "a landing page" },
  { id: "dashboard", label: "Dashboard", what: "a dashboard" },
  { id: "components", label: "Component set", what: "a component set" },
];

export const aiTools: { id: AiTool; label: string }[] = [
  { id: "claude", label: "Claude" },
  { id: "cursor", label: "Cursor" },
  { id: "antigravity", label: "Antigravity" },
  { id: "loveable", label: "Loveable" },
  { id: "chatgpt", label: "ChatGPT" },
];

export type Include = {
  palette: boolean;
  typography: boolean;
  notes: boolean;
  sources?: boolean;
};

/* ---------- colour helpers ---------- */

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

const toHex = (n: number) =>
  Math.round(Math.max(0, Math.min(255, n)))
    .toString(16)
    .padStart(2, "0");

function mix(a: string, b: string, amount: number) {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return `#${toHex(x.r + (y.r - x.r) * amount)}${toHex(x.g + (y.g - x.g) * amount)}${toHex(x.b + (y.b - x.b) * amount)}`.toUpperCase();
}

function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function saturation(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  return max === 0 ? 0 : (max - min) / max;
}

export type ColourToken = { name: string; hex: string; role: string };

/**
 * Maps a board palette onto design-token roles: the lightest colour becomes the background, the darkest the text
 * colour, and the remaining colours are ranked by how vivid they are (primary, accent, secondary).
 */
export function colourTokens(
  palette: string[],
  overrides: Brief["colours"] = {},
): ColourToken[] {
  const unique = [...new Set(palette.map((c) => c.toUpperCase()))];
  const byLum = [...unique].sort((a, b) => luminance(a) - luminance(b));
  const dark = byLum[0] ?? "#1A1A1A";
  const light = byLum[byLum.length - 1] ?? "#FFFFFF";
  const vivid = unique
    .filter((c) => c !== dark && c !== light)
    .sort((a, b) => saturation(b) - saturation(a));
  const primary = vivid[0] ?? dark;
  const accent = vivid[1] ?? primary;
  const secondary = vivid[2] ?? accent;
  // Colours the user edited win over the derived ones; text-secondary follows the edited text/background unless set itself.
  const pick = (name: string, derived: string) =>
    (overrides[name] ?? derived).toUpperCase();
  const text = pick("text-primary", dark);
  const background = pick("background", light);
  return [
    { name: "primary", hex: pick("primary", primary), role: "Primary" },
    { name: "secondary", hex: pick("secondary", secondary), role: "Secondary" },
    { name: "accent", hex: pick("accent", accent), role: "Accent" },
    { name: "background", hex: background, role: "Background" },
    { name: "surface", hex: pick("surface", "#FFFFFF"), role: "Surface" },
    { name: "text-primary", hex: text, role: "Text primary" },
    {
      name: "text-secondary",
      hex: pick("text-secondary", mix(text, background, 0.45)),
      role: "Text secondary",
    },
  ];
}

/* ---------- typography + spacing ---------- */

const mono = "JetBrains Mono";

function fallback(description: string) {
  const d = description.toLowerCase();
  if (d.includes("mono")) return "monospace";
  if (d.includes("hand") || d.includes("script")) return "cursive";
  if (
    d.includes("sans") ||
    d.includes("grotesk") ||
    d.includes("geometric") ||
    d.includes("rounded")
  )
    return "sans-serif";
  if (d.includes("serif")) return "serif";
  return "sans-serif";
}

export type FontToken = {
  name: string;
  family: string;
  stack: string;
  role: string;
  sample: string;
};

export function fontTokens(brief: Brief): FontToken[] {
  const [headingDesc, bodyDesc] = brief.typography
    .split("/")
    .map((p) => p.trim());
  const q = (f: string) => `"${f}"`;
  return [
    {
      name: "heading",
      family: brief.fonts.heading,
      stack: `${q(brief.fonts.heading)}, ${fallback(headingDesc)}`,
      role: "Heading",
      sample: headingDesc,
    },
    {
      name: "body",
      family: brief.fonts.body,
      stack: `${q(brief.fonts.body)}, ${fallback(bodyDesc || headingDesc)}`,
      role: "Body",
      sample: bodyDesc || headingDesc,
    },
    {
      name: "mono",
      family: mono,
      stack: `${q(mono)}, monospace`,
      role: "Mono",
      sample: "Code & captions",
    },
  ];
}

const airy = [
  "calm",
  "minimal",
  "editorial",
  "curated",
  "poetic",
  "modern",
  "dreamy",
];

/** Open, editorial moods get a roomier spacing scale; bold, playful ones a tighter one. */
export function spacingTokens(brief: Brief) {
  const isAiry = brief.mood.some((m) => airy.includes(m.toLowerCase()));
  const scale = isAiry ? [8, 16, 32] : [4, 8, 16];
  return scale.map((px, i) => ({
    name: `space-${i + 1}`,
    value: `${px}px`,
    px,
  }));
}

export const googleFontsUrl = (brief: Brief) =>
  `https://fonts.googleapis.com/css2?${[
    brief.fonts.heading,
    brief.fonts.body,
    mono,
  ]
    .map((f) => `family=${f.replace(/ /g, "+")}`)
    .join("&")}&display=swap`;

/* ---------- design tokens ---------- */

export function buildTokens(
  board: Board,
  brief: Brief,
  format: TokenFormat,
  include: Include,
): string {
  const colours = colourTokens(brief.palette, brief.colours);
  const fonts = fontTokens(brief);
  const spacing = spacingTokens(brief);

  const notes = include.notes
    ? [
        `Mood: ${brief.mood.join(", ")}`,
        `Keywords: ${brief.keywords.join(", ")}`,
        `Notes: ${brief.notes}`,
      ]
    : [];

  if (format === "figma") {
    const data: Record<string, unknown> = {
      $metadata: {
        source: `my.Nook board "${board.title}"`,
        ...(include.notes
          ? { mood: brief.mood, keywords: brief.keywords, notes: brief.notes }
          : {}),
      },
    };
    if (include.palette) {
      data.color = Object.fromEntries(
        colours.map((c) => [c.name, { value: c.hex, type: "color" }]),
      );
    }
    if (include.typography) {
      data.fontFamilies = Object.fromEntries(
        fonts.map((f) => [f.name, { value: f.family, type: "fontFamilies" }]),
      );
    }
    if (include.notes) {
      data.spacing = Object.fromEntries(
        spacing.map((s) => [s.name, { value: String(s.px), type: "spacing" }]),
      );
    }
    return JSON.stringify(data, null, 2);
  }

  const groups: string[][] = [];
  if (include.palette) {
    groups.push([
      "/* Colours */",
      ...colours.map((c) => `--color-${c.name}: ${c.hex};`),
    ]);
  }
  if (include.typography) {
    groups.push([
      "/* Typography */",
      ...fonts.map((f) => `--font-${f.name}: ${f.stack};`),
    ]);
  }
  if (include.notes) {
    groups.push([
      "/* Spacing */",
      ...spacing.map((s) =>
        format === "tailwind"
          ? `--spacing-${s.name.replace("space-", "s")}: ${s.value};`
          : `--${s.name}: ${s.value};`,
      ),
    ]);
  }

  const header = [
    `/* Design language from my.Nook board "${board.title}" */`,
    ...notes.map((n) => `/* ${n} */`),
  ];
  const body = groups
    .map((g) => g.map((l) => `  ${l}`).join("\n"))
    .join("\n\n");
  const open =
    format === "tailwind" ? '@import "tailwindcss";\n\n@theme {' : ":root {";
  return `${header.join("\n")}\n${open}\n${body || "  /* Nothing selected. Tick an option to include in the design language. */"}\n}\n`;
}

/* ---------- AI prompt ---------- */

const introByTool: Record<AiTool, (what: string) => string> = {
  claude: (what) => `I'd like your help designing and building ${what}.`,
  cursor: (what) =>
    `Work in my current project and build ${what}. Follow the design direction below.`,
  antigravity: (what) =>
    `Plan and build ${what}, following the design direction below.`,
  loveable: (what) =>
    `Create ${what}: a complete, polished first version that follows the design direction below.`,
  chatgpt: (what) =>
    `Help me design and build ${what}, following the design direction below.`,
};

export function buildPrompt(opts: {
  board: Board;
  brief: Brief;
  references: Reference[];
  tool: AiTool;
  what: string;
  include: Include;
}): string {
  const { board, brief, references, tool, what, include } = opts;
  const colours = colourTokens(brief.palette, brief.colours);
  const fonts = fontTokens(brief);
  const target = what.trim() || "a landing page";
  const sources = [...new Set(references.map((r) => r.domain))];

  const lines = [
    introByTool[tool](target),
    "",
    `Design direction from my.Nook board "${board.title}":`,
  ];
  if (include.notes) {
    lines.push(
      `- Mood: ${brief.mood.join(", ")}`,
      `- Style keywords: ${brief.keywords.join(", ")}`,
      `- Notes: ${brief.notes}`,
    );
  }
  if (include.palette) {
    lines.push(
      `- Colour palette: ${colours.map((c) => `${c.name} ${c.hex}`).join(", ")}`,
    );
  }
  if (include.typography) {
    lines.push(
      `- Typography: ${fonts[0].family} for headings, ${fonts[1].family} for body (${brief.typography})`,
    );
  }
  if (include.sources && references.length > 0) {
    lines.push(
      `- Reference material: ${references.length} saved references (sources: ${sources.slice(0, 6).join(", ")})`,
    );
  }

  lines.push(
    "",
    "Requirements:",
    "- Use the palette and fonts as the design language (CSS variables) and keep contrast accessible.",
    "- Let the typography drive the hierarchy; fall back to generic stacks if a font isn't available.",
    "- Match the mood in layout, spacing and imagery; avoid generic template styling.",
    "- Explain any design decision that departs from this direction.",
  );
  return lines.join("\n");
}
