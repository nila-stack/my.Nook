import { ToolbarDropdown } from "./ToolbarDropdown";
import sortIcon from "../../assets/icons/sort.svg";

const sortOptions = [
  { id: "newest", label: "Newest First" },
  { id: "oldest", label: "Oldest First" },
  { id: "az", label: "A–Z" },
  { id: "za", label: "Z–A" },
  /** Only offered where items can be marked essential (board pages); it filters instead of reordering. */
  { id: "essential", label: "Essential" },
] as const;

export type SortKey = (typeof sortOptions)[number]["id"];

export function SortMenu({
  value,
  onChange,
  withEssential = false,
}: {
  value: SortKey;
  onChange: (key: SortKey) => void;
  withEssential?: boolean;
}) {
  const options = sortOptions.filter((o) => withEssential || o.id !== "essential");
  return (
    <ToolbarDropdown icon={sortIcon} iconClass="size-[19px]" label="Sort">
      {(close) =>
        options.map((option, i) => (
          <div key={option.id}>
            {i > 0 && <hr className="mx-[14.5px] border-border/70" />}
            <button
              type="button"
              aria-pressed={value === option.id}
              onClick={() => {
                onChange(option.id);
                close();
              }}
              className={`flex h-[38px] w-full items-center justify-between px-[14px] text-left text-[14px] leading-none ${
                value === option.id ? "text-ink" : "text-text-secondary"
              }`}
            >
              {option.label}
            </button>
          </div>
        ))
      }
    </ToolbarDropdown>
  );
}
