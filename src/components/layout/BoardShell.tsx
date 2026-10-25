import type { ReactNode } from "react";
import type { Board } from "../../data/boards";
import { BoardSidebar } from "./BoardSidebar";
import { AiFab } from "./AiFab";
import { CommentsPanel } from "./CommentsPanel";

/** Shell for screens scoped to a single board (Board Detail, AI Handoff): board sidebar + warm-wash content + AI fab. */
export function BoardShell({
  board,
  children,
  hideBrief = false,
}: {
  board: Board;
  children: ReactNode;
  hideBrief?: boolean;
}) {
  return (
    <div className="flex min-h-screen bg-surface">
      <BoardSidebar board={board} hideBrief={hideBrief} />
      <main className="content-wash min-h-screen flex-1 overflow-x-hidden">{children}</main>
      <AiFab />
      <CommentsPanel board={board} />
    </div>
  );
}
