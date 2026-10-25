import { useSyncExternalStore } from "react";
import springMoodboard from "../assets/images/shared-spring-moodboard.jpg";
import packaging from "../assets/images/shared-packaging.jpg";
import fintechOnboarding from "../assets/images/shared-fintech-onboarding.jpg";
import posterLettering from "../assets/images/shared-poster-lettering.jpg";
import motionReel from "../assets/images/shared-motion-reel.jpg";
import calmInterface from "../assets/images/shared-calm-interface.jpg";

export type ShareRole = "Viewer" | "Commenter" | "Editor";
export type ShareKind = "board" | "references";

export type SharedItem = {
  id: string;
  kind: ShareKind;
  title: string;
  /** Board this lives on / opens (cover image comes from the board). */
  boardId: string;
  /** Own cover image; falls back to the board's cover. */
  imageUrl?: string;
  sharedBy: string;
  role: ShareRole;
  /** Days since it was shared. */
  daysAgo: number;
  count: number;
  status: "pending" | "accepted";
};

let items: SharedItem[] = [
  {
    id: "p1",
    kind: "board",
    title: "Spring Campaign Moodboard",
    boardId: "moodboards",
    imageUrl: springMoodboard,
    sharedBy: "aanya",
    role: "Editor",
    daysAgo: 1,
    count: 24,
    status: "pending",
  },
  {
    id: "p2",
    kind: "references",
    title: "Packaging references",
    boardId: "branding",
    imageUrl: packaging,
    sharedBy: "isha",
    role: "Commenter",
    daysAgo: 2,
    count: 8,
    status: "pending",
  },
  {
    id: "s1",
    kind: "board",
    title: "Fintech Onboarding Flows",
    boardId: "client-fintech-app",
    imageUrl: fintechOnboarding,
    sharedBy: "dev",
    role: "Editor",
    daysAgo: 4,
    count: 18,
    status: "accepted",
  },
  {
    id: "s2",
    kind: "board",
    title: "Poster Lettering Study",
    boardId: "typography",
    imageUrl: posterLettering,
    sharedBy: "kabir",
    role: "Viewer",
    daysAgo: 6,
    count: 12,
    status: "accepted",
  },
  {
    id: "s3",
    kind: "board",
    title: "Motion Reel Inspiration",
    boardId: "motion-studies",
    imageUrl: motionReel,
    sharedBy: "arjun",
    role: "Commenter",
    daysAgo: 12,
    count: 12,
    status: "accepted",
  },
  {
    id: "s4",
    kind: "references",
    title: "Calm interface patterns",
    boardId: "freelance-project-1",
    imageUrl: calmInterface,
    sharedBy: "isha",
    role: "Viewer",
    daysAgo: 21,
    count: 10,
    status: "accepted",
  },
];

const listeners = new Set<() => void>();
const commit = (next: SharedItem[]) => {
  items = next;
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useSharedItems = () =>
  useSyncExternalStore(subscribe, () => items);

export const sharedActions = {
  accept(id: string) {
    commit(
      items.map((i) =>
        i.id === id ? { ...i, status: "accepted" as const } : i,
      ),
    );
  },
  /** Declines an invite or leaves a board you were added to. */
  remove(id: string) {
    commit(items.filter((i) => i.id !== id));
  },
};
