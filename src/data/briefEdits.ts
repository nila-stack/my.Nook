import { useSyncExternalStore } from "react";
import type { Board } from "./boards";

type Brief = NonNullable<Board["brief"]>;

/** Brief edits made on a board's Build page (session only), shared so the board sidebar reflects them live. */
let edits: Record<string, Brief> = {};
const listeners = new Set<() => void>();

export const briefEdits = {
  set(boardId: string, brief: Brief | null) {
    const next = { ...edits };
    if (brief) next[boardId] = brief;
    else delete next[boardId];
    edits = next;
    listeners.forEach((l) => l());
  },
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

/** The edited brief for a board, or undefined when it still has its original one. */
export const useBriefEdit = (boardId: string) =>
  useSyncExternalStore(subscribe, () => edits[boardId]);
