import { useSyncExternalStore } from "react";

export type BoardOrigin = { label: string; to: string };

const DEFAULT: BoardOrigin = { label: "Boards", to: "/home" };
const KEY = "nook.boardOrigin";

/** The list a board was opened from (Boards, Projects or Favourites), so the page's breadcrumb and back arrow lead back to it. */
let origin: BoardOrigin = (() => {
  try {
    const saved = sessionStorage.getItem(KEY);
    if (saved) return JSON.parse(saved) as BoardOrigin;
  } catch {
    /* storage unavailable: the default applies */
  }
  return DEFAULT;
})();
const listeners = new Set<() => void>();

export const boardOriginActions = {
  set(next: BoardOrigin) {
    origin = next;
    try {
      sessionStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    listeners.forEach((l) => l());
  },
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export const useBoardOrigin = () =>
  useSyncExternalStore(subscribe, () => origin);
