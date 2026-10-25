import { useSyncExternalStore } from "react";

export type TeamRole = "Owner" | "Admin" | "Editor" | "Viewer";

export const assignableRoles: Exclude<TeamRole, "Owner">[] = [
  "Admin",
  "Editor",
  "Viewer",
];

export type Member = {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: "active" | "invited";
  /** Days since last active (active members only). */
  lastActiveDays?: number;
};

export const WORKSPACE = {
  name: "My Workspace",
  plan: "Pro Plan",
  seats: 10,
  storageUsedGb: 2.4,
  storageTotalGb: 10,
};

let members: Member[] = [
  {
    id: "remi",
    name: "Remi",
    email: "remi@mynook.app",
    role: "Owner",
    status: "active",
    lastActiveDays: 0,
  },
  {
    id: "aanya",
    name: "Aanya Sharma",
    email: "aanya@studiolumen.in",
    role: "Admin",
    status: "active",
    lastActiveDays: 0,
  },
  {
    id: "kabir",
    name: "Kabir Mehta",
    email: "kabir@studiolumen.in",
    role: "Editor",
    status: "active",
    lastActiveDays: 1,
  },
  {
    id: "isha",
    name: "Isha Rao",
    email: "isha@pixelhaus.co",
    role: "Editor",
    status: "active",
    lastActiveDays: 3,
  },
  {
    id: "dev",
    name: "Dev Malhotra",
    email: "dev@pixelhaus.co",
    role: "Viewer",
    status: "active",
    lastActiveDays: 6,
  },
  {
    id: "meera",
    name: "Meera Nair",
    email: "meera@brightfolk.com",
    role: "Viewer",
    status: "invited",
  },
];

export type TeamTool = { id: string; name: string; connected: boolean };
let tools: TeamTool[] = [
  { id: "claude", name: "Claude", connected: true },
  { id: "cursor", name: "Cursor", connected: true },
  { id: "antigravity", name: "Antigravity", connected: false },
  { id: "loveable", name: "Loveable", connected: false },
  { id: "chatgpt", name: "ChatGPT", connected: true },
];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useMembers = () => useSyncExternalStore(subscribe, () => members);
export const useTeamTools = () => useSyncExternalStore(subscribe, () => tools);

export const teamActions = {
  setRole(id: string, role: Exclude<TeamRole, "Owner">) {
    members = members.map((m) =>
      m.id === id && m.role !== "Owner" ? { ...m, role } : m,
    );
    emit();
  },
  remove(id: string) {
    members = members.filter((m) => m.id !== id || m.role === "Owner");
    emit();
  },
  /** Returns false when the email is already on the team. */
  invite(email: string, role: Exclude<TeamRole, "Owner">) {
    const clean = email.trim().toLowerCase();
    if (members.some((m) => m.email.toLowerCase() === clean)) return false;
    const name = clean
      .split("@")[0]
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    members = [
      ...members,
      { id: `inv-${clean}`, name, email: clean, role, status: "invited" },
    ];
    emit();
    return true;
  },
  activate(id: string) {
    members = members.map((m) =>
      m.id === id ? { ...m, status: "active", lastActiveDays: 0 } : m,
    );
    emit();
  },
  setTool(id: string, connected: boolean) {
    tools = tools.map((t) => (t.id === id ? { ...t, connected } : t));
    emit();
  },
};
