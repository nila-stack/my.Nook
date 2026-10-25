import { useEffect, useRef, useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { Chip, SearchField } from "../components/ui";
import boardPortfolioRef from "../assets/images/board-portfolio-ref.png";
import boardFreelance from "../assets/images/board-freelance.png";
import boardAssignment from "../assets/images/board-assignment.png";
import av1 from "../assets/images/handoff-av-1.jpg";
import av2 from "../assets/images/handoff-av-2.jpg";
import av3 from "../assets/images/handoff-av-3.jpg";
import av4 from "../assets/images/handoff-av-4.jpg";
import illus1 from "../assets/images/handoff-illus-1.jpg";
import illus2 from "../assets/images/handoff-illus-2.jpg";
import illus3 from "../assets/images/handoff-illus-3.jpg";
import illus4 from "../assets/images/handoff-illus-4.jpg";
import chevronDown from "../assets/icons/chevron-down.svg";

type Handoff = {
  id: string;
  name: string;
  references: number;
  boards: number;
  sentAt: string;
  sentLabel: string;
  sentBy: string;
  status: "Processing" | "Completed";
  thumbs: [string, string, string, string];
  more: number;
};

const handoffs: Handoff[] = [
  {
    id: "portfolio-reference",
    name: "Portfolio Reference",
    references: 50,
    boards: 2,
    sentAt: "2026-10-12T16:32",
    sentLabel: "12 Oct 2026, 4:32 PM",
    sentBy: "Me",
    status: "Processing",
    thumbs: [
      boardPortfolioRef,
      boardFreelance,
      boardAssignment,
      boardPortfolioRef,
    ],
    more: 1,
  },
  {
    id: "av-project",
    name: "AV Project",
    references: 18,
    boards: 1,
    sentAt: "2026-10-08T11:20",
    sentLabel: "8 Oct 2026, 11:20 AM",
    sentBy: "Me",
    status: "Completed",
    thumbs: [av1, av2, av3, av4],
    more: 1,
  },
  {
    id: "illustration-styles",
    name: "Illustration Styles",
    references: 12,
    boards: 1,
    sentAt: "2026-10-05T18:15",
    sentLabel: "5 Oct 2026, 6:15 PM",
    sentBy: "Me",
    status: "Completed",
    thumbs: [illus1, illus2, illus3, illus4],
    more: 1,
  },
];

const dateOptions = ["Newest first", "Oldest first"] as const;
const senderOptions = ["Anyone", "Me"] as const;

function FilterPill({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-[35px] items-center gap-2.5 rounded-full border border-border bg-surface px-[22.5px] text-[14px] leading-none text-ink transition-colors hover:bg-surface-soft"
      >
        {label}
        <img
          src={chevronDown}
          alt=""
          className={`w-[9px] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-[196px] rounded-[8px] border border-border bg-surface py-[6px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.1)]">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={value === option}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`flex h-[36px] w-full items-center px-[14px] text-left text-[14px] leading-none ${
                value === option ? "text-ink" : "text-text-secondary"
              } hover:text-accent`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Thumbs({ thumbs, more }: { thumbs: Handoff["thumbs"]; more: number }) {
  return (
    <div className="grid size-[111px] shrink-0 grid-cols-2 gap-1">
      {thumbs.slice(0, 3).map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          className="size-[53.5px] rounded-[6px] object-cover"
        />
      ))}
      <div className="relative size-[53.5px] overflow-hidden rounded-[6px]">
        <img
          src={thumbs[3]}
          alt=""
          className="size-full object-cover blur-[3px]"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-white/55 text-[10px] font-medium leading-[1.15] text-ink">
          +{more}
          <br />
          More
        </span>
      </div>
    </div>
  );
}

export function HandoffHistory() {
  const [dateOrder, setDateOrder] = useState<string>(dateOptions[0]);
  const [sender, setSender] = useState<string>(senderOptions[0]);
  const [query, setQuery] = useState("");

  const rows = handoffs
    .filter((h) => (sender === "Anyone" ? true : h.sentBy === sender))
    .filter((h) => h.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) =>
      dateOrder === "Oldest first"
        ? a.sentAt.localeCompare(b.sentAt)
        : b.sentAt.localeCompare(a.sentAt),
    );

  const isFiltered =
    dateOrder !== dateOptions[0] || sender !== senderOptions[0] || query !== "";

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pl-11 pr-11 pb-16 pt-[52px] xl:pr-[134px]">
        <div className="flex flex-col gap-2">
          <h1 className="text-[27px] font-semibold leading-tight text-ink">
            Hand-off History
          </h1>
          <p className="text-[16px] leading-snug text-text-secondary">
            View and manage all the references you've sent to AI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-[13px]">
          <Chip
            tone="tint"
            selected={!isFiltered}
            onClick={() => {
              setDateOrder(dateOptions[0]);
              setSender(senderOptions[0]);
              setQuery("");
            }}
            className="h-[35px] px-[22.5px] text-[14px] leading-none"
          >
            All
          </Chip>
          <FilterPill
            label="Date"
            options={dateOptions}
            value={dateOrder}
            onChange={setDateOrder}
          />
          <FilterPill
            label="Sent by"
            options={senderOptions}
            value={sender}
            onChange={setSender}
          />
          <SearchField
            containerClassName="ml-auto mr-[5px] w-[318px] max-w-full"
            placeholder="Search Hand-offs"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            iconTone="neutral"
          />
        </div>

        <ul className="flex mr-[5px] max-w-none flex-col gap-4">
          {rows.length === 0 && (
            <li className="rounded-[20px] border border-dashed border-border py-16 text-center text-[14px] text-text-secondary">
              No handoffs match your filters.
            </li>
          )}
          {rows.map((h) => (
            <li key={h.id}>
              <button
                type="button"
                className={`flex w-full items-center gap-6 rounded-[20px] border px-[18px] py-[11px] text-left transition-colors ${
                  h.status === "Processing"
                    ? "border-[#ffb594] bg-[#ffe9df]/80"
                    : "border-[#e6e6e6] bg-surface hover:border-[#ffd5c4]"
                }`}
              >
                <Thumbs thumbs={h.thumbs} more={h.more} />
                <div className="flex flex-1 flex-col gap-1.5">
                  <h2 className="text-[18px] font-semibold leading-none text-ink">
                    {h.name}
                  </h2>
                  <p className="text-[13px] leading-snug text-text-secondary">
                    {h.references} references · From {h.boards}{" "}
                    {h.boards === 1 ? "board" : "boards"}
                  </p>
                  <p className="text-[13px] leading-snug text-text-secondary">
                    Sent {h.sentLabel} · by {h.sentBy.toLowerCase()}
                  </p>
                </div>
                <span className="flex items-center gap-3 text-[14px] leading-none text-text-secondary">
                  <span
                    className={`size-[11px] rounded-full ${h.status === "Processing" ? "bg-[#ff8a3d]" : "bg-[#1fb15a]"}`}
                  />
                  {h.status}
                </span>
                <img
                  src={chevronDown}
                  alt=""
                  className="mr-3 w-[14px] -rotate-90"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
