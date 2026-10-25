import { useSyncExternalStore } from "react";

/** Boards the user has hearted (true) or un-hearted (false) this session, over each board's own default. */
let overrides: Record<string, boolean> = {};
const listeners = new Set<() => void>();

export const favouriteActions = {
  set(boardId: string, favourite: boolean) {
    overrides = { ...overrides, [boardId]: favourite };
    listeners.forEach((l) => l());
  },
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export const useFavouriteOverrides = () =>
  useSyncExternalStore(subscribe, () => overrides);
