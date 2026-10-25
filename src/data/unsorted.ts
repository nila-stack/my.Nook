import { useMemo, useSyncExternalStore } from "react";
import { boards, type Board } from "./boards";
import { useCreatedBoards } from "./createdBoards";
import { useFavouriteOverrides } from "./favourites";
import type { Reference } from "./references";

export type UnsortedItem = {
  id: string;
  title: string;
  domain: string;
  imageUrl: string;
  /** The board AI suggests this item belongs to. */
  boardId: string;
  essential: boolean;
  tags: string[];
};

export const unsortedTags = [
  "Inspiration",
  "Reference",
  "Typography",
  "Colour",
  "Layout",
  "Texture",
];

// Every file in assets/unsorted/ (01 = newest). Each one is filed under the board its content fits best,
// which is what the AI Suggestions panel counts.
const files = import.meta.glob<string>("../assets/unsorted/*.{jpg,gif}", {
  eager: true,
  query: "?url",
  import: "default",
});

const manifest: { title: string; domain: string; boardId: string }[] = [
  {
    title: "Cursor loop animation",
    domain: "dribbble.com",
    boardId: "motion-studies",
  },
  {
    title: "Macha app concept",
    domain: "dribbble.com",
    boardId: "freelance-project-1",
  },
  {
    title: "Practice tracker app",
    domain: "mobbin.com",
    boardId: "client-fintech-app",
  },
  {
    title: "Clothesline landscape",
    domain: "behance.net",
    boardId: "illustration",
  },
  {
    title: "Google Labs website",
    domain: "siteinspire.com",
    boardId: "freelance-project-1",
  },
  {
    title: "Invoices app screen",
    domain: "mobbin.com",
    boardId: "client-fintech-app",
  },
  {
    title: "Calm app screens",
    domain: "land-book.com",
    boardId: "freelance-project-1",
  },
  {
    title: "Pixel pattern study",
    domain: "behance.net",
    boardId: "assignment-project",
  },
  {
    title: "Editorial card layouts",
    domain: "pinterest.com",
    boardId: "moodboards",
  },
  {
    title: "Pixel botanical art",
    domain: "are.na",
    boardId: "assignment-project",
  },
  {
    title: "Character blog screens",
    domain: "dribbble.com",
    boardId: "illustration",
  },
  { title: "Co-design book cover", domain: "savee.it", boardId: "moodboards" },
  {
    title: "Gradient motion UI",
    domain: "vimeo.com",
    boardId: "motion-studies",
  },
  {
    title: "Hola lightbulb animation",
    domain: "motionographer.com",
    boardId: "motion-studies",
  },
  {
    title: "Photo collage poster",
    domain: "behance.net",
    boardId: "assignment-project",
  },
  {
    title: "Bengali cut-paper lettering",
    domain: "typewolf.com",
    boardId: "typography",
  },
  {
    title: "Mushroom field guide",
    domain: "instagram.com",
    boardId: "illustration",
  },
  {
    title: "Win magazine covers",
    domain: "fontsinuse.com",
    boardId: "typography",
  },
  {
    title: "Dreams over the Earth",
    domain: "behance.net",
    boardId: "illustration",
  },
  {
    title: "Dashboard design",
    domain: "dribbble.com",
    boardId: "client-fintech-app",
  },
  {
    title: "2025 portfolio cover",
    domain: "behance.net",
    boardId: "portfolio-reference",
  },
  {
    title: "Film festival poster",
    domain: "behance.net",
    boardId: "typography",
  },
  { title: "Café brand system", domain: "behance.net", boardId: "branding" },
  {
    title: "Quest UI animation",
    domain: "dribbble.com",
    boardId: "motion-studies",
  },
  {
    title: "Dark English landing page",
    domain: "awwwards.com",
    boardId: "freelance-project-1",
  },
  {
    title: "Ploof pet app",
    domain: "mobbin.com",
    boardId: "client-fintech-app",
  },
  {
    title: "Gastronomy festival screens",
    domain: "behance.net",
    boardId: "illustration",
  },
  {
    title: "Bengali fish lettering",
    domain: "behance.net",
    boardId: "typography",
  },
  {
    title: "Risograph numeral 5",
    domain: "dribbble.com",
    boardId: "typography",
  },
  {
    title: "Botanical map interface",
    domain: "awwwards.com",
    boardId: "freelance-project-1",
  },
  {
    title: "Podcast landing page",
    domain: "siteinspire.com",
    boardId: "freelance-project-1",
  },
  {
    title: "BOOM type poster",
    domain: "fontsinuse.com",
    boardId: "typography",
  },
  {
    title: "Natural wine website",
    domain: "awwwards.com",
    boardId: "branding",
  },
];

function buildItems(): UnsortedItem[] {
  const urlFor = (n: number) =>
    Object.entries(files).find(([path]) =>
      new RegExp(`/${String(n).padStart(2, "0")}\\.(jpg|gif)$`).test(path),
    )?.[1];
  return manifest.flatMap((m, i) => {
    const imageUrl = urlFor(i + 1);
    return imageUrl
      ? [
          {
            id: `unsorted-${i + 1}`,
            title: m.title,
            domain: m.domain,
            imageUrl,
            boardId: m.boardId,
            essential: false,
            tags: [],
          },
        ]
      : [];
  });
}

let items = buildItems();
/** Items already filed into a board from Unsorted; each board page appends these to its own references. */
let moved: Record<string, UnsortedItem[]> = {};
const listeners = new Set<() => void>();

function commit(
  nextItems: UnsortedItem[],
  nextMoved: Record<string, UnsortedItem[]> = moved,
) {
  items = nextItems;
  moved = nextMoved;
  listeners.forEach((l) => l());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useUnsorted() {
  return useSyncExternalStore(subscribe, () => items);
}

function useMoved() {
  return useSyncExternalStore(subscribe, () => moved);
}

const toReference = (item: UnsortedItem): Reference => ({
  id: item.id,
  domain: item.domain,
  imageUrl: item.imageUrl,
  favourite: item.essential,
  tags: item.tags.length > 0 ? item.tags : undefined,
});

/** References that were moved into this board from Unsorted. */
export function useMovedReferences(boardId: string | undefined): Reference[] {
  const all = useMoved();
  return useMemo(
    () => (boardId ? (all[boardId] ?? []).map(toReference) : []),
    [all, boardId],
  );
}

/** The boards with their item counts including anything moved in from Unsorted. */
export function useBoards(): Board[] {
  const all = useMoved();
  const created = useCreatedBoards();
  const hearts = useFavouriteOverrides();
  return useMemo(
    () =>
      [...created, ...boards].map((b) => ({
        ...b,
        itemCount: b.itemCount + (all[b.id]?.length ?? 0),
        favourite: hearts[b.id] ?? b.favourite,
      })),
    [all, created, hearts],
  );
}

/**
 * Stand-in for what a collection link (Pinterest board, Are.na channel…) would contain: a run of the sample images,
 * starting at a point chosen by the link so different links show different things.
 */
export function collectionSamples(
  seed: string,
  count = 12,
): { title: string; imageUrl: string }[] {
  const pool = buildItems();
  if (pool.length === 0) return [];
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const start = h % pool.length;
  return Array.from({ length: Math.min(count, pool.length) }, (_, i) => {
    const item = pool[(start + i) % pool.length];
    return { title: item.title, imageUrl: item.imageUrl };
  });
}

export const unsortedActions = {
  /** Adds freshly imported items (pasted links, uploaded files) to the top of Unsorted. */
  add(added: UnsortedItem[]) {
    if (added.length > 0) commit([...added, ...items]);
  },
  remove(ids: Iterable<string>) {
    const gone = new Set(ids);
    commit(items.filter((i) => !gone.has(i.id)));
  },
  /** Files the items into a board (they leave Unsorted and show up on that board). */
  moveTo(ids: Iterable<string>, boardId: string) {
    const hit = new Set(ids);
    const picked = items.filter((i) => hit.has(i.id));
    if (picked.length === 0) return;
    commit(
      items.filter((i) => !hit.has(i.id)),
      { ...moved, [boardId]: [...(moved[boardId] ?? []), ...picked] },
    );
  },
  /** Puts items straight into a board (used when restoring from Trash / Archive). */
  addToBoard(added: UnsortedItem[], boardId: string) {
    if (added.length === 0) return;
    commit(items, {
      ...moved,
      [boardId]: [...(moved[boardId] ?? []), ...added],
    });
  },
  setEssential(ids: Iterable<string>, essential: boolean) {
    const hit = new Set(ids);
    commit(items.map((i) => (hit.has(i.id) ? { ...i, essential } : i)));
  },
  addTag(ids: Iterable<string>, tag: string) {
    const hit = new Set(ids);
    commit(
      items.map((i) =>
        hit.has(i.id) && !i.tags.includes(tag)
          ? { ...i, tags: [...i.tags, tag] }
          : i,
      ),
    );
  },
};
