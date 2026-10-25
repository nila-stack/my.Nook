import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import {
  BoardCard,
  Button,
  Checkbox,
  Chip,
  SearchField,
  Skeleton,
} from "../components/ui";
import {
  boardCategories,
  type Board,
  type BoardCategory,
} from "../data/boards";
import { useBoards } from "../data/unsorted";
import { ToolbarDropdown } from "../components/ui/ToolbarDropdown";
import { openCreateDialog } from "../data/createdBoards";
import { SortMenu, type SortKey } from "../components/ui/SortMenu";
import filterIcon from "../assets/icons/filter.svg";
import heartIcon from "../assets/icons/heart-orange.svg";
import heartOutlineIcon from "../assets/icons/heart-outline-white.svg";
import { favouriteActions } from "../data/favourites";
import { boardOriginActions } from "../data/boardOrigin";
import chevronDown from "../assets/icons/chevron-down.svg";

const views = {
  all: { title: "Boards", filter: () => true },
  favourites: {
    title: "Favourites",
    filter: (board: Board) => Boolean(board.favourite),
  },
  projects: {
    title: "Projects",
    filter: (board: Board) => Boolean(board.project),
  },
};

export function Home({ view = "all" }: { view?: keyof typeof views }) {
  const navigate = useNavigate();
  // null = "All": every board in the view. Clicking the active category chip returns to All.
  const [activeCategory, setActiveCategory] = useState<BoardCategory | null>(
    null,
  );
  const [query, setQuery] = useState("");
  const [loading] = useState(false);

  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [filters, setFilters] = useState<Filters>(noFilters);

  const boards = useBoards();
  const viewBoards = boards
    .filter(views[view].filter)
    .filter(
      (board) => !activeCategory || board.categories.includes(activeCategory),
    )
    // Within a group the ticked options are alternatives (OR); across groups they all have to match (AND).
    .filter((board) => {
      const attrs = boardAttributes(board);
      return filterGroups.every(
        (g) =>
          filters[g.id].length === 0 ||
          filters[g.id].some((v) => attrs[g.id].includes(v)),
      );
    });
  const visibleBoards = sortBoards(viewBoards, sortBy).filter((board) =>
    board.title.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <AppShell>
      <div className="flex flex-col gap-4 pl-11 pr-11 pb-16 pt-[52px] xl:pr-[134px]">
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline gap-2">
            <h1 className="text-[27px] font-semibold leading-tight text-ink">
              {views[view].title}
            </h1>
            <p className="text-[14px] leading-tight text-ink">
              {`${viewBoards.length} ${viewBoards.length === 1 ? "board" : "boards"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip
              tone="tint"
              selected={activeCategory === null}
              aria-pressed={activeCategory === null}
              onClick={() => setActiveCategory(null)}
              className="leading-none"
            >
              All
            </Chip>
            {boardCategories.map((category) => (
              <Chip
                key={category}
                tone="tint"
                selected={activeCategory === category}
                aria-pressed={activeCategory === category}
                onClick={() =>
                  setActiveCategory(
                    activeCategory === category ? null : category,
                  )
                }
                className="leading-none"
              >
                {category}
              </Chip>
            ))}
          </div>
        </div>

        {/* Fills the page's content width (the page keeps a 134px gutter on the right on wide screens), so the grid ends
            exactly under the "Create a new board" button. */}
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-wrap items-center gap-[15px] lg:flex-nowrap">
            <SearchField
              containerClassName="min-w-[200px] flex-1"
              placeholder="Search across boards and references"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              iconTone="neutral"
            />
            <FilterMenu filters={filters} onChange={setFilters} />
            <SortMenu value={sortBy} onChange={setSortBy} />
            <Button
              variant="primary"
              onClick={() => openCreateDialog("board")}
              className="h-[43px] px-6 !text-[15px] leading-none"
            >
              Create a new board
            </Button>
          </div>

          {loading ? (
            <div className="w-0 min-w-full">
              <BoardGridSkeleton />
            </div>
          ) : visibleBoards.length === 0 ? (
            <div className="w-0 min-w-full">
              <EmptyBoards
                query={query}
                category={activeCategory}
                filtered={filterCount(filters) > 0}
              />
            </div>
          ) : (
            <div className="mt-6 grid w-0 min-w-full grid-cols-1 gap-x-[35px] gap-y-[35px] sm:grid-cols-2 lg:grid-cols-3">
              {visibleBoards.map((board) => (
                <div key={board.id} className="relative">
                  <BoardCard
                    title={board.title}
                    meta={`${board.itemCount} items · ${board.updatedLabel}`}
                    imageUrl={board.imageUrl}
                    onClick={() => {
                      boardOriginActions.set(
                        view === "projects"
                          ? { label: "Projects", to: "/projects" }
                          : view === "favourites"
                            ? { label: "Favourites", to: "/favourites" }
                            : { label: "Boards", to: "/home" },
                      );
                      navigate(`/boards/${board.id}`);
                    }}
                  />
                  <button
                    type="button"
                    aria-pressed={Boolean(board.favourite)}
                    aria-label={
                      board.favourite
                        ? `Remove ${board.title} from favourites`
                        : `Add ${board.title} to favourites`
                    }
                    onClick={() =>
                      favouriteActions.set(board.id, !board.favourite)
                    }
                    className="absolute right-[9px] top-[6px] flex size-7 items-center justify-center rounded-full transition-transform hover:scale-110"
                  >
                    <img
                      src={board.favourite ? heartIcon : heartOutlineIcon}
                      alt=""
                      className="h-4 w-[18px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

const filterGroups = [
  {
    id: "projectType",
    label: "Project type",
    options: ["Freelance", "College Project", "References"],
  },
  {
    id: "discipline",
    label: "Discipline",
    options: [
      "UX / Interaction Design",
      "Visual Design",
      "Product Design",
      "Research",
      "Branding",
    ],
  },
  { id: "year", label: "Year", options: ["2026", "2025", "2024", "Older"] },
  {
    id: "theme",
    label: "Theme",
    options: [
      "Accessibility",
      "Design Trends",
      "Culture",
      "Sustainability",
      "Technology",
      "AI",
    ],
  },
] as const;

type GroupId = (typeof filterGroups)[number]["id"];
type Filters = Record<GroupId, string[]>;
const noFilters: Filters = {
  projectType: [],
  discipline: [],
  year: [],
  theme: [],
};
const filterCount = (f: Filters) =>
  Object.values(f).reduce((n, list) => n + list.length, 0);

/** What each board is about, so the Filter checkboxes have something to match (a board can match several options). */
const attributesById: Record<string, Record<GroupId, string[]>> = {
  typography: {
    projectType: ["References"],
    discipline: ["Visual Design", "Branding"],
    year: ["2026"],
    theme: ["Design Trends", "Culture"],
  },
  "portfolio-reference": {
    projectType: ["References"],
    discipline: ["Visual Design", "UX / Interaction Design"],
    year: ["2026"],
    theme: ["Design Trends"],
  },
  "freelance-project-1": {
    projectType: ["Freelance"],
    discipline: ["Branding", "Visual Design"],
    year: ["2025"],
    theme: ["Culture"],
  },
  "assignment-project": {
    projectType: ["College Project"],
    discipline: ["Research", "UX / Interaction Design"],
    year: ["2025"],
    theme: ["Accessibility", "Sustainability"],
  },
  illustration: {
    projectType: ["References"],
    discipline: ["Visual Design"],
    year: ["2024"],
    theme: ["Culture", "Design Trends"],
  },
  "client-fintech-app": {
    projectType: ["Freelance"],
    discipline: ["Product Design", "UX / Interaction Design"],
    year: ["2026"],
    theme: ["Technology", "AI"],
  },
  moodboards: {
    projectType: ["References"],
    discipline: ["Visual Design", "Research"],
    year: ["2025"],
    theme: ["Design Trends"],
  },
  "motion-studies": {
    projectType: ["References"],
    discipline: ["Product Design", "Visual Design"],
    year: ["2024"],
    theme: ["Technology", "Design Trends"],
  },
  branding: {
    projectType: ["Freelance", "References"],
    discipline: ["Branding"],
    year: ["Older"],
    theme: ["Culture"],
  },
};

function boardAttributes(board: Board): Record<GroupId, string[]> {
  return (
    attributesById[board.id] ?? {
      // Boards you create yourself: infer what we can from the category you gave them.
      projectType: [
        board.categories.includes("Projects") ? "Freelance" : "References",
      ],
      discipline: ["Visual Design"],
      year: ["2026"],
      theme: ["Design Trends"],
    }
  );
}

function sortBoards(list: Board[], key: SortKey) {
  const sorted = [...list];
  if (key === "oldest") sorted.reverse();
  if (key === "az") sorted.sort((a, b) => a.title.localeCompare(b.title));
  if (key === "za") sorted.sort((a, b) => b.title.localeCompare(a.title));
  return sorted;
}

function FilterMenu({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const total = filterCount(filters);

  const toggle = (group: GroupId, value: string) =>
    onChange({
      ...filters,
      [group]: filters[group].includes(value)
        ? filters[group].filter((v) => v !== value)
        : [...filters[group], value],
    });

  return (
    <ToolbarDropdown
      icon={filterIcon}
      iconClass="size-[13px]"
      panelClassName="w-[236px]"
      label={
        <>
          Filter
          {total > 0 && (
            <span className="ml-0.5 flex size-[18px] items-center justify-center rounded-full bg-accent text-[11px] font-medium leading-none text-white">
              {total}
            </span>
          )}
        </>
      }
    >
      {() => (
        <div className="max-h-[420px] overflow-y-auto">
          {filterGroups.map((group, i) => {
            const isOpen = expanded === group.id;
            const picked = filters[group.id].length;
            return (
              <div key={group.id}>
                {i > 0 && <hr className="mx-[14.5px] border-border/70" />}
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setExpanded(isOpen ? null : group.id)}
                  className="flex h-[40px] w-full items-center justify-between px-[14px] text-left text-[14px] leading-none text-ink"
                >
                  <span className="flex items-center gap-2">
                    {group.label}
                    {picked > 0 && (
                      <span className="flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-accent-tint px-1 text-[11px] font-medium leading-none text-ink">
                        {picked}
                      </span>
                    )}
                  </span>
                  <img
                    src={chevronDown}
                    alt=""
                    className={`mr-1 w-[8.5px] transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <ul className="px-[8px] pb-2">
                    {group.options.map((option) => (
                      <li key={option}>
                        <label className="flex cursor-pointer items-center gap-2.5 rounded-[8px] px-[6px] py-[6px] text-[13px] leading-none text-text-secondary hover:bg-surface-soft hover:text-ink">
                          <Checkbox
                            checked={filters[group.id].includes(option)}
                            onChange={() => toggle(group.id, option)}
                            className="size-[16px]"
                          />
                          {option}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
          {total > 0 && (
            <>
              <hr className="mx-[14.5px] border-border/70" />
              <button
                type="button"
                onClick={() => onChange(noFilters)}
                className="flex h-[40px] w-full items-center px-[14px] text-left text-[13px] leading-none text-accent hover:underline"
              >
                Clear all filters
              </button>
            </>
          )}
        </div>
      )}
    </ToolbarDropdown>
  );
}

function BoardGridSkeleton() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-x-[35px] gap-y-[35px] sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 rounded-card bg-surface pb-3 shadow-card"
        >
          <Skeleton className="h-[173px] w-full rounded-t-card rounded-b-none" />
          <div className="flex flex-col gap-1.5 px-[18px]">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyBoards({
  query,
  category,
  filtered,
}: {
  query: string;
  category: BoardCategory | null;
  filtered: boolean;
}) {
  const title = query
    ? `No boards match "${query}"`
    : filtered
      ? "No boards match these filters"
      : category
        ? `No boards in ${category} yet`
        : "No boards yet";
  const hint = query
    ? "Try a different search term, or clear the search to see all boards."
    : filtered
      ? "Untick a filter, or open Filter and choose Clear all filters."
      : category
        ? "Pick another category above, or tap the selected one again to see every board."
        : "Start a board to collect references, links and images in one place.";
  return (
    <div className="mt-6 flex flex-col items-center gap-2 rounded-card border border-dashed border-border bg-surface/60 py-20 text-center">
      <p className="text-[16px] font-medium text-ink">{title}</p>
      <p className="max-w-xs text-[14px] text-text-secondary">{hint}</p>
    </div>
  );
}
