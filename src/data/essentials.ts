import { useMemo, useSyncExternalStore } from "react";
import { referencesByBoard, type Reference } from "./references";
import { useMovedReferences } from "./unsorted";

/** Essential marks the user has made per board (session only); until a board is touched its starred references are the default. */
let marked: Record<string, string[]> = {};
const listeners = new Set<() => void>();

export const essentialActions = {
  set(boardId: string, ids: Set<string>) {
    marked = { ...marked, [boardId]: [...ids] };
    listeners.forEach((l) => l());
  },
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

/** The ids marked essential on a board, out of the given references. */
export function useEssentialIds(
  boardId: string,
  refs: Reference[],
): Set<string> {
  const stored = useSyncExternalStore(subscribe, () => marked[boardId]);
  return useMemo(
    () =>
      stored
        ? new Set(stored)
        : new Set(refs.filter((r) => r.favourite).map((r) => r.id)),
    [stored, refs],
  );
}

/**
 * What a hand-off of this board carries: its essential references, or every reference when none are marked yet.
 * Shared by the AI Hand-Off and Review & Send pages so both match the board.
 */
export function useHandoffReferences(boardId: string) {
  const moved = useMovedReferences(boardId);
  const all = useMemo(
    () => [...moved, ...(referencesByBoard[boardId] ?? [])],
    [moved, boardId],
  );
  const essentialIds = useEssentialIds(boardId, all);
  const essential = useMemo(
    () => all.filter((r) => essentialIds.has(r.id)),
    [all, essentialIds],
  );
  const usingEssential = essential.length > 0;
  return {
    all,
    essential,
    send: usingEssential ? essential : all,
    usingEssential,
  };
}
