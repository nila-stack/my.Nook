import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { AiFab } from "./AiFab";
import { CreateDialogs } from "./CreateDialogs";

/** Shared shell for every authenticated (post-onboarding) screen: sidebar + warm-wash content area + AI fab. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <main className="content-wash-home min-h-screen flex-1 overflow-x-hidden">{children}</main>
      <AiFab />
      <CreateDialogs />
    </div>
  );
}
