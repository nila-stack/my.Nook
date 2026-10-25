import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { BoardCard, Button } from "../components/ui";
import { HANDOFF_REFERENCE_LIMIT } from "../data/boards";
import { useBoards } from "../data/unsorted";
import checkmark from "../assets/icons/checkmark.svg";

export function SendToAi() {
  const navigate = useNavigate();
  // Only projects can be picked here; it is opened from the Projects page.
  const boards = useBoards().filter((b) => b.project);
  const [params] = useSearchParams();
  // Coming back from the handoff page restores the previous selection (still capped at the limit).
  const [selected, setSelected] = useState<string[]>(() => {
    let sum = 0;
    return boards
      .filter((b) => (params.get("boards") ?? "").split(",").includes(b.id))
      .filter((b) => (sum += b.itemCount) <= HANDOFF_REFERENCE_LIMIT)
      .map((b) => b.id);
  });

  const total = boards
    .filter((b) => selected.includes(b.id))
    .reduce((sum, b) => sum + b.itemCount, 0);
  const remaining = HANDOFF_REFERENCE_LIMIT - total;

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <AppShell>
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1 flex-col gap-6 pl-11 pr-11 pb-16 pt-[52px] xl:pr-[134px]">
          <div className="flex flex-col gap-2">
            <h1 className="text-[27px] font-semibold leading-tight text-ink">
              Send to AI
            </h1>
            <p className="text-[16px] leading-snug text-text-secondary">
              Choose the projects you want to send. A single hand-off can
              include up to {HANDOFF_REFERENCE_LIMIT} references.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex w-[260px] flex-col gap-2">
              <p className="text-[14px] leading-none text-ink">
                <span className="font-semibold">{total}</span> of{" "}
                {HANDOFF_REFERENCE_LIMIT} references selected
              </p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-soft">
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-200"
                  style={{
                    width: `${(total / HANDOFF_REFERENCE_LIMIT) * 100}%`,
                  }}
                />
              </div>
            </div>
            <p className="flex-1 text-[14px] leading-none text-text-secondary">
              {selected.length === 0
                ? "Select at least one board to continue."
                : `${selected.length} ${selected.length === 1 ? "board" : "boards"} selected`}
            </p>
            <Button
              variant="primary"
              disabled={selected.length === 0}
              onClick={() =>
                navigate(`/send-to-ai/handoff?boards=${selected.join(",")}`)
              }
              className="h-[43px] px-7 !text-[15px] leading-none"
            >
              Send selected boards to AI
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-x-[35px] gap-y-[35px] sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => {
              const isSelected = selected.includes(board.id);
              const empty = board.itemCount === 0;
              const blocked =
                !isSelected && (empty || board.itemCount > remaining);
              return (
                <div key={board.id} className="relative">
                  <BoardCard
                    title={board.title}
                    meta={`${board.itemCount} references · ${board.updatedLabel}`}
                    imageUrl={board.imageUrl}
                    selected={isSelected}
                    disabled={blocked}
                    aria-pressed={isSelected}
                    onClick={() => toggle(board.id)}
                    className="disabled:opacity-50 disabled:hover:translate-y-0"
                  />
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute left-3.5 top-3.5 flex size-[22px] items-center justify-center rounded-[6px] border ${
                      isSelected
                        ? "border-accent bg-accent"
                        : "border-border bg-surface"
                    }`}
                  >
                    {isSelected && (
                      <img src={checkmark} alt="" className="w-[11px]" />
                    )}
                  </span>
                  {blocked && (
                    <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-surface px-3 py-1 text-[12px] leading-none text-text-secondary shadow-card">
                      {empty
                        ? "Empty board"
                        : board.itemCount > HANDOFF_REFERENCE_LIMIT
                          ? `Over ${HANDOFF_REFERENCE_LIMIT} references`
                          : "Limit reached"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
