import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { Avatar } from "../components/ui/Avatar";
import { Menu, MenuOption } from "../components/ui/Menu";
import { SearchField } from "../components/ui";
import { personById, people } from "../data/people";
import { sharedActions, useSharedItems, type SharedItem } from "../data/shared";
import { useBoards } from "../data/unsorted";

type SortKey = "recent" | "oldest" | "az";

const sortOptions: { id: SortKey; label: string }[] = [
  { id: "recent", label: "Most recent" },
  { id: "oldest", label: "Oldest first" },
  { id: "az", label: "A–Z" },
];

const roleStyle: Record<SharedItem["role"], string> = {
  Editor: "bg-accent-tint text-ink",
  Commenter: "bg-[#fff4d6] text-ink",
  Viewer: "bg-surface-soft text-text-secondary",
};

const ago = (d: number) =>
  d === 0
    ? "today"
    : d === 1
      ? "1 day ago"
      : d < 14
        ? `${d} days ago`
        : `${Math.round(d / 7)}w ago`;

const smallButton =
  "flex h-8 items-center rounded-full border border-border bg-surface px-4 text-[12px] leading-none text-ink transition-colors hover:bg-surface-soft";

const sharers = people.filter((p) => p.id !== "remi");

export function SharedWithMe() {
  const navigate = useNavigate();
  const boards = useBoards();
  const items = useSharedItems();
  const [by, setBy] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [notice, setNotice] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const tell = (text: string) => {
    setNotice(text);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setNotice(null), 3200);
  };

  const pending = items.filter((i) => i.status === "pending");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = items.filter(
      (i) =>
        i.status === "accepted" &&
        (!by || i.sharedBy === by) &&
        (!q ||
          i.title.toLowerCase().includes(q) ||
          personById(i.sharedBy).name.toLowerCase().includes(q)),
    );
    if (sort === "oldest")
      return [...list].sort((a, b) => b.daysAgo - a.daysAgo);
    if (sort === "az")
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    return [...list].sort((a, b) => a.daysAgo - b.daysAgo);
  }, [items, by, query, sort]);

  const accepted = items.filter((i) => i.status === "accepted");
  const coverFor = (boardId: string) =>
    boards.find((b) => b.id === boardId)?.imageUrl;

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pl-11 pr-11 pb-16 pt-[52px] xl:pr-[134px]">
        <div className="flex items-center gap-3">
          <h1 className="text-[27px] font-semibold leading-tight text-ink">
            Shared with me
          </h1>
        </div>

        {pending.length > 0 && (
          <section aria-label="Pending invites" className="flex flex-col gap-4">
            <h2 className="flex items-center gap-2.5 text-[14px] font-normal uppercase leading-none text-text-secondary">
              Pending {pending.length === 1 ? "invite" : "invites"}
              <span className="flex h-[20px] min-w-[26px] items-center justify-center rounded-full bg-accent px-2 text-[11px] font-medium leading-none text-white">
                {pending.length}
              </span>
            </h2>
            <ul className="flex flex-col gap-3">
              {pending.map((i) => {
                const who = personById(i.sharedBy);
                return (
                  <li
                    key={i.id}
                    className="flex flex-wrap items-center gap-5 rounded-[20px] border border-[#e6e6e6] bg-surface px-5 py-4"
                  >
                    <span
                      className="size-[56px] shrink-0 rounded-[12px] bg-placeholder bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${i.imageUrl ?? coverFor(i.boardId)})`,
                      }}
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <p className="truncate text-[14px] font-medium leading-none text-ink">
                        {i.title}
                      </p>
                      <p className="flex items-center gap-2 text-[12px] leading-none text-text-secondary">
                        <Avatar name={who.name} size={18} />
                        {who.name} invited you as {i.role.toLowerCase()} ·{" "}
                        {ago(i.daysAgo)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          sharedActions.remove(i.id);
                          tell(`Declined “${i.title}”.`);
                        }}
                        className={smallButton}
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          sharedActions.accept(i.id);
                          tell(`Added “${i.title}” to Shared with me.`);
                        }}
                        className="flex h-8 items-center rounded-full bg-accent px-5 text-[12px] font-medium leading-none text-white transition-colors hover:bg-accent-hover"
                      >
                        Accept
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <div className="flex flex-wrap items-center gap-[15px]">
          <SearchField
            containerClassName="flex-1 min-w-[260px] max-w-[627px]"
            placeholder="Search shared boards and people"
            iconTone="neutral"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Menu
            align="right"
            label={by ? personById(by).name : "Shared by"}
            className="flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-5 text-[14px] leading-none text-ink transition-colors hover:bg-surface-soft"
          >
            {(close) => (
              <>
                <MenuOption
                  selected={by === null}
                  onClick={() => {
                    setBy(null);
                    close();
                  }}
                >
                  Anyone
                </MenuOption>
                {sharers.map((p) => (
                  <MenuOption
                    key={p.id}
                    selected={by === p.id}
                    onClick={() => {
                      setBy(p.id);
                      close();
                    }}
                  >
                    {p.name}
                  </MenuOption>
                ))}
              </>
            )}
          </Menu>
          <Menu
            align="right"
            label="Sort"
            className="flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-5 text-[14px] leading-none text-ink transition-colors hover:bg-surface-soft"
          >
            {(close) =>
              sortOptions.map((o) => (
                <MenuOption
                  key={o.id}
                  selected={sort === o.id}
                  onClick={() => {
                    setSort(o.id);
                    close();
                  }}
                >
                  {o.label}
                </MenuOption>
              ))
            }
          </Menu>
          <p
            aria-live="polite"
            className="text-[13px] leading-none text-text-secondary empty:hidden"
          >
            {notice}
          </p>
        </div>

        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-border bg-surface/60 py-24 text-center">
            <p className="text-[16px] font-medium text-ink">
              {accepted.length === 0
                ? "Nothing shared with you yet"
                : "No shared items match"}
            </p>
            <p className="max-w-sm text-[14px] text-text-secondary">
              {accepted.length === 0
                ? "When someone shares a board or references with you, it will show up here."
                : "Try a different search, or clear the Shared by filter."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-[35px] gap-y-[35px] sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((i) => {
              const who = personById(i.sharedBy);
              return (
                <article
                  key={i.id}
                  className="group relative flex flex-col rounded-card bg-surface shadow-[0px_0px_18px_0px_rgba(187,187,187,0.25)]"
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/boards/${i.boardId}`)}
                    aria-label={`Open ${i.title}`}
                    className="relative block h-[173px] w-full overflow-hidden rounded-t-card bg-placeholder bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${i.imageUrl ?? coverFor(i.boardId)})`,
                    }}
                  >
                    <span className="absolute left-3 top-3 rounded-full bg-surface/95 px-3 py-1.5 text-[11px] font-medium leading-none text-ink shadow-sm">
                      {i.kind === "board" ? "Board" : "References"}
                    </span>
                  </button>
                  <div className="flex flex-col gap-2.5 px-[18px] pb-4 pt-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="truncate text-[15px] font-medium leading-tight text-ink">
                        {i.title}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium leading-none ${roleStyle[i.role]}`}
                      >
                        {i.role}
                      </span>
                    </div>
                    <p className="flex items-center gap-2 text-[12px] leading-none text-text-secondary">
                      <Avatar name={who.name} size={20} />
                      <span className="truncate">
                        {who.name} · {i.count}{" "}
                        {i.count === 1 ? "item" : "items"} · {ago(i.daysAgo)}
                      </span>
                    </p>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => navigate(`/boards/${i.boardId}`)}
                        className={smallButton}
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          tell(`Saved a copy of “${i.title}” to your boards.`)
                        }
                        className={smallButton}
                      >
                        Save a copy
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          sharedActions.remove(i.id);
                          tell(`You left “${i.title}”.`);
                        }}
                        className="ml-auto flex h-8 items-center px-2 text-[12px] leading-none text-text-secondary transition-colors hover:text-accent"
                      >
                        Leave
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
