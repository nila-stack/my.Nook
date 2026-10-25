import { useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { Breadcrumb, Button } from "../components/ui";
import { BackLink } from "../components/ui/BackLink";
import { boards, HANDOFF_REFERENCE_LIMIT } from "../data/boards";
import { referencesByBoard } from "../data/references";
import editIcon from "../assets/icons/edit-pencil.svg";
import checkmark from "../assets/icons/checkmark.svg";
import refThumb1 from "../assets/images/ref-thumb-1.png";
import refThumb2 from "../assets/images/ref-thumb-2.png";
import refThumb3 from "../assets/images/ref-thumb-3.png";
import refThumb4 from "../assets/images/ref-thumb-4.png";

const scopeOptions = [
  {
    id: "selected",
    label: "Selected references",
    detail: `${HANDOFF_REFERENCE_LIMIT} references (max)`,
  },
  {
    id: "entire",
    label: "Entire board",
    detail: "All 128 references (Compressed)",
  },
];

const packageFields = [
  { id: "references", label: "References" },
  { id: "mood", label: "Mood" },
  { id: "palette", label: "Colour palette" },
  { id: "typography", label: "Typography" },
  { id: "notes", label: "Designer notes" },
  { id: "sources", label: "Source links" },
];

const rightCaptionClass =
  "text-[13px] font-normal uppercase leading-none text-text-secondary";
const captionClass =
  "text-[14px] font-normal uppercase leading-none text-text-secondary";
const fallbackThumbs = [refThumb1, refThumb2, refThumb3, refThumb4];

function Radio({ selected }: { selected: boolean }) {
  return (
    <span
      className={`flex size-[20px] shrink-0 items-center justify-center rounded-full border ${
        selected ? "border-accent bg-accent" : "border-border bg-surface"
      }`}
    >
      {selected && <span className="size-[7px] rounded-full bg-white" />}
    </span>
  );
}

function Check({ checked, size = 21 }: { checked: boolean; size?: number }) {
  return (
    <span
      style={{ width: size, height: size }}
      className={`flex shrink-0 items-center justify-center rounded-[6px] border ${
        checked ? "border-accent bg-accent" : "border-border bg-surface"
      }`}
    >
      {checked && <img src={checkmark} alt="" style={{ width: size * 0.55 }} />}
    </span>
  );
}

export function AiHandoff() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const ids = (params.get("boards") ?? "").split(",");
  const selectedBoards = boards.filter((b) => ids.includes(b.id));

  const [scope, setScope] = useState("selected");
  const [intent, setIntent] = useState(
    "To make storytelling feel playful & visually new.",
  );
  const [included, setIncluded] = useState<Record<string, boolean>>({
    references: true,
    mood: true,
    palette: true,
    typography: true,
    notes: false,
    sources: false,
  });

  if (selectedBoards.length === 0) return <Navigate to="/send-to-ai" replace />;

  // Opened from a board's "Send N to AI" button: only the references picked on that board go out.
  const refIds = (params.get("refs") ?? "").split(",").filter(Boolean);
  const pickedRefs = refIds.length
    ? selectedBoards.flatMap((b) =>
        (referencesByBoard[b.id] ?? [])
          .filter((r) => refIds.includes(r.id))
          .map((r) => ({ board: b, ref: r })),
      )
    : [];
  const fromSelection = pickedRefs.length > 0;

  const sources = fromSelection
    ? selectedBoards
        .map((b) => ({
          id: b.id,
          title: b.title,
          count: pickedRefs.filter((p) => p.board.id === b.id).length,
        }))
        .filter((c) => c.count > 0)
    : selectedBoards.map((b) => ({
        id: b.id,
        title: b.title,
        count: b.itemCount,
      }));
  const total = sources.reduce((sum, c) => sum + c.count, 0);
  const pool = [
    ...(fromSelection
      ? pickedRefs.map((p) => p.ref.imageUrl)
      : selectedBoards
          .map((b) => b.imageUrl)
          .filter((u): u is string => Boolean(u))),
    ...fallbackThumbs,
  ];
  // Two clear previews plus a blurred third tile that carries the "+N more" count.
  const shown = pool.slice(0, Math.min(2, total));
  const extra = Math.max(0, total - 2);

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pl-11 pr-11 pb-28 pt-[40px] xl:pr-[134px]">
        <Breadcrumb
          separator=">"
          className="text-[14px]"
          items={[
            {
              label: "Back",
              to: fromSelection
                ? `/boards/${selectedBoards[0].id}`
                : `/send-to-ai?boards=${selectedBoards.map((b) => b.id).join(",")}`,
            },
            { label: "Send to AI" },
          ]}
        />

        <div className="flex items-start justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="relative">
              <BackLink
                to={
                  fromSelection
                    ? `/boards/${selectedBoards[0].id}`
                    : `/send-to-ai?boards=${selectedBoards.map((b) => b.id).join(",")}`
                }
                label="Back"
              />
              <h1 className="text-[27px] font-semibold leading-tight text-ink">
                AI Handoff
              </h1>
            </div>
            <p className="text-[16px] leading-snug text-text-secondary">
              Turn these references into structured context for your next build.
            </p>
          </div>
          <button
            type="button"
            className="flex h-11 items-center gap-2 rounded-full border border-border bg-surface px-5 text-[16px] font-medium leading-none text-ink transition-colors hover:bg-surface-soft"
          >
            <img src={editIcon} alt="" className="size-[15px]" />
            Edit Details
          </button>
        </div>

        <div className="grid min-h-[511px] grid-cols-1 rounded-[20px] border border-[#e6e6e6] bg-surface lg:grid-cols-[minmax(0,1fr)_437px]">
          <div className="flex flex-col gap-6 px-8 py-[27px]">
            <p className={captionClass}>What will be sent</p>

            <div className="flex flex-col gap-1.5">
              <h2 className="text-[18px] font-semibold leading-none text-ink">
                Selected references
              </h2>
              <p className="text-[16px] leading-snug text-text-secondary">
                {total} {total === 1 ? "reference" : "references"} from{" "}
                {sources.length} {sources.length === 1 ? "board" : "boards"}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex gap-[3px]">
                {shown.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="size-[77px] rounded-[6px] bg-placeholder object-cover"
                  />
                ))}
                {extra > 0 && (
                  <div className="relative size-[77px] overflow-hidden rounded-[6px]">
                    <img
                      src={pool[2]}
                      alt=""
                      className="size-full scale-110 object-cover blur-[5px]"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-white/55 text-[13px] font-semibold leading-none text-ink">
                      +{extra} More
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[14px] leading-none text-ink">
                {sources.map((c) => (
                  <span
                    key={c.id}
                    className="rounded-[8px] bg-surface-soft/70 px-3 py-2"
                  >
                    {c.title} ({c.count})
                  </span>
                ))}
              </div>
            </div>

            <div className="flex w-full max-w-[515px] flex-col gap-2.5">
              <label
                htmlFor="project-intent"
                className="text-[16px] font-medium leading-none text-ink"
              >
                Project Intent
              </label>
              <input
                id="project-intent"
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                className="h-[52px] w-full rounded-[12px] border border-border bg-surface px-5 text-[16px] text-ink outline-none transition-colors focus:border-accent"
              />
            </div>
          </div>

          <div className="border-t border-[#e6e6e6] py-[27px] pl-[57px] pr-8 lg:border-l lg:border-t-0">
            <div className="flex flex-col gap-8">
              <div className="flex w-[258px] max-w-full flex-col gap-[23px]">
                <p className={rightCaptionClass}>Scope / Include</p>
                <div className="flex flex-col gap-[22px]">
                  {scopeOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={scope === option.id}
                      onClick={() => setScope(option.id)}
                      className="flex items-start gap-[14px] text-left"
                    >
                      <Radio selected={scope === option.id} />
                      <span className="flex flex-col gap-[5px]">
                        <span className="text-[16px] font-medium leading-none text-ink">
                          {option.label}
                        </span>
                        <span className="text-[13px] leading-none text-text-secondary">
                          {option.id === "selected"
                            ? `${total} ${total === 1 ? "reference" : "references"} (max ${HANDOFF_REFERENCE_LIMIT})`
                            : option.detail}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <hr className="-ml-[57px] -mr-8 border-[#e6e6e6]" />

              <div className="flex w-[258px] max-w-full flex-col gap-4">
                <p className="text-[12px] font-normal uppercase leading-none text-text-secondary">
                  Include in package
                </p>
                <div className="flex flex-col gap-[11.4px]">
                  {packageFields.map((field) => (
                    <button
                      key={field.id}
                      type="button"
                      role="checkbox"
                      aria-checked={included[field.id]}
                      onClick={() =>
                        setIncluded((prev) => ({
                          ...prev,
                          [field.id]: !prev[field.id],
                        }))
                      }
                      className="flex items-center gap-3 text-left"
                    >
                      <Check checked={included[field.id]} size={17} />
                      <span
                        className={`text-[14px] leading-none ${included[field.id] ? "text-ink" : "text-text-secondary"}`}
                      >
                        {field.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            className="h-[43px] px-[22px] !text-[14px] leading-none"
            onClick={() => navigate("/home")}
          >
            Back to Home
          </Button>
          <Button
            variant="primary"
            className="h-[43px] px-[26px] !text-[14px] leading-none"
            onClick={() =>
              navigate(`/boards/${selectedBoards[0].id}/handoff/review`)
            }
          >
            Review &amp; Send
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
