import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BoardShell } from "../components/layout/BoardShell";
import { Breadcrumb, Button, PaletteDots, RadioOption } from "../components/ui";
import { BackLink } from "../components/ui/BackLink";
import { boards } from "../data/boards";
import { briefEdits, useBriefEdit } from "../data/briefEdits";
import { useHandoffReferences } from "../data/essentials";
import { ReferenceThumbs } from "../components/layout/ReferenceThumbs";
import { EditableChips } from "../components/build/EditFields";
import editIcon from "../assets/icons/edit-pencil.svg";
import checkmark from "../assets/icons/checkmark.svg";
import { useBoardOrigin } from "../data/boardOrigin";

const packageFields = [
  { id: "references", label: "References" },
  { id: "mood", label: "Mood" },
  { id: "palette", label: "Colour palette" },
  { id: "typography", label: "Typography" },
  { id: "notes", label: "Designer notes" },
  { id: "sources", label: "Source links" },
];

const layoutNotes = [
  "Experimental graphics",
  "Retro prints",
  "Cut-out imagery",
  "Vibrant colours",
  "Editorial collage",
];

/** Keyed by board so one board's edits and choices never carry over to the next. */
export function AiHandoffExport() {
  const { boardId } = useParams();
  return <AiHandoffExportView key={boardId} boardId={boardId} />;
}

function AiHandoffExportView({ boardId }: { boardId?: string }) {
  const origin = useBoardOrigin();
  const board = boards.find((b) => b.id === boardId) ?? boards[0];
  const navigate = useNavigate();
  const {
    all,
    essential: essentialRefs,
    send,
    usingEssential,
  } = useHandoffReferences(board.id);
  const scopeOptions = [
    {
      id: "entire",
      label: "Entire board",
      detail: `All ${all.length} references`,
    },
    {
      id: "essential",
      label: "Essential references",
      detail: `${essentialRefs.length} marked essential · default`,
    },
  ];

  // "Edit Details" changes the board's brief for hand-offs; it's the same session store the Build page and sidebar read.
  const edit = useBriefEdit(board.id);
  const brief = edit ?? board.brief;
  const edited = edit !== undefined;
  const [editing, setEditing] = useState(false);
  const layout = brief?.layout ?? layoutNotes;
  const update = (patch: Partial<NonNullable<typeof brief>>) => {
    if (brief) briefEdits.set(board.id, { ...brief, ...patch });
  };

  const [scope, setScope] = useState(usingEssential ? "essential" : "entire");
  // The Entire board scope previews every reference; the others use what a hand-off carries.
  const shown = scope === "entire" ? all : send;
  const [included, setIncluded] = useState<Record<string, boolean>>({
    references: true,
    mood: true,
    palette: true,
    typography: true,
    notes: false,
    sources: false,
  });

  return (
    <BoardShell board={board}>
      <div className="flex flex-col gap-6 pl-10 pr-10 pb-16 pt-[27px] xl:pr-[134px]">
        <Breadcrumb
          items={[
            { label: origin.label, to: origin.to },
            { label: board.title, to: `/boards/${board.id}` },
            { label: "AI Hand-Off" },
          ]}
        />

        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <div className="relative">
              <BackLink to={`/boards/${board.id}`} label="Back to board" />
              <h1 className="text-[27px] font-semibold leading-tight text-ink">
                AI Hand-Off
              </h1>
            </div>
            <p className="text-[16px] leading-snug text-text-secondary">
              Turn this board into structured context for your next build.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {edited && (
              <button
                type="button"
                onClick={() => briefEdits.set(board.id, null)}
                className="flex h-[35px] items-center rounded-full border border-border px-[13px] text-[15px] font-medium text-ink transition-colors hover:bg-surface-soft"
              >
                Reset
              </button>
            )}
            <button
              type="button"
              aria-pressed={editing}
              onClick={() => setEditing((v) => !v)}
              className={`flex h-[35px] items-center gap-2 rounded-full border px-[13.5px] text-[15px] font-medium text-ink transition-colors ${
                editing
                  ? "border-transparent bg-accent-tint"
                  : "border-border hover:bg-surface-soft"
              }`}
            >
              {!editing && (
                <img src={editIcon} alt="" className="size-[12px]" />
              )}
              {editing ? "Done" : "Edit Details"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 rounded-[20px] border border-[#e6e6e6] bg-surface p-7 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <p className="text-[12px] font-medium text-text-muted">
                WHAT WILL BE SENT
              </p>

              <div className="flex flex-col gap-2.5">
                <p className="text-[13px] font-medium text-ink">
                  {String(shown.length).padStart(2, "0")}{" "}
                  {scope === "essential" && usingEssential
                    ? `Essential reference${shown.length === 1 ? "" : "s"}`
                    : `Reference${shown.length === 1 ? "" : "s"}`}
                </p>
                <ReferenceThumbs images={shown.map((r) => r.imageUrl)} />
              </div>

              {brief && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[12px] font-medium text-text-secondary">
                      Mood
                    </p>
                    {editing ? (
                      <EditableChips
                        label="Add a mood"
                        placeholder="Add mood"
                        tone="outline"
                        editing
                        min={1}
                        items={brief.mood}
                        chipClassName="bg-surface px-3 py-1.5 font-medium"
                        onChange={(mood) => update({ mood })}
                      />
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {brief.mood.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-border bg-surface px-3 py-1.5 text-[13px] font-medium text-ink"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <p className="text-[12px] font-medium text-text-secondary">
                      Colour Palette
                    </p>
                    {editing ? (
                      <div className="flex h-6 items-center gap-1.5">
                        {brief.palette.map((colour, i) => (
                          <span key={i} className="group relative">
                            <label
                              className="block size-6 cursor-pointer overflow-hidden rounded-full border border-border ring-2 ring-transparent transition-shadow focus-within:ring-accent hover:ring-accent"
                              style={{ backgroundColor: colour }}
                            >
                              <span className="sr-only">Colour {i + 1}</span>
                              <input
                                type="color"
                                value={colour.toLowerCase()}
                                onChange={(e) =>
                                  update({
                                    palette: brief.palette.map((c, k) =>
                                      k === i
                                        ? e.target.value.toUpperCase()
                                        : c,
                                    ),
                                  })
                                }
                                className="size-full cursor-pointer opacity-0"
                              />
                            </label>
                            {brief.palette.length > 1 && (
                              <button
                                type="button"
                                aria-label={`Remove colour ${colour}`}
                                onClick={() =>
                                  update({
                                    palette: brief.palette.filter(
                                      (_, k) => k !== i,
                                    ),
                                  })
                                }
                                className="absolute -right-1 -top-1 flex size-[14px] items-center justify-center rounded-full bg-ink text-[10px] leading-none text-white opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
                              >
                                ×
                              </button>
                            )}
                          </span>
                        ))}
                        <button
                          type="button"
                          aria-label="Add a colour"
                          onClick={() =>
                            update({ palette: [...brief.palette, "#D9D9D9"] })
                          }
                          className="flex size-6 items-center justify-center rounded-full border border-dashed border-border text-[14px] leading-none text-text-secondary transition-colors hover:border-accent hover:text-ink"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <PaletteDots colors={[...new Set(brief.palette)]} />
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <p className="text-[12px] font-medium text-text-secondary">
                      Typography
                    </p>
                    {editing ? (
                      <input
                        aria-label="Typography"
                        value={brief.typography}
                        maxLength={60}
                        onChange={(e) => update({ typography: e.target.value })}
                        className="w-full rounded-md border border-border px-2.5 py-1.5 text-[13px] text-ink outline-none transition-colors focus:border-accent"
                      />
                    ) : (
                      <div className="w-fit rounded-md border border-border px-2.5 py-1.5 text-[13px] text-ink">
                        {brief.typography}
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="flex flex-col gap-1.5 text-text-secondary">
                <p className="text-[12px] font-medium">
                  Layout &amp; Visual Language
                </p>
                {editing ? (
                  <EditableChips
                    label="Add a layout note"
                    placeholder="Add note"
                    tone="outline"
                    editing
                    items={layout}
                    chipClassName="bg-surface px-3 py-1.5 text-ink"
                    onChange={(next) => update({ layout: next })}
                  />
                ) : (
                  <ul className="flex flex-col gap-1 text-[13px]">
                    {layout.map((note) => (
                      <li key={note}>- {note}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:border-l lg:border-border lg:pl-10">
            <div className="flex flex-col gap-4">
              <p className="text-[12px] font-medium text-text-muted">INCLUDE</p>
              <div className="flex flex-col gap-4">
                {scopeOptions.map((option) => (
                  <RadioOption
                    key={option.id}
                    label={option.label}
                    detail={option.detail}
                    selected={scope === option.id}
                    onClick={() => setScope(option.id)}
                  />
                ))}
              </div>
            </div>

            <hr className="border-border" />

            <div className="flex flex-col gap-3">
              <p className="text-[12px] font-medium text-text-muted">
                INCLUDE IN PACKAGE
              </p>
              {packageFields.map((field) => (
                <label key={field.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setIncluded((prev) => ({
                        ...prev,
                        [field.id]: !prev[field.id],
                      }))
                    }
                    className={`flex size-4 items-center justify-center rounded-[3px] border ${
                      included[field.id]
                        ? "border-accent bg-accent"
                        : "border-border bg-surface"
                    }`}
                  >
                    {included[field.id] && (
                      <img src={checkmark} alt="" className="size-2.5" />
                    )}
                  </button>
                  <span
                    className={`text-[14px] ${included[field.id] ? "text-ink" : "text-text-muted"}`}
                  >
                    {field.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            className="h-[43px] px-[22px]"
            onClick={() => navigate("/home")}
          >
            Back to Home
          </Button>
          <Button
            variant="primary"
            className="h-[43px] px-[22px] !text-[14px] font-semibold"
            onClick={() => navigate(`/boards/${board.id}/handoff/review`)}
          >
            Review &amp; Send
          </Button>
        </div>
      </div>
    </BoardShell>
  );
}
