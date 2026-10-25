import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { BoardShell } from "../components/layout/BoardShell";
import { Breadcrumb, Checkbox, SearchField } from "../components/ui";
import { BackLink } from "../components/ui/BackLink";
import { Menu, MenuOption, toolbarButton } from "../components/ui/Menu";
import { openCreateDialog } from "../data/createdBoards";
import {
  unsortedActions,
  unsortedTags,
  useBoards,
  useUnsorted,
  type UnsortedItem,
} from "../data/unsorted";
import chevronDown from "../assets/icons/chevron-down.svg";
import starFilled from "../assets/icons/star-filled.svg";
import starOutline from "../assets/icons/star-outline.svg";
import iconLink from "../assets/icons/nav-import-links.svg";
import iconPlus from "../assets/icons/plus-black.svg";
import iconExtension from "../assets/icons/nav-ai-integrations.svg";
import iconSparkle from "../assets/icons/nav-send-ai.svg";
import { useBoardOrigin } from "../data/boardOrigin";

type SortKey = "newest" | "oldest" | "az" | "za";
type View = "grid" | "list";

const sortOptions: { id: SortKey; label: string }[] = [
  { id: "newest", label: "Newest First" },
  { id: "oldest", label: "Oldest First" },
  { id: "az", label: "A–Z" },
  { id: "za", label: "Z–A" },
];

const PAGE_SIZE = 12;

function ItemCard({
  item,
  selected,
  onSelect,
  onStar,
}: {
  item: UnsortedItem;
  selected: boolean;
  onSelect: () => void;
  onStar: () => void;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[16px] bg-surface shadow-card transition-shadow ${selected ? "ring-2 ring-accent" : ""}`}
    >
      <div
        className="relative h-[124px] w-full bg-placeholder bg-cover bg-center"
        style={{ backgroundImage: `url(${item.imageUrl})` }}
      >
        <Checkbox
          aria-label={`Select ${item.title}`}
          checked={selected}
          onChange={onSelect}
          className="absolute left-2.5 top-2.5 size-[18px] shadow-sm"
        />
        <button
          type="button"
          aria-label={
            item.essential ? "Remove from essential" : "Mark essential"
          }
          aria-pressed={item.essential}
          onClick={onStar}
          className="absolute right-2.5 top-2.5 size-[16px]"
        >
          <img
            src={item.essential ? starFilled : starOutline}
            alt=""
            className="size-full"
          />
        </button>
      </div>
      <div className="flex flex-col gap-1.5 px-3 pb-2.5 pt-2.5">
        <p className="truncate text-[13px] font-medium leading-none text-ink">
          {item.title}
        </p>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[11px] leading-none text-text-secondary">
            {item.domain}
          </p>
        </div>
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-accent-tint px-2 py-1 text-[10px] leading-none text-ink"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ItemRow({
  item,
  selected,
  onSelect,
  onStar,
}: {
  item: UnsortedItem;
  selected: boolean;
  onSelect: () => void;
  onStar: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-4 rounded-[14px] bg-surface p-3 shadow-card ${selected ? "ring-2 ring-accent" : ""}`}
    >
      <Checkbox
        aria-label={`Select ${item.title}`}
        checked={selected}
        onChange={onSelect}
      />
      <span
        className="size-[56px] shrink-0 rounded-[10px] bg-placeholder bg-cover bg-center"
        style={{ backgroundImage: `url(${item.imageUrl})` }}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="truncate text-[14px] font-medium leading-none text-ink">
          {item.title}
        </p>
        <p className="truncate text-[12px] leading-none text-text-secondary">
          {item.domain}
        </p>
      </div>
      <div className="hidden flex-wrap gap-1 sm:flex">
        {item.tags.map((t) => (
          <span
            key={t}
            className="rounded-full bg-accent-tint px-2.5 py-1 text-[11px] leading-none text-ink"
          >
            {t}
          </span>
        ))}
      </div>
      <button
        type="button"
        aria-label={item.essential ? "Remove from essential" : "Mark essential"}
        aria-pressed={item.essential}
        onClick={onStar}
        className="size-[18px]"
      >
        <img
          src={item.essential ? starFilled : starOutline}
          alt=""
          className="size-full"
        />
      </button>
    </div>
  );
}

const panelClass =
  "flex flex-col gap-4 rounded-[20px] border border-[#e6e6e6] bg-surface p-5";

/**
 * The Unsorted inbox. Opened from a board (`/boards/:boardId/unsorted`) it runs in that board's context:
 * breadcrumb, board sidebar, and a one-click "Move to <board>" for whatever you select.
 */
export function Unsorted() {
  const origin = useBoardOrigin();
  const navigate = useNavigate();
  const { boardId } = useParams();
  const boards = useBoards();
  const board = boardId ? boards.find((b) => b.id === boardId) : undefined;
  const all = useUnsorted();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [view, setView] = useState<View>("grid");
  const [boardFilter, setBoardFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const [notice, setNotice] = useState<{
    text: string;
    movedTo?: string;
  } | null>(null);
  const noticeTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  const tell = (text: string, movedTo?: string) => {
    setNotice({ text, movedTo });
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 3200);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = all.filter(
      (i) =>
        (!boardFilter || i.boardId === boardFilter) &&
        (!q ||
          i.title.toLowerCase().includes(q) ||
          i.domain.toLowerCase().includes(q)),
    );
    if (sort === "oldest") return [...list].reverse();
    if (sort === "az")
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "za")
      return [...list].sort((a, b) => b.title.localeCompare(a.title));
    return list;
  }, [all, query, sort, boardFilter]);

  const shown = filtered.slice(0, visible);
  const selectedIds = [...selected].filter((id) =>
    all.some((i) => i.id === id),
  );
  const selectedCount = selectedIds.length;
  const allShownSelected =
    shown.length > 0 && shown.every((i) => selected.has(i.id));

  const suggestions = useMemo(() => {
    const counts = new Map<string, number>();
    all.forEach((i) => counts.set(i.boardId, (counts.get(i.boardId) ?? 0) + 1));
    return boards
      .filter((b) => counts.has(b.id))
      .map((b) => ({ board: b, count: counts.get(b.id) ?? 0 }))
      .sort((a, b) => b.count - a.count);
  }, [all, boards]);
  const suggestionRows = showAllSuggestions
    ? suggestions
    : suggestions.slice(0, 5);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  const noun = (n: number) => `${n} ${n === 1 ? "item" : "items"}`;

  const moveTo = (targetId: string) => {
    const target = boards.find((b) => b.id === targetId);
    unsortedActions.moveTo(selectedIds, targetId);
    setSelected(new Set());
    tell(
      `Moved ${noun(selectedCount)} to ${target?.title ?? "the board"}.`,
      targetId,
    );
  };

  const suggestedHere = board ? all.filter((i) => i.boardId === board.id) : [];

  const markEssential = () => {
    const picked = all.filter((i) => selected.has(i.id));
    const everyEssential = picked.every((i) => i.essential);
    unsortedActions.setEssential(selectedIds, !everyEssential);
    tell(
      everyEssential
        ? `Removed essential from ${noun(selectedCount)}.`
        : `Marked ${noun(selectedCount)} essential.`,
    );
  };

  const remove = () => {
    unsortedActions.remove(selectedIds);
    setSelected(new Set());
    tell(`Deleted ${noun(selectedCount)}.`);
  };

  const content = (
    <div
      className={`flex flex-col gap-6 pb-16 ${board ? "pl-10 pr-10 pt-[27px]" : "pl-11 pr-11 pt-[52px]"} xl:pr-[134px]`}
    >
      {board && (
        <Breadcrumb
          items={[
            { label: origin.label, to: origin.to },
            { label: board.title, to: `/boards/${board.id}` },
            { label: "Unsorted" },
          ]}
        />
      )}
      {/* 5px + the 3px the title sits inside its 40px control row = the 8px title / subheading gap used on every page. */}
      <div className="flex flex-col gap-[5px]">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              {board && (
                <BackLink to={`/boards/${board.id}`} label="Back to board" />
              )}
              <h1 className="text-[27px] font-semibold leading-tight text-ink">
                Unsorted
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SearchField
              containerClassName="w-[260px]"
              placeholder="Search unsorted…"
              iconTone="neutral"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisible(PAGE_SIZE);
              }}
            />
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
            <div
              role="group"
              aria-label="View"
              className="flex h-10 overflow-hidden rounded-full border border-border bg-surface"
            >
              {(["grid", "list"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  onClick={() => setView(v)}
                  className={`px-4 text-[13px] capitalize leading-none transition-colors ${
                    view === v
                      ? "bg-accent-tint font-medium text-ink"
                      : "text-text-secondary hover:bg-surface-soft"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="text-[16px] leading-snug text-text-secondary">
          {board
            ? `Select the files that belong in ${board.title} and move them in.`
            : "Captured from the web, your device or other sources. Move them to a board, tag them or mark as essential."}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 pr-1 text-[13px] leading-none text-ink">
          <Checkbox
            aria-label="Select all shown items"
            checked={allShownSelected}
            indeterminate={selectedCount > 0 && !allShownSelected}
            disabled={shown.length === 0}
            onChange={() =>
              setSelected(
                allShownSelected ? new Set() : new Set(shown.map((i) => i.id)),
              )
            }
          />
          {selectedCount} Selected
        </label>

        {board ? (
          <button
            type="button"
            disabled={selectedCount === 0}
            onClick={() => moveTo(board.id)}
            className="flex h-9 items-center rounded-full bg-accent px-5 text-[13px] font-medium leading-none text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-[#e8e8e8] disabled:text-[#b3b3b3]"
          >
            {selectedCount > 0
              ? `Move ${selectedCount} to ${board.title}`
              : `Move to ${board.title}`}
          </button>
        ) : (
          <Menu label="Move to board" disabled={selectedCount === 0}>
            {(close) => (
              <>
                <button
                  type="button"
                  onClick={() => {
                    openCreateDialog("board", { moveIds: selectedIds });
                    close();
                  }}
                  className="flex h-[36px] w-full items-center px-[14px] text-left text-[14px] font-medium leading-none text-accent hover:bg-surface-soft"
                >
                  + Create New
                </button>
                <hr className="mx-[14px] my-1 border-border/70" />
                {boards.map((b) => (
                  <MenuOption
                    key={b.id}
                    onClick={() => {
                      moveTo(b.id);
                      close();
                    }}
                  >
                    {b.title}
                  </MenuOption>
                ))}
              </>
            )}
          </Menu>
        )}
        <Menu label="Add tag" disabled={selectedCount === 0}>
          {(close) =>
            unsortedTags.map((t) => (
              <MenuOption
                key={t}
                onClick={() => {
                  unsortedActions.addTag(selectedIds, t);
                  tell(`Tagged ${noun(selectedCount)} “${t}”.`);
                  close();
                }}
              >
                {t}
              </MenuOption>
            ))
          }
        </Menu>
        <button
          type="button"
          disabled={selectedCount === 0}
          onClick={markEssential}
          className={toolbarButton}
        >
          <img src={starFilled} alt="" className="size-[14px]" />
          Mark essential
        </button>
        <button
          type="button"
          disabled={selectedCount === 0}
          onClick={remove}
          className={toolbarButton}
        >
          Delete
        </button>

        <p
          aria-live="polite"
          className="flex items-center gap-2 text-[13px] leading-none text-text-secondary empty:hidden"
        >
          {notice?.text}
          {notice?.movedTo && (
            <button
              type="button"
              onClick={() => navigate(`/boards/${notice.movedTo}`)}
              className="text-ink underline hover:text-accent"
            >
              View board
            </button>
          )}
        </p>
      </div>

      {boardFilter && (
        <div className="flex items-center gap-2 text-[13px] leading-none text-text-secondary">
          Showing suggested matches for
          <span className="flex items-center gap-2 rounded-full bg-accent-tint px-3 py-1.5 text-ink">
            {boards.find((b) => b.id === boardFilter)?.title}
            <button
              type="button"
              aria-label="Clear filter"
              onClick={() => {
                setBoardFilter(null);
                setVisible(PAGE_SIZE);
              }}
              className="text-[14px] leading-none"
            >
              ×
            </button>
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-7 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-6">
          {all.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-border bg-surface/60 py-24 text-center">
              <p className="text-[16px] font-medium text-ink">
                Nothing waiting. You&apos;re all caught up.
              </p>
              <p className="max-w-xs text-[14px] text-text-secondary">
                Newly captured items will appear here.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-border bg-surface/60 py-24 text-center">
              <p className="text-[16px] font-medium text-ink">No items match</p>
              <p className="max-w-xs text-[14px] text-text-secondary">
                Try a different search or clear the board filter.
              </p>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
              {shown.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  selected={selected.has(item.id)}
                  onSelect={() => toggle(item.id)}
                  onStar={() =>
                    unsortedActions.setEssential([item.id], !item.essential)
                  }
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {shown.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  selected={selected.has(item.id)}
                  onSelect={() => toggle(item.id)}
                  onStar={() =>
                    unsortedActions.setEssential([item.id], !item.essential)
                  }
                />
              ))}
            </div>
          )}

          {filtered.length > shown.length && (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="h-10 rounded-full border border-border bg-surface px-6 text-[14px] leading-none text-ink transition-colors hover:bg-surface-soft"
              >
                Show more
              </button>
              <p className="text-[12px] leading-none text-text-secondary">
                Showing {shown.length} of {filtered.length}
              </p>
            </div>
          )}
        </div>

        <aside className="flex flex-col gap-5 xl:sticky xl:top-6 xl:self-start">
          {board ? (
            <section className={panelClass}>
              <div className="flex items-start gap-3">
                <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-accent-tint">
                  <img src={iconSparkle} alt="" className="size-[16px]" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <h2 className="truncate text-[13px] font-semibold leading-none text-ink">
                    Suggested for {board.title}
                  </h2>
                  <p className="line-clamp-2 text-[12px] leading-[1.4] text-text-secondary">
                    {suggestedHere.length > 0
                      ? `${noun(suggestedHere.length)} in Unsorted look like ${board.title} references.`
                      : `Nothing in Unsorted looks like ${board.title} right now.`}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  disabled={suggestedHere.length === 0}
                  onClick={() => {
                    setBoardFilter(boardFilter === board.id ? null : board.id);
                    setVisible(PAGE_SIZE);
                  }}
                  className="h-10 rounded-full border border-border bg-surface text-[13px] leading-none text-ink transition-colors hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {boardFilter === board.id
                    ? "Show all unsorted"
                    : "Show suggested only"}
                </button>
                <button
                  type="button"
                  disabled={suggestedHere.length === 0}
                  onClick={() => {
                    setSelected(new Set(suggestedHere.map((i) => i.id)));
                    setBoardFilter(board.id);
                    setVisible(PAGE_SIZE);
                  }}
                  className="h-10 rounded-full bg-accent-tint text-[13px] font-medium leading-none text-ink transition-colors hover:bg-[#ffd5c4] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Select all suggested
                </button>
              </div>
            </section>
          ) : (
            <section className={panelClass}>
              <div className="flex items-start gap-3">
                <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-accent-tint">
                  <img src={iconSparkle} alt="" className="size-[16px]" />
                </span>
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-[14px] font-semibold leading-none text-ink">
                    AI Suggestions
                  </h2>
                  <p className="text-[12px] leading-[1.4] text-text-secondary">
                    We found some possible matches based on the content of your
                    items.
                  </p>
                </div>
              </div>
              <ul className="flex flex-col gap-1">
                {suggestionRows.map(({ board, count }) => (
                  <li key={board.id}>
                    <button
                      type="button"
                      aria-pressed={boardFilter === board.id}
                      onClick={() => {
                        setBoardFilter(
                          boardFilter === board.id ? null : board.id,
                        );
                        setVisible(PAGE_SIZE);
                      }}
                      className={`flex w-full items-center gap-3 rounded-[12px] p-2 text-left transition-colors ${
                        boardFilter === board.id
                          ? "bg-accent-tint"
                          : "hover:bg-surface-soft"
                      }`}
                    >
                      <span
                        className="size-[34px] shrink-0 rounded-[8px] bg-placeholder bg-cover bg-center"
                        style={
                          board.imageUrl
                            ? { backgroundImage: `url(${board.imageUrl})` }
                            : undefined
                        }
                      />
                      <span className="flex-1 truncate text-[13px] leading-none text-ink">
                        {board.title}
                      </span>
                      <span className="flex h-[20px] min-w-[26px] items-center justify-center rounded-full bg-surface-soft px-1.5 text-[11px] leading-none text-text-secondary">
                        {count}
                      </span>
                      <img
                        src={chevronDown}
                        alt=""
                        className="w-[8px] -rotate-90"
                      />
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setShowAllSuggestions((v) => !v)}
                className="h-10 rounded-full border border-border bg-surface text-[13px] leading-none text-ink transition-colors hover:bg-surface-soft"
              >
                {showAllSuggestions ? "Show fewer" : "View all suggestions"}
              </button>
            </section>
          )}

          <section className={panelClass}>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-[14px] font-semibold leading-none text-ink">
                Import more
              </h2>
              <p className="text-[12px] leading-[1.4] text-text-secondary">
                Add more references to your unsorted collection.
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              {[
                ["Paste links", iconLink],
                ["Upload files", iconPlus],
                ["From browser extension", iconExtension],
              ].map(([label, icon]) => (
                <button
                  key={label}
                  type="button"
                  className="flex h-[42px] items-center gap-3 rounded-[12px] border border-border bg-surface px-4 text-[13px] leading-none text-ink transition-colors hover:bg-surface-soft"
                >
                  <img src={icon} alt="" className="size-[16px]" />
                  {label}
                </button>
              ))}
            </div>
          </section>

          {all.length === 0 && (
            <section className="flex items-start gap-3 rounded-[20px] bg-[#eaf6ee] p-5">
              <span className="mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-full bg-[#1fb15a] text-[13px] leading-none text-white">
                ✓
              </span>
              <div className="flex flex-col gap-1.5">
                <p className="text-[13px] leading-none text-ink">
                  Nothing waiting. You&apos;re all caught up.
                </p>
                <p className="text-[12px] leading-[1.4] text-text-secondary">
                  Newly captured items will appear here.
                </p>
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );

  return board ? (
    <BoardShell board={board}>{content}</BoardShell>
  ) : (
    <AppShell>{content}</AppShell>
  );
}
