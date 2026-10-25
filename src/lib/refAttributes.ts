import type { Board } from "../data/boards";
import type { Reference } from "../data/references";

export type FilterGroupId = "category" | "style" | "colour" | "source";

export const filterGroups: { id: FilterGroupId; label: string }[] = [
  { id: "category", label: "Category" },
  { id: "style", label: "Style" },
  { id: "colour", label: "Colour" },
  { id: "source", label: "Source" },
];

export type RefAttributes = Record<FilterGroupId, string>;

const categories = [
  "Poster",
  "Layout",
  "Photography",
  "Illustration",
  "Interface",
];

/** Rough colour names for a hex value, so palette swatches read as words in the filter. */
export function colourName(hex: string): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 510;
  const sat = max === min ? 0 : (max - min) / (255 - Math.abs(max + min - 255));
  if (l > 0.88) return "White";
  if (l < 0.14) return "Black";
  if (sat < 0.18) return l > 0.55 ? "Light grey" : "Grey";
  let h = 0;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  if (h < 0) h += 360;
  if (h < 15 || h >= 345) return l > 0.75 ? "Pink" : "Red";
  if (h < 40) return l > 0.7 ? "Peach" : "Orange";
  if (h < 70) return "Yellow";
  if (h < 160) return "Green";
  if (h < 200) return "Teal";
  if (h < 260) return "Blue";
  if (h < 300) return "Purple";
  return "Pink";
}

/**
 * Filter attributes for a reference. Source is real (the reference's domain); the rest are assigned from the board's
 * own brief (styles, palette) and a fixed rotation until real tagging exists, so each board has a stable, varied set.
 */
/** A stable number per reference (its trailing id number), so assignments don't shuffle when others are added. */
function stableIndex(ref: Reference) {
  const m = ref.id.match(/(\d+)$/);
  if (m) return Number(m[1]);
  return [...ref.id].reduce((n, c) => n + c.charCodeAt(0), 0);
}

/**
 * The tags on a reference. Tags the user gave it win; otherwise it gets one or two of the board's mood tags so every
 * mood tag has references behind it.
 */
export function tagsFor(board: Board, ref: Reference): string[] {
  if (ref.tags && ref.tags.length > 0) return ref.tags;
  const moods = board.brief?.mood ?? [];
  if (moods.length === 0) return [];
  const n = stableIndex(ref);
  const tags = [moods[n % moods.length]];
  if (n % 2 === 0 && moods.length > 1) tags.push(moods[(n + 1) % moods.length]);
  return tags;
}

export function attributesFor(board: Board, ref: Reference): RefAttributes {
  const index = stableIndex(ref);
  const styles = board.brief?.keywords ?? ["Reference"];
  const colours = (board.brief?.palette ?? ["#888888"]).map(colourName);
  return {
    category: categories[(index + board.id.length) % categories.length],
    style: styles[index % styles.length],
    colour: colours[(index * 3 + 1) % colours.length],
    source: ref.domain,
  };
}
