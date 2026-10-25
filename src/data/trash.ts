import { useSyncExternalStore } from "react";
import { unsortedActions, type UnsortedItem } from "./unsorted";

export type TrashKind = "trash" | "archive";

export type TrashItem = {
  id: string;
  kind: TrashKind;
  title: string;
  domain: string;
  imageUrl: string;
  /** The board the reference came from — restoring puts it back there. */
  boardId: string;
  essential: boolean;
  /** Days since it was deleted (trash) or archived (archive). */
  daysAgo: number;
};

/** Deleted items are kept this long before being removed for good. */
export const TRASH_RETENTION_DAYS = 30;

// Every file in assets/trash/ and assets/archive/ (01 = most recent), with the board it came from.
const files = import.meta.glob<string>(
  "../assets/{trash,archive}/*.{jpg,gif}",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
);

type Entry = {
  title: string;
  domain: string;
  boardId: string;
  daysAgo: number;
};

const trashEntries: Entry[] = [
  {
    title: "Tomato sticker",
    domain: "dribbble.com",
    boardId: "illustration",
    daysAgo: 2,
  },
  {
    title: "Brand identity sheet",
    domain: "behance.net",
    boardId: "branding",
    daysAgo: 4,
  },
  {
    title: "Reaching hand animation",
    domain: "vimeo.com",
    boardId: "motion-studies",
    daysAgo: 6,
  },
  {
    title: "Orange poster",
    domain: "pinterest.com",
    boardId: "typography",
    daysAgo: 8,
  },
  {
    title: "Scrolling reminder poster",
    domain: "instagram.com",
    boardId: "typography",
    daysAgo: 10,
  },
  {
    title: "It's okay to slow down",
    domain: "behance.net",
    boardId: "illustration",
    daysAgo: 12,
  },
  {
    title: "Weekly digest layout",
    domain: "land-book.com",
    boardId: "freelance-project-1",
    daysAgo: 15,
  },
  {
    title: "Printed book spread",
    domain: "pinterest.com",
    boardId: "assignment-project",
    daysAgo: 18,
  },
  {
    title: "Garden party tickets",
    domain: "behance.net",
    boardId: "branding",
    daysAgo: 20,
  },
  {
    title: "Play dot website",
    domain: "awwwards.com",
    boardId: "freelance-project-1",
    daysAgo: 22,
  },
  {
    title: "Postage stamp set",
    domain: "dribbble.com",
    boardId: "illustration",
    daysAgo: 24,
  },
  {
    title: "Playing card packaging",
    domain: "behance.net",
    boardId: "branding",
    daysAgo: 26,
  },
  {
    title: "Graphic design book flip",
    domain: "vimeo.com",
    boardId: "motion-studies",
    daysAgo: 28,
  },
];

const archiveEntries: Entry[] = [
  {
    title: "Brand guidelines",
    domain: "behance.net",
    boardId: "branding",
    daysAgo: 3,
  },
  {
    title: "Vintage cat book cover",
    domain: "pinterest.com",
    boardId: "illustration",
    daysAgo: 7,
  },
  {
    title: "Colourful web layout",
    domain: "siteinspire.com",
    boardId: "freelance-project-1",
    daysAgo: 12,
  },
  {
    title: "Icons & illustration sheet",
    domain: "dribbble.com",
    boardId: "illustration",
    daysAgo: 18,
  },
  {
    title: "Old screen print cat",
    domain: "behance.net",
    boardId: "illustration",
    daysAgo: 25,
  },
  {
    title: "The art lettering poster",
    domain: "fontsinuse.com",
    boardId: "typography",
    daysAgo: 33,
  },
  {
    title: "Tea packaging set",
    domain: "behance.net",
    boardId: "branding",
    daysAgo: 41,
  },
];

function build(): TrashItem[] {
  const make = (kind: TrashKind, entries: Entry[]) =>
    entries.flatMap((e, i) => {
      const n = String(i + 1).padStart(2, "0");
      const imageUrl = Object.entries(files).find(([path]) =>
        path.includes(`/assets/${kind}/${n}.`),
      )?.[1];
      return imageUrl
        ? [
            {
              id: `${kind}-${i + 1}`,
              kind,
              title: e.title,
              domain: e.domain,
              imageUrl,
              boardId: e.boardId,
              essential: false,
              daysAgo: e.daysAgo,
            },
          ]
        : [];
    });
  return [...make("trash", trashEntries), ...make("archive", archiveEntries)];
}

let items = build();
const listeners = new Set<() => void>();

function commit(next: TrashItem[]) {
  items = next;
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useTrashItems = () => useSyncExternalStore(subscribe, () => items);

const asUnsorted = (i: TrashItem): UnsortedItem => ({
  id: i.id,
  title: i.title,
  domain: i.domain,
  imageUrl: i.imageUrl,
  boardId: i.boardId,
  essential: i.essential,
  tags: [],
});

export const trashActions = {
  /** Brings items back onto the board they came from. */
  restore(ids: Iterable<string>) {
    const hit = new Set(ids);
    const picked = items.filter((i) => hit.has(i.id));
    for (const boardId of new Set(picked.map((i) => i.boardId))) {
      unsortedActions.addToBoard(
        picked.filter((i) => i.boardId === boardId).map(asUnsorted),
        boardId,
      );
    }
    commit(items.filter((i) => !hit.has(i.id)));
  },
  /** Removes items for good. */
  deleteForever(ids: Iterable<string>) {
    const hit = new Set(ids);
    commit(items.filter((i) => !hit.has(i.id)));
  },
  /** Archive -> Trash. */
  moveToTrash(ids: Iterable<string>) {
    const hit = new Set(ids);
    commit(
      items.map((i) =>
        hit.has(i.id) ? { ...i, kind: "trash" as const, daysAgo: 0 } : i,
      ),
    );
  },
  setEssential(ids: Iterable<string>, essential: boolean) {
    const hit = new Set(ids);
    commit(items.map((i) => (hit.has(i.id) ? { ...i, essential } : i)));
  },
};
