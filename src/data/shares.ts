import { useSyncExternalStore } from "react";

export type ShareScope = "board" | "essential";
export type ShareAccess = "view" | "edit";

export type Share = {
  /** A team member's id, or an email address for someone outside the team. */
  who: string;
  scope: ShareScope;
  access: ShareAccess;
};

/** Who each board has been shared with this session (the whole board wins over essentials-only). */
let shares: Record<string, Share[]> = {};
const listeners = new Set<() => void>();

export const shareActions = {
  add(boardId: string, added: Share[]) {
    const current = shares[boardId] ?? [];
    const kept = current.filter((s) => !added.some((a) => a.who === s.who));
    shares = { ...shares, [boardId]: [...kept, ...added] };
    listeners.forEach((l) => l());
  },
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

const empty: Share[] = [];
export const useShares = (boardId: string) =>
  useSyncExternalStore(subscribe, () => shares[boardId] ?? empty);
