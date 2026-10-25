import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { Avatar } from "../components/ui/Avatar";
import { Menu, MenuOption } from "../components/ui/Menu";
import { BoardCard, Button, SearchField, Toggle } from "../components/ui";
import { useBoards } from "../data/unsorted";
import {
  assignableRoles,
  teamActions,
  useMembers,
  useTeamTools,
  WORKSPACE,
  type Member,
  type TeamRole,
} from "../data/team";
import plusWhite from "../assets/icons/plus-white.svg";
import logoClaude from "../assets/images/ai-logo-claude.png";
import logoCursor from "../assets/images/ai-logo-cursor.png";
import logoAntigravity from "../assets/images/ai-logo-antigravity.png";
import logoLoveable from "../assets/images/ai-logo-loveable.png";
import logoChatgpt from "../assets/images/ai-logo-chatgpt.png";

const toolLogos: Record<string, string> = {
  claude: logoClaude,
  cursor: logoCursor,
  antigravity: logoAntigravity,
  loveable: logoLoveable,
  chatgpt: logoChatgpt,
};

const teamBoardIds = ["client-fintech-app", "branding", "moodboards"];

const roleHelp: Record<TeamRole, string> = {
  Owner: "Full control, including billing",
  Admin: "Manage members and settings",
  Editor: "Add and edit references",
  Viewer: "View and comment only",
};

const panelClass =
  "flex flex-col gap-4 rounded-[20px] border border-[#e6e6e6] bg-surface p-5";
const outlineSmall =
  "flex h-8 items-center whitespace-nowrap rounded-full border border-border bg-surface px-4 text-[12px] leading-none text-ink transition-colors hover:bg-surface-soft";

const lastActive = (m: Member) =>
  m.status === "invited"
    ? "Invite pending"
    : m.lastActiveDays === 0
      ? "Active today"
      : `Active ${m.lastActiveDays}d ago`;

export function TeamWorkspace() {
  const navigate = useNavigate();
  const boards = useBoards();
  const members = useMembers();
  const tools = useTeamTools();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<TeamRole | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] =
    useState<Exclude<TeamRole, "Owner">>("Editor");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const tell = (text: string) => {
    setNotice(text);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setNotice(null), 3200);
  };

  const active = members.filter((m) => m.status === "active").length;
  const seatsUsed = members.length;
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter(
      (m) =>
        (!roleFilter || m.role === roleFilter) &&
        (!q ||
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q)),
    );
  }, [members, query, roleFilter]);

  const sendInvite = (e: FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Enter a valid email address.");
      return;
    }
    if (seatsUsed >= WORKSPACE.seats) {
      setError(`All ${WORKSPACE.seats} member spots are in use.`);
      return;
    }
    if (!teamActions.invite(value, inviteRole)) {
      setError("That person is already on the team.");
      return;
    }
    setEmail("");
    setError(null);
    setInviteOpen(false);
    tell(`Invite sent to ${value} as ${inviteRole.toLowerCase()}.`);
  };

  const teamBoards = teamBoardIds
    .map((id) => boards.find((b) => b.id === id))
    .filter((b) => b !== undefined);
  const storagePct = Math.round(
    (WORKSPACE.storageUsedGb / WORKSPACE.storageTotalGb) * 100,
  );
  const connected = tools.filter((t) => t.connected).length;

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pl-11 pr-11 pb-16 pt-[52px] xl:pr-[134px]">
        <div className="flex flex-col gap-2">
          <h1 className="text-[27px] font-semibold leading-tight text-ink">
            Team / Workspace
          </h1>
          <p className="text-[16px] leading-snug text-text-secondary">
            Manage who&apos;s in your workspace and what they can do.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-7 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="flex min-w-0 flex-col gap-8">
            <section className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-[#e6e6e6] bg-surface px-6 py-5">
              <div className="flex items-center gap-4">
                <span className="flex size-[56px] items-center justify-center rounded-[16px] bg-accent-tint text-[22px] font-semibold leading-none text-accent">
                  M
                </span>
                <div className="flex flex-col gap-2">
                  <h2 className="text-[17px] font-semibold leading-none text-ink">
                    {WORKSPACE.name}
                  </h2>
                  <p className="text-[13px] leading-none text-text-secondary">
                    {WORKSPACE.plan} · {active} active{" "}
                    {active === 1 ? "member" : "members"}
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                onClick={() => setInviteOpen((v) => !v)}
                aria-expanded={inviteOpen}
                className="h-9 gap-1.5 px-[22px] !text-[13px] leading-none"
              >
                <img src={plusWhite} alt="" className="size-[12px]" />
                Invite people
              </Button>
            </section>

            {inviteOpen && (
              <form
                onSubmit={sendInvite}
                noValidate
                className="flex flex-col gap-4 rounded-[20px] bg-accent-tint/60 p-5"
                aria-label="Invite people"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    placeholder="name@company.com"
                    aria-label="Email address"
                    aria-invalid={error ? true : undefined}
                    className="h-10 min-w-[240px] flex-1 rounded-full border border-border bg-surface px-5 text-[14px] text-ink outline-none transition-colors focus:border-accent"
                  />
                  <Menu
                    label={inviteRole}
                    className="flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-5 text-[14px] leading-none text-ink transition-colors hover:bg-surface-soft"
                  >
                    {(close) =>
                      assignableRoles.map((r) => (
                        <MenuOption
                          key={r}
                          selected={inviteRole === r}
                          onClick={() => {
                            setInviteRole(r);
                            close();
                          }}
                        >
                          {r}
                        </MenuOption>
                      ))
                    }
                  </Menu>
                  <Button
                    variant="primary"
                    type="submit"
                    className="h-10 px-6 !text-[14px] leading-none"
                  >
                    Send invite
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setInviteOpen(false);
                      setError(null);
                    }}
                    className="px-2 text-[13px] leading-none text-text-secondary hover:text-ink"
                  >
                    Cancel
                  </button>
                </div>
                <p
                  className={`text-[12px] leading-none ${error ? "text-accent" : "text-text-secondary"}`}
                  role={error ? "alert" : undefined}
                >
                  {error ??
                    `${roleHelp[inviteRole]}. ${WORKSPACE.seats - seatsUsed} of ${WORKSPACE.seats} member spots left.`}
                </p>
              </form>
            )}

            <section className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-[20px] font-semibold leading-none text-ink">
                    Members
                  </h2>
                  <span className="rounded-full bg-surface-soft px-3 py-1.5 text-[13px] font-medium leading-none text-ink">
                    {members.length}
                  </span>
                  <p
                    aria-live="polite"
                    className="text-[13px] leading-none text-text-secondary empty:hidden"
                  >
                    {notice}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <SearchField
                    containerClassName="w-[240px]"
                    placeholder="Search members"
                    iconTone="neutral"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <Menu
                    align="right"
                    label={roleFilter ?? "All roles"}
                    className="flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-5 text-[14px] leading-none text-ink transition-colors hover:bg-surface-soft"
                  >
                    {(close) => (
                      <>
                        <MenuOption
                          selected={roleFilter === null}
                          onClick={() => {
                            setRoleFilter(null);
                            close();
                          }}
                        >
                          All roles
                        </MenuOption>
                        {(["Owner", ...assignableRoles] as TeamRole[]).map(
                          (r) => (
                            <MenuOption
                              key={r}
                              selected={roleFilter === r}
                              onClick={() => {
                                setRoleFilter(r);
                                close();
                              }}
                            >
                              {r}
                            </MenuOption>
                          ),
                        )}
                      </>
                    )}
                  </Menu>
                </div>
              </div>

              {visible.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-border bg-surface/60 py-16 text-center">
                  <p className="text-[16px] font-medium text-ink">
                    No members match
                  </p>
                  <p className="max-w-xs text-[14px] text-text-secondary">
                    Try a different name, or clear the role filter.
                  </p>
                </div>
              ) : (
                <ul className="flex flex-col gap-3">
                  {visible.map((m) => (
                    <li
                      key={m.id}
                      className="flex min-h-[97px] flex-wrap items-start gap-4 rounded-[16px] border border-[#e6e6e6] bg-surface p-4"
                    >
                      <Avatar name={m.name} size={42} className="self-center" />
                      <div className="flex min-w-[180px] flex-1 flex-col gap-1.5 self-center">
                        <p className="text-[15px] font-medium leading-none text-ink">
                          {m.name}
                          {m.id === "remi" && (
                            <span className="ml-2 text-[12px] font-normal text-text-secondary">
                              (you)
                            </span>
                          )}
                        </p>
                        <p className="text-[13px] leading-none text-text-secondary">
                          {m.email}
                        </p>
                      </div>
                      <span
                        className={`${m.role === "Owner" ? "self-center" : "mt-[5.5px]"} rounded-full px-3 py-1.5 text-[12px] leading-none ${
                          m.status === "invited"
                            ? "bg-[#fff4d6] text-ink"
                            : "bg-surface-soft text-text-secondary"
                        }`}
                      >
                        {lastActive(m)}
                      </span>
                      {m.status === "invited" && (
                        <button
                          type="button"
                          onClick={() => teamActions.activate(m.id)}
                          className={`${outlineSmall} mt-[2.5px]`}
                        >
                          Mark joined
                        </button>
                      )}
                      <div className="flex shrink-0 flex-col items-center gap-1 self-center">
                        {m.role === "Owner" ? (
                          <span className="flex h-8 w-[110px] items-center justify-center rounded-full bg-accent-tint text-[13px] font-medium leading-none text-ink">
                            Owner
                          </span>
                        ) : (
                          <Menu
                            align="right"
                            label={m.role}
                            className="flex h-8 w-[110px] items-center justify-center gap-2.5 rounded-full border border-border bg-surface px-4 text-[13px] leading-none text-ink transition-colors hover:bg-surface-soft"
                          >
                            {(close) =>
                              assignableRoles.map((r) => (
                                <MenuOption
                                  key={r}
                                  selected={m.role === r}
                                  onClick={() => {
                                    teamActions.setRole(m.id, r);
                                    tell(
                                      `${m.name} is now ${r === "Admin" ? "an" : "a"} ${r.toLowerCase()}.`,
                                    );
                                    close();
                                  }}
                                >
                                  {r}
                                </MenuOption>
                              ))
                            }
                          </Menu>
                        )}
                        {m.role !== "Owner" && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                teamActions.remove(m.id);
                                tell(
                                  m.status === "invited"
                                    ? `Cancelled the invite to ${m.email}.`
                                    : `Removed ${m.name} from the workspace.`,
                                );
                              }}
                              className="flex h-6 items-center px-2 text-[12px] leading-none text-text-secondary underline underline-offset-[3px] transition-colors hover:text-accent"
                            >
                              {m.status === "invited" ? "Cancel" : "Remove"}
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-[20px] font-semibold leading-none text-ink">
                Team boards
              </h2>
              <div className="grid grid-cols-1 gap-x-[35px] gap-y-[35px] sm:grid-cols-2 lg:grid-cols-3">
                {teamBoards.map((b) => (
                  <BoardCard
                    key={b.id}
                    title={b.title}
                    meta={`${b.itemCount} items · ${b.updatedLabel}`}
                    imageUrl={b.imageUrl}
                    onClick={() => navigate(`/boards/${b.id}`)}
                  />
                ))}
              </div>
            </section>
          </div>

          <aside className="flex flex-col gap-5 xl:sticky xl:top-6 xl:self-start">
            <section className={panelClass}>
              <h2 className="text-[14px] font-semibold leading-none text-ink">
                Usage
              </h2>
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between text-[12px] leading-none">
                  <span className="text-ink">Members</span>
                  <span className="text-text-secondary">
                    {seatsUsed} of {WORKSPACE.seats}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-soft">
                  <div
                    className="h-full rounded-full bg-accent transition-[width]"
                    style={{ width: `${(seatsUsed / WORKSPACE.seats) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between text-[12px] leading-none">
                  <span className="text-ink">Storage</span>
                  <span className="text-text-secondary">
                    {WORKSPACE.storageUsedGb} GB of {WORKSPACE.storageTotalGb}{" "}
                    GB
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-soft">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${storagePct}%` }}
                  />
                </div>
              </div>
            </section>

            <section className={panelClass}>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-[14px] font-semibold leading-none text-ink">
                  AI tools for the team
                </h2>
                <p className="text-[12px] leading-[1.4] text-text-secondary">
                  {connected} connected. Everyone in the workspace can hand off
                  to these.
                </p>
              </div>
              <ul className="flex flex-col gap-3">
                {tools.map((t) => (
                  <li key={t.id} className="flex items-center gap-3">
                    <img
                      src={toolLogos[t.id]}
                      alt=""
                      className="size-[28px] shrink-0 object-contain"
                    />
                    <span className="flex-1 text-[13px] leading-none text-ink">
                      {t.name}
                    </span>
                    <Toggle
                      aria-label={`${t.name} for the team`}
                      checked={t.connected}
                      onChange={(e) =>
                        teamActions.setTool(t.id, e.target.checked)
                      }
                      className="!h-5 !w-9 before:!size-4 checked:before:!translate-x-4"
                    />
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
