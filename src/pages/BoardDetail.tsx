import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useParams } from "react-router-dom";
import { BoardShell } from "../components/layout/BoardShell";
import {
  Breadcrumb,
  Button,
  Checkbox,
  Chip,
  ReferenceCard,
  SearchField,
} from "../components/ui";
import { BackLink } from "../components/ui/BackLink";
import { useBoards, useMovedReferences } from "../data/unsorted";
import { referencesByBoard } from "../data/references";
import { essentialActions, useEssentialIds } from "../data/essentials";
import { commentActions, useBoardComments } from "../data/comments";
import { ToolbarDropdown } from "../components/ui/ToolbarDropdown";
import { AddReferenceDialog } from "../components/layout/AddReferenceDialog";
import { SortMenu, type SortKey } from "../components/ui/SortMenu";
import {
  attributesFor,
  tagsFor,
  filterGroups,
  type FilterGroupId,
} from "../lib/refAttributes";
import chevronDown from "../assets/icons/chevron-down.svg";
import filterIcon from "../assets/icons/filter.svg";
import plusWhite from "../assets/icons/plus-white.svg";
import { useBoardOrigin } from "../data/boardOrigin";

/** Keyed by board so selection / essential / removed state never leaks from one board to the next. */
export function BoardDetail() {
  const { boardId } = useParams();
  return <BoardDetailView key={boardId} boardId={boardId} />;
}

function BoardDetailView({ boardId }: { boardId?: string }) {
  const origin = useBoardOrigin();
  const boards = useBoards();
  const board = boards.find((b) => b.id === boardId) ?? boards[0];
  const movedIn = useMovedReferences(board.id);
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const boardComments = useBoardComments(board.id);
  // The board's own references plus anything filed into it from Unsorted.
  // Newly added / filed-in references come first, then the board's own.
  const references = [
    ...movedIn,
    ...(referencesByBoard[board.id] ?? []),
  ].filter((r) => !removed.has(r.id));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  // Essential marks live in a shared store so the hand-off pages send exactly what is starred here.
  const essential = useEssentialIds(board.id, [
    ...movedIn,
    ...(referencesByBoard[board.id] ?? []),
  ]);
  const setEssential: Dispatch<SetStateAction<Set<string>>> = (next) =>
    essentialActions.set(
      board.id,
      typeof next === "function" ? next(essential) : next,
    );

  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState<number | null>(null);
  const addedTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(addedTimer.current), []);
  const onAdded = (n: number) => {
    setAdded(n);
    window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setAdded(null), 3500);
  };
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<FilterGroupId | null>(null);
  const [filters, setFilters] = useState<Record<FilterGroupId, string[]>>({
    category: [],
    style: [],
    colour: [],
    source: [],
  });

  // Every reference with its filter attributes, and the options each group offers (only values that exist here).
  const withAttrs = references.map((ref) => ({
    ref,
    attrs: attributesFor(board, ref),
    tags: tagsFor(board, ref),
  }));
  // Tag chips: the board's mood tags first, then any tags added with references.
  const allTags = [
    ...new Set([
      ...(board.brief?.mood ?? []),
      ...withAttrs.flatMap((x) => x.tags),
    ]),
  ];
  const toggleTag = (tag: string) =>
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  const options = Object.fromEntries(
    filterGroups.map((g) => [
      g.id,
      [...new Set(withAttrs.map((x) => x.attrs[g.id]))].sort(),
    ]),
  ) as Record<FilterGroupId, string[]>;
  const activeCount = Object.values(filters).reduce(
    (n, list) => n + list.length,
    0,
  );
  // Within a group the choices are alternatives (OR); across groups they all have to match (AND).
  const shown = withAttrs
    // Tag chips: a reference stays if it has any of the selected tags.
    .filter(
      ({ tags }) =>
        activeTags.length === 0 || tags.some((t) => activeTags.includes(t)),
    )
    .filter(({ attrs }) =>
      filterGroups.every(
        (g) =>
          filters[g.id].length === 0 || filters[g.id].includes(attrs[g.id]),
      ),
    )
    // Sort → Essential shows only the references marked essential.
    .filter(({ ref }) => sortBy !== "essential" || essential.has(ref.id))
    .map((x) => x.ref);
  // "Newest first" keeps the board's own order (latest added first); the others reorder a copy.
  if (sortBy === "oldest") shown.reverse();
  if (sortBy === "az") shown.sort((a, b) => a.domain.localeCompare(b.domain));
  if (sortBy === "za") shown.sort((a, b) => b.domain.localeCompare(a.domain));
  const toggleFilter = (group: FilterGroupId, value: string) =>
    setFilters((prev) => ({
      ...prev,
      [group]: prev[group].includes(value)
        ? prev[group].filter((v) => v !== value)
        : [...prev[group], value],
    }));

  const selectedCount = selected.size;
  const allSelected =
    shown.length > 0 && shown.every((r) => selected.has(r.id));

  const toggleIn = (setter: typeof setSelected, id: string) =>
    setter((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  const markSelectedEssential = () => {
    // If every selected reference is already essential, this un-marks them instead.
    const everyEssential = [...selected].every((id) => essential.has(id));
    setEssential((prev) => {
      const next = new Set(prev);
      selected.forEach((id) =>
        everyEssential ? next.delete(id) : next.add(id),
      );
      return next;
    });
  };

  const deleteSelected = () => {
    setRemoved((prev) => new Set([...prev, ...selected]));
    setSelected(new Set());
  };

  return (
    <BoardShell board={board}>
      <div className="flex flex-col gap-6 pl-10 pr-10 pb-16 pt-[27px] xl:pr-[134px]">
        <Breadcrumb
          items={[
            { label: origin.label, to: origin.to },
            { label: board.title },
          ]}
        />

        <div className="flex items-center gap-4">
          <div className="relative">
            <BackLink to={origin.to} label={`Back to ${origin.label}`} />
            <h1 className="text-[27px] font-semibold leading-tight text-ink">
              {board.title}
            </h1>
          </div>
          <p
            aria-live="polite"
            className="text-[13px] leading-none text-text-secondary empty:hidden"
          >
            {added !== null &&
              `Added ${added} ${added === 1 ? "reference" : "references"} to ${board.title}.`}
          </p>
        </div>

        {/* Fills the page's content width, so Delete and the last column of references line up with Add reference. */}
        <div className="flex w-full flex-col gap-6">
          <div className="flex flex-wrap items-center gap-[15px] lg:flex-nowrap">
            <SearchField
              containerClassName="min-w-[200px] flex-1"
              placeholder="Search across boards and references"
              iconTone="neutral"
            />
            <ToolbarDropdown
              icon={filterIcon}
              iconClass="size-[13px]"
              panelClassName="w-[236px]"
              label={
                <>
                  Filter
                  {activeCount > 0 && (
                    <span className="ml-0.5 flex size-[18px] items-center justify-center rounded-full bg-accent text-[11px] font-medium leading-none text-white">
                      {activeCount}
                    </span>
                  )}
                </>
              }
            >
              {() => (
                <div className="max-h-[380px] overflow-y-auto">
                  {filterGroups.map((g, i) => {
                    const open = expanded === g.id;
                    const picked = filters[g.id].length;
                    return (
                      <div key={g.id}>
                        {i > 0 && (
                          <hr className="mx-[14.5px] border-border/70" />
                        )}
                        <button
                          type="button"
                          aria-expanded={open}
                          onClick={() => setExpanded(open ? null : g.id)}
                          className="flex h-[40px] w-full items-center justify-between px-[14px] text-left text-[14px] leading-none text-ink"
                        >
                          <span className="flex items-center gap-2">
                            {g.label}
                            {picked > 0 && (
                              <span className="flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-accent-tint px-1 text-[11px] font-medium leading-none text-ink">
                                {picked}
                              </span>
                            )}
                          </span>
                          <img
                            src={chevronDown}
                            alt=""
                            className={`mr-1 w-[8.5px] transition-transform ${open ? "rotate-180" : ""}`}
                          />
                        </button>
                        {open && (
                          <ul className="px-[8px] pb-2">
                            {options[g.id].map((value) => (
                              <li key={value}>
                                <label className="flex cursor-pointer items-center gap-2.5 rounded-[8px] px-[6px] py-[6px] text-[13px] leading-none text-text-secondary hover:bg-surface-soft hover:text-ink">
                                  <Checkbox
                                    checked={filters[g.id].includes(value)}
                                    onChange={() => toggleFilter(g.id, value)}
                                    className="size-[16px]"
                                  />
                                  {value}
                                </label>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                  {activeCount > 0 && (
                    <>
                      <hr className="mx-[14.5px] border-border/70" />
                      <button
                        type="button"
                        onClick={() =>
                          setFilters({
                            category: [],
                            style: [],
                            colour: [],
                            source: [],
                          })
                        }
                        className="flex h-[40px] w-full items-center px-[14px] text-left text-[13px] leading-none text-accent hover:underline"
                      >
                        Clear all filters
                      </button>
                    </>
                  )}
                </div>
              )}
            </ToolbarDropdown>
            <SortMenu value={sortBy} onChange={setSortBy} withEssential />
            <Button
              variant="primary"
              onClick={() => setAdding(true)}
              className="h-[43px] w-[168px] gap-1.5 !text-[15px] leading-none"
            >
              <img src={plusWhite} alt="" className="size-[13px]" />
              Add reference
            </Button>
          </div>

          <div className="flex w-0 min-w-full flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-[15px]">
              {allTags.map((tag) => (
                <Chip
                  key={tag}
                  tone="tint"
                  selected={activeTags.includes(tag)}
                  aria-pressed={activeTags.includes(tag)}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Chip>
              ))}
              <button
                type="button"
                className="rounded-full border border-border px-3 py-1.5 text-[13px] text-text-secondary hover:bg-surface-soft"
              >
                + Add Tag
              </button>
            </div>

            <div className="flex items-center gap-[15px]">
              <label
                className={`flex items-center gap-1.5 text-[13px] text-text-secondary ${
                  references.length === 0 ? "" : "cursor-pointer"
                }`}
              >
                <Checkbox
                  aria-label="Select all references"
                  checked={allSelected}
                  indeterminate={selectedCount > 0 && !allSelected}
                  disabled={shown.length === 0}
                  onChange={() =>
                    setSelected(
                      allSelected ? new Set() : new Set(shown.map((r) => r.id)),
                    )
                  }
                />
                {selectedCount} Selected
              </label>
              <button
                type="button"
                disabled={selectedCount === 0}
                onClick={markSelectedEssential}
                className="rounded-full border border-accent px-3 py-1.5 text-[13px] text-ink transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="text-accent">★</span> Mark Essential
              </button>
              <button
                type="button"
                disabled={selectedCount === 0}
                onClick={deleteSelected}
                className="rounded-full border border-white bg-ink px-3 py-1.5 text-[13px] text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              >
                Delete
              </button>
            </div>
          </div>
          {shown.length === 0 ? (
            <div className="flex w-0 min-w-full flex-col items-center gap-2 rounded-card border border-dashed border-border bg-surface/60 py-20 text-center">
              <p className="text-[16px] font-medium text-ink">
                {references.length === 0
                  ? "No references yet"
                  : sortBy === "essential"
                    ? "No essential references"
                    : "No references match these filters"}
              </p>
              <p className="max-w-xs text-[14px] text-text-secondary">
                {references.length === 0
                  ? "Import links or drop in files to start collecting references for this board."
                  : sortBy === "essential"
                    ? "Tap the star on a reference, or select some and use Mark Essential."
                    : "Try removing a filter to see more references."}
              </p>
            </div>
          ) : (
            <div className="grid w-0 min-w-full grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
              {shown.map((reference) => (
                <ReferenceCard
                  key={reference.id}
                  reference={reference}
                  essential={essential.has(reference.id)}
                  selected={selected.has(reference.id)}
                  selecting={selectedCount > 0}
                  onToggleEssential={() => toggleIn(setEssential, reference.id)}
                  onToggleSelect={() => toggleIn(setSelected, reference.id)}
                  commentCount={
                    boardComments.filter((c) => c.refId === reference.id).length
                  }
                  onComment={() => commentActions.open(reference.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      {adding && (
        <AddReferenceDialog
          board={board}
          suggestedTags={allTags}
          onClose={() => setAdding(false)}
          onAdded={onAdded}
        />
      )}
    </BoardShell>
  );
}
