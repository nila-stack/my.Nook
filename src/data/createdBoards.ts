import { useSyncExternalStore } from "react";
import { boards as seedBoards, type Board, type BoardCategory } from "./boards";

let created: Board[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useCreatedBoards = () =>
  useSyncExternalStore(subscribe, () => created);

const slug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "board";

/** Adds an empty board and returns it. Ids stay unique even when two boards share a name. */
export function createBoard(title: string, categories: BoardCategory[]): Board {
  const taken = new Set([...seedBoards, ...created].map((b) => b.id));
  const base = slug(title);
  let id = base;
  for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;
  const board: Board = {
    id,
    title: title.trim(),
    itemCount: 0,
    updatedLabel: "Updated just now",
    categories,
    project: categories.includes("Projects"),
  };
  // Newest first, ahead of the seeded boards.
  created = [board, ...created];
  emit();
  return board;
}

// Which create dialog is open (null = none). Shared so the sidebar menu and the Boards toolbar open the same one.
export type CreateDialog = "board" | "link" | null;
/** Optional context for the dialog — e.g. Unsorted items to file into the board once it is created. */
export type CreatePayload = { moveIds?: string[] };
let dialog: CreateDialog = null;
let payload: CreatePayload | null = null;
const dialogSubscribe = subscribe;
export const useCreateDialog = () =>
  useSyncExternalStore(dialogSubscribe, () => dialog);
export const useCreatePayload = () =>
  useSyncExternalStore(dialogSubscribe, () => payload);
export const openCreateDialog = (
  next: Exclude<CreateDialog, null>,
  context?: CreatePayload,
) => {
  dialog = next;
  payload = context ?? null;
  emit();
};
export const closeCreateDialog = () => {
  dialog = null;
  payload = null;
  emit();
};
