import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { Checkbox, SearchField } from "../components/ui";
import { Menu, MenuOption } from "../components/ui/Menu";
import { boards } from "../data/boards";
import {
  TRASH_RETENTION_DAYS,
  trashActions,
  useTrashItems,
  type TrashItem,
  type TrashKind,
} from "../data/trash";
import menuIcon from "../assets/icons/reference-card-menu.svg";

type SortKey = "recent" | "oldest" | "az" | "za";

const sortOptions: { id: SortKey; label: string }[] = [
  { id: "recent", label: "Most recent" },
  { id: "oldest", label: "Oldest first" },
  { id: "az", label: "A–Z" },
  { id: "za", label: "Z–A" },
];

const copy: Record<
  TrashKind,
  {
    tab: string;
    title: string;
    description: string;
    search: string;
    verb: string;
  }
> = {
  trash: {
    tab: "Trash",
    title: "Trash",
    description: `Items you've deleted will stay here for ${TRASH_RETENTION_DAYS} days before being permanently removed.`,
    search: "Search in trash…",
    verb: "Deleted",
  },
  archive: {
    tab: "Archive",
    title: "Archive",
    description:
      "Archived items are kept safe and out of your way until you need them again.",
    search: "Search in archive…",
    verb: "Archived",
  },
};

const ago = (days: number) =>
  days === 0 ? "today" : days === 1 ? "1 day ago" : `${days} days ago`;

const outlineButton =
  "flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-5 text-[13px] leading-none text-ink transition-colors hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface";

function ItemCard({
  item,
  selected,
  onSelect,
}: {
  item: TrashItem;
  selected: boolean;
  onSelect: () => void;
}) {
  const left = TRASH_RETENTION_DAYS - item.daysAgo;
  return (
    <div
      className={`overflow-hidden rounded-[16px] bg-surface shadow-card ${selected ? "ring-2 ring-accent" : ""}`}
    >
      <div
        className="relative h-[150px] w-full bg-placeholder bg-cover bg-center"
        style={{ backgroundImage: `url(${item.imageUrl})` }}
      >
        <Checkbox
          aria-label={`Select ${item.title}`}
          checked={selected}
          onChange={onSelect}
          className="absolute left-2.5 top-2.5 size-[18px] shadow-sm"
        />
      </div>
      <div className="flex flex-col gap-2 px-3.5 pb-3 pt-3">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[14px] font-semibold leading-none text-ink">
            {item.title}
          </p>
          <button type="button" aria-label="More options" className="p-1">
            <img src={menuIcon} alt="" className="h-[4px] w-[16px]" />
          </button>
        </div>
        <p className="truncate text-[12px] leading-none text-text-secondary">
          {item.domain}
        </p>
        {item.kind === "trash" ? (
          <p className="text-[12px] font-semibold leading-none text-accent">
            {left} {left === 1 ? "day" : "days"} left
          </p>
        ) : (
          <p className="text-[12px] leading-none text-text-secondary">
            {copy[item.kind].verb} {ago(item.daysAgo)}
          </p>
        )}
      </div>
    </div>
  );
}

/** One page per section: `/archive` shows Archive, `/trash` shows Trash. */
export function TrashArchive({ kind }: { kind: TrashKind }) {
  const navigate = useNavigate();
  const all = useTrashItems();
  const tab = kind;
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState(false);
  const [notice, setNotice] = useState<{ text: string; board?: string } | null>(
    null,
  );
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((t) => window.clearTimeout(t));
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = all.filter(
      (i) =>
        i.kind === tab &&
        (!q ||
          i.title.toLowerCase().includes(q) ||
          i.domain.toLowerCase().includes(q)),
    );
    if (sort === "oldest")
      return [...list].sort((a, b) => b.daysAgo - a.daysAgo);
    if (sort === "az")
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "za")
      return [...list].sort((a, b) => b.title.localeCompare(a.title));
    return [...list].sort((a, b) => a.daysAgo - b.daysAgo);
  }, [all, tab, query, sort]);

  const selectedIds = visible
    .filter((i) => selected.has(i.id))
    .map((i) => i.id);
  const n = selectedIds.length;
  const allSelected = visible.length > 0 && n === visible.length;
  const noun = (c: number) => `${c} ${c === 1 ? "item" : "items"}`;

  const tell = (text: string, board?: string) => {
    setNotice({ text, board });
    later(() => setNotice(null), 3500);
  };

  const toggle = (id: string) => {
    setConfirming(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  };

  const restore = () => {
    const picked = visible.filter((i) => selected.has(i.id));
    const boardIds = [...new Set(picked.map((i) => i.boardId))];
    trashActions.restore(selectedIds);
    setSelected(new Set());
    const where =
      boardIds.length === 1
        ? (boards.find((b) => b.id === boardIds[0])?.title ?? "its board")
        : "their boards";
    tell(
      `Restored ${noun(n)} to ${where}.`,
      boardIds.length === 1 ? boardIds[0] : undefined,
    );
  };

  const deleteForever = () => {
    if (!confirming) {
      setConfirming(true);
      later(() => setConfirming(false), 4000);
      return;
    }
    trashActions.deleteForever(selectedIds);
    setSelected(new Set());
    setConfirming(false);
    tell(`Permanently deleted ${noun(n)}.`);
  };

  const moveToTrash = () => {
    trashActions.moveToTrash(selectedIds);
    setSelected(new Set());
    tell(`Moved ${noun(n)} to Trash.`);
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pl-11 pr-11 pb-16 pt-[52px] xl:pr-[134px]">
        {/* 5px + the 3px the title sits inside its 40px control row = the 8px title / subheading gap used on every page. */}
        <div className="flex flex-col gap-[5px]">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <div className="flex items-center gap-3">
              <h1 className="text-[27px] font-semibold leading-tight text-ink">
                {copy[kind].title}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <SearchField
                containerClassName="w-[260px]"
                placeholder={copy[kind].search}
                iconTone="neutral"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
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
            </div>
          </div>
          <p className="text-[16px] leading-snug text-text-secondary">
            {copy[kind].description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 pr-1 text-[13px] leading-none text-ink">
            <Checkbox
              aria-label="Select all items"
              checked={allSelected}
              indeterminate={n > 0 && !allSelected}
              disabled={visible.length === 0}
              onChange={() => {
                setConfirming(false);
                setSelected(
                  allSelected ? new Set() : new Set(visible.map((i) => i.id)),
                );
              }}
            />
            {n} Selected
          </label>
          <button
            type="button"
            disabled={n === 0}
            onClick={restore}
            className={outlineButton}
          >
            Restore
          </button>
          {tab === "trash" ? (
            <button
              type="button"
              disabled={n === 0}
              onClick={deleteForever}
              className={`flex h-9 items-center rounded-full px-5 text-[13px] font-medium leading-none text-white transition-colors disabled:cursor-not-allowed disabled:bg-[#e8e8e8] disabled:text-[#b3b3b3] ${
                confirming
                  ? "bg-accent hover:bg-accent-hover"
                  : "bg-ink hover:bg-[#333333]"
              }`}
            >
              {confirming
                ? `Confirm and delete ${noun(n)}`
                : "Delete permanently"}
            </button>
          ) : (
            <button
              type="button"
              disabled={n === 0}
              onClick={moveToTrash}
              className={outlineButton}
            >
              Move to Trash
            </button>
          )}

          <p
            aria-live="polite"
            className="flex items-center gap-2 text-[13px] leading-none text-text-secondary empty:hidden"
          >
            {notice?.text}
            {notice?.board && (
              <button
                type="button"
                onClick={() => navigate(`/boards/${notice.board}`)}
                className="text-ink underline hover:text-accent"
              >
                View board
              </button>
            )}
          </p>
        </div>

        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-border bg-surface/60 py-24 text-center">
            <p className="text-[16px] font-medium text-ink">
              {query
                ? `Nothing in ${copy[tab].tab.toLowerCase()} matches "${query}"`
                : `${copy[tab].tab} is empty`}
            </p>
            <p className="max-w-sm text-[14px] text-text-secondary">
              {query
                ? "Try a different search term."
                : tab === "trash"
                  ? "Deleted references will show up here for 30 days."
                  : "Archived references will show up here."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 [@media(min-width:1280px)]:grid-cols-4">
            {visible.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                selected={selected.has(item.id)}
                onSelect={() => toggle(item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
