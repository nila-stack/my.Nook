import { useSyncExternalStore } from "react";

export type Comment = {
  id: string;
  /** The reference the comment is about. */
  refId: string;
  /** Running number on the board ("#1", "#2"). */
  n: number;
  author: string;
  text: string;
  resolved: boolean;
};

type State = {
  open: boolean;
  /** How the panel was opened: from the sidebar ("all") or from a reference's comment icon ("reference"). */
  scope: "all" | "reference";
  /** Reference the composer is aimed at (set by a card's comment icon). */
  target: string | null;
  byBoard: Record<string, Comment[]>;
};

/** Starter comments so every board opens with a conversation already going (authors are the workspace's teammates). */
const seed = (boardId: string, rows: [string, string, string][]): Comment[] =>
  rows.map(([ref, author, text], i) => ({
    id: `seed-${boardId}-${i + 1}`,
    refId:
      ref === "ref-1" || ref === "ref-2" || ref === "ref-3"
        ? ref
        : `${boardId}-${ref}`,
    n: i + 1,
    author,
    text,
    resolved: false,
  }));

let state: State = {
  open: false,
  scope: "all",
  target: null,
  byBoard: {
    typography: seed("typography", [
      ["1", "Kabir Mehta", "We can go ahead with this reference."],
      ["6", "Remi", "Can this style also be an option?"],
      [
        "3",
        "Aanya Sharma",
        "The cut-paper letterforms feel right for the headline. Could we test them at poster scale?",
      ],
      [
        "9",
        "Dev Malhotra",
        "Love the Bengali lettering here. Worth checking the licence before we use it.",
      ],
      [
        "12",
        "Isha Rao",
        "Strong contrast, but the body copy needs a calmer typeface to sit beside it.",
      ],
    ]),
    "portfolio-reference": seed("portfolio-reference", [
      [
        "ref-1",
        "Aanya Sharma",
        "The collage cover is the energy we want for the portfolio home page.",
      ],
      [
        "ref-2",
        "Kabir Mehta",
        "Nice grid. Let's borrow how the project titles are set.",
      ],
      [
        "ref-3",
        "Remi",
        "Too busy for a case study page, but great as a landing hero.",
      ],
    ]),
    "freelance-project-1": seed("freelance-project-1", [
      [
        "2",
        "Isha Rao",
        "Clean spacing on the product page. This is close to what the client described.",
      ],
      [
        "5",
        "Dev Malhotra",
        "Can we use this card layout for the pricing section?",
      ],
      [
        "8",
        "Aanya Sharma",
        "The muted palette reads well. I'd keep the accent colour even softer.",
      ],
      ["11", "Kabir Mehta", "Good example of how to handle the empty state."],
    ]),
    "assignment-project": seed("assignment-project", [
      [
        "1",
        "Remi",
        "The botanical pixel pattern could work for the cover of the submission.",
      ],
      [
        "4",
        "Kabir Mehta",
        "Halftone texture like this would suit the poster set. Adding it to the shortlist.",
      ],
      [
        "7",
        "Isha Rao",
        "Blue on pale grey is a great limited palette for this brief.",
      ],
      [
        "10",
        "Dev Malhotra",
        "Can we find the original source for this one? Needs a credit line.",
      ],
      [
        "15",
        "Aanya Sharma",
        "Playful use of colour. It breaks the grid on purpose, which is what we want to show.",
      ],
    ]),
    illustration: seed("illustration", [
      [
        "3",
        "Aanya Sharma",
        "The linework on this one is lovely. Perfect reference for the character sheet.",
      ],
      [
        "8",
        "Kabir Mehta",
        "Warm paper tones plus folk motifs. This is the direction for the editorial pieces.",
      ],
      [
        "14",
        "Remi",
        "Can we try this level of texture on the cover illustration?",
      ],
      [
        "22",
        "Dev Malhotra",
        "Great colour story, but the shapes are quite complex to animate.",
      ],
      [
        "31",
        "Isha Rao",
        "Love the dreamy gradient in the sky. Saving it for the mood board.",
      ],
    ]),
    "client-fintech-app": seed("client-fintech-app", [
      [
        "2",
        "Dev Malhotra",
        "Clear hierarchy on the balance screen. The big number first works really well.",
      ],
      [
        "6",
        "Isha Rao",
        "Dark UI with a single bright accent. Let's test this for the transactions tab.",
      ],
      [
        "9",
        "Aanya Sharma",
        "The card style here is easy to scan. We should match the corner radius.",
      ],
      [
        "13",
        "Remi",
        "Is this chart readable at small sizes? Need to check contrast.",
      ],
      [
        "17",
        "Kabir Mehta",
        "Good onboarding flow. Short steps with one action each.",
      ],
    ]),
    moodboards: seed("moodboards", [
      [
        "1",
        "Isha Rao",
        "Muted browns and creams are exactly the tone the client asked for.",
      ],
      [
        "5",
        "Aanya Sharma",
        "Editorial layout with generous margins. Quiet, but confident.",
      ],
      [
        "8",
        "Remi",
        "This one is a bit cold next to the rest. Maybe a secondary option.",
      ],
      [
        "12",
        "Dev Malhotra",
        "The photography here sets the mood well. Can we find similar images?",
      ],
    ]),
    "motion-studies": seed("motion-studies", [
      [
        "2",
        "Kabir Mehta",
        "Smooth easing, nothing abrupt. This is the pace we want for the intro.",
      ],
      [
        "4",
        "Dev Malhotra",
        "Flat shapes with warm colour pairs. Easy to rebuild in Lottie.",
      ],
      [
        "7",
        "Isha Rao",
        "Love how the loop hides its seam. Noting how long each cycle is.",
      ],
      [
        "11",
        "Aanya Sharma",
        "Too fast for a UI transition, but useful for the hero animation.",
      ],
    ]),
    branding: seed("branding", [
      [
        "1",
        "Aanya Sharma",
        "Bold packaging with a very simple logotype. This is the confidence we want.",
      ],
      [
        "3",
        "Kabir Mehta",
        "Saturated red with a bit of blue. Strong, and it still feels playful.",
      ],
      ["6", "Remi", "Can we try a version of the logo mark at this tiny size?"],
      [
        "9",
        "Isha Rao",
        "The print finish here is gorgeous. Worth asking the printer about spot colours.",
      ],
    ]),
  },
};
const listeners = new Set<() => void>();
const set = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const empty: Comment[] = [];

export const useCommentsUi = () => useSyncExternalStore(subscribe, () => state);
export const useBoardComments = (boardId: string) =>
  useSyncExternalStore(subscribe, () => state.byBoard[boardId] ?? empty);

export const commentActions = {
  /** From the sidebar call `openAll()`; from a reference pass its id. */
  open(target: string | null = null) {
    set({ open: true, target, scope: target ? "reference" : state.scope });
  },
  openAll() {
    set({ open: true, target: null, scope: "all" });
  },
  close() {
    set({ open: false, target: null });
  },
  add(boardId: string, refId: string, text: string, author = "Remi") {
    const list = state.byBoard[boardId] ?? [];
    const n = list.reduce((max, c) => Math.max(max, c.n), 0) + 1;
    set({
      byBoard: {
        ...state.byBoard,
        [boardId]: [
          ...list,
          {
            id: `c-${Date.now()}-${n}`,
            refId,
            n,
            author,
            text,
            resolved: false,
          },
        ],
      },
      target: null,
    });
  },
  toggleResolved(boardId: string, id: string) {
    const list = state.byBoard[boardId] ?? [];
    set({
      byBoard: {
        ...state.byBoard,
        [boardId]: list.map((c) =>
          c.id === id ? { ...c, resolved: !c.resolved } : c,
        ),
      },
    });
  },
  remove(boardId: string, id: string) {
    const list = state.byBoard[boardId] ?? [];
    set({
      byBoard: { ...state.byBoard, [boardId]: list.filter((c) => c.id !== id) },
    });
  },
};
