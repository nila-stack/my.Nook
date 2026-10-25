import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BoardShell } from "../components/layout/BoardShell";
import { ReferenceThumbs } from "../components/layout/ReferenceThumbs";
import { Breadcrumb, Button } from "../components/ui";
import { BackLink } from "../components/ui/BackLink";
import { boards } from "../data/boards";
import { useBriefEdit } from "../data/briefEdits";
import { useHandoffReferences } from "../data/essentials";
import chevronDown from "../assets/icons/chevron-down.svg";
import copyIcon from "../assets/icons/copy.svg";
import radioSelected from "../assets/icons/radio-selected.svg";
import radioUnselected from "../assets/icons/radio-unselected.svg";
import refreshIcon from "../assets/icons/refresh.svg";
import { useBoardOrigin } from "../data/boardOrigin";
import { destinations } from "../data/destinations";
import { AddIntegrationDialog } from "../components/layout/AddIntegrationDialog";

const kinds = [
  { id: "website", label: "Website", noun: "a website" },
  { id: "app", label: "App", noun: "an app" },
  { id: "landing", label: "Landing page", noun: "a landing page" },
  { id: "component", label: "Component", noun: "a component" },
  { id: "prototype", label: "Prototype", noun: "a prototype" },
  { id: "other", label: "Other", noun: "something new" },
];

const cardClass =
  "flex flex-col gap-6 rounded-[20px] border border-[#e6e6e6] bg-surface p-7";
const labelClass = "text-[14px] font-semibold leading-none text-ink";
/** Small grey uppercase caption (as on "REFERENCE MODE") for the form labels above the fields. */
const captionClass =
  "text-[12px] font-medium uppercase leading-none text-text-muted";
const fieldClass =
  "w-full rounded-[12px] border border-border bg-surface px-4 text-[14px] text-ink outline-none transition-colors placeholder:text-text-muted focus:border-accent";
const GOAL_MAX = 200;
const PROMPT_MAX = 1000;

/** Regenerate cycles through these wordings, so each click gives a genuinely different prompt. */
const phrasing = {
  references: [
    "Use the selected references as visual direction for composition, typography, colour and imagery.",
    "Treat the selected references as the visual guide for layout, type, colour and imagery.",
    "Draw on the selected references for composition, typographic tone, colour and imagery.",
  ],
  experience: [
    "Keep the experience clear, responsive and easy to navigate.",
    "Make it clear, responsive and simple to move through.",
    "Prioritise a clear, responsive experience that is easy to navigate.",
  ],
  mood: [
    (m: string) =>
      `Use the board's ${m} character without directly copying any reference.`,
    (m: string) =>
      `Carry the board's ${m} spirit through, but never copy a reference directly.`,
    (m: string) =>
      `Let the ${m} character of this board lead, without reproducing any reference.`,
  ],
};

const trimEnd = (text: string) => text.trim().replace(/[.\s]+$/, "");

/** The brief's pieces, already worded; each tool lays them out its own way. */
type PromptParts = {
  goal: string;
  references: string;
  audience: string | null;
  requirement: string | null;
  experience: string;
  mood: string | null;
  palette: string | null;
  typography: string | null;
  /** How the board is shared: a one-off export or a live link. */
  sharing: string;
  tool: string;
};

const sentence = (...lines: (string | null | false)[]) =>
  lines.filter(Boolean).join(" ");
const bullets = (lines: (string | null | false)[]) =>
  lines
    .filter(Boolean)
    .map((l) => `- ${l}`)
    .join("\n");

/** Prompt shapes by tool: Claude gets a role and labelled sections, ChatGPT a conversational numbered ask, Antigravity an agent mission with a plan to review and screenshots to verify, Cursor repo-aware rules, Loveable a product description. */
const promptFor: Record<string, (p: PromptParts) => string> = {
  claude: (p) =>
    [
      "You are a senior product designer and front-end engineer.",
      `Goal: ${p.goal}`,
      `Design direction:\n${bullets([p.references, p.mood, p.palette, p.typography])}`,
      `Audience and requirements:\n${bullets([p.audience, p.requirement, p.experience])}`,
      `Before writing code, outline your plan and ask me anything that is unclear. ${p.sharing}`,
    ].join("\n\n"),
  chatgpt: (p) =>
    [
      `Hi! I'd like your help with a design project. ${p.goal}`,
      sentence(p.references, p.mood),
      sentence(p.palette, p.typography),
      sentence(p.audience, p.requirement, p.experience),
      `Please:\n1. Suggest the structure and key sections.\n2. Write the full code.\n3. Explain your design choices briefly.`,
      p.sharing,
    ]
      .filter(Boolean)
      .join("\n\n"),
  antigravity: (p) =>
    [
      `Mission: ${p.goal}`,
      `Design direction:\n${bullets([p.references, p.mood, p.palette, p.typography])}`,
      `Requirements:\n${bullets([p.audience, p.requirement, p.experience])}`,
      `Start with an implementation plan for me to review. When it's built, run it in the browser and show me screenshots of the result. ${p.sharing}`,
    ].join("\n\n"),
  cursor: (p) =>
    [
      `In this repo, ${p.goal.charAt(0).toLowerCase()}${p.goal.slice(1)}`,
      `Follow the existing project structure and conventions, and reuse components where you can.\n${bullets([p.references, p.mood, p.palette, p.typography])}`,
      sentence(p.audience, p.requirement, p.experience),
      `Make small, reviewable changes and tell me which files you touched. ${p.sharing}`,
    ].join("\n\n"),
  loveable: (p) =>
    [
      `${p.goal} Build it as a complete, polished first version with React and Tailwind.`,
      sentence(p.references, p.mood),
      sentence(p.palette, p.typography),
      sentence(p.audience, p.requirement, p.experience),
      `Include a hero, key sections and a clear call to action. ${p.sharing}`,
    ].join("\n\n"),
  other: (p) =>
    [
      p.goal,
      sentence(p.references, p.mood),
      sentence(p.audience, p.requirement, p.experience),
      sentence(p.palette, p.typography),
      `Use this brief in ${p.tool}. ${p.sharing}`,
    ]
      .filter((x) => x.trim())
      .join("\n\n"),
};

/** Keyed by board so one board's goal and prompt never carry over to the next. */
export function AiHandoffReview() {
  const { boardId } = useParams();
  return <AiHandoffReviewView key={boardId} boardId={boardId} />;
}

function AiHandoffReviewView({ boardId }: { boardId?: string }) {
  const origin = useBoardOrigin();
  const board = boards.find((b) => b.id === boardId) ?? boards[0];
  const navigate = useNavigate();
  // The visual direction is the board itself: its mood, palette, typography and the references going out.
  const { send } = useHandoffReferences(board.id);
  const brief = useBriefEdit(board.id) ?? board.brief;
  const mood = brief?.mood ?? [];
  const palette = [...new Set(brief?.palette ?? [])];

  const [kindId, setKindId] = useState("website");
  const kind = kinds.find((k) => k.id === kindId) ?? kinds[0];
  const [goalEdited, setGoalEdited] = useState<string | null>(null);
  const goal =
    goalEdited ??
    `Create ${kind.noun} that captures the ${mood.slice(0, 3).join(", ").toLowerCase() || "visual"} feel of this board.`;
  const [audience, setAudience] = useState("");
  const [requirement, setRequirement] = useState("");
  const [open, setOpen] = useState(false);
  // Where it goes and how: "Other" opens the integrations popup, and the tool picked there names the tile.
  const [destination, setDestination] = useState("claude");
  const [mode, setMode] = useState<"one-time" | "live">("one-time");
  const [pickingOther, setPickingOther] = useState(false);
  const [otherTool, setOtherTool] = useState<string | null>(null);
  const previousDestination = useRef("claude");
  const justChose = useRef(false);
  // Which wording of the prompt is showing; Regenerate moves to the next one.
  const [variant, setVariant] = useState(0);
  const [turns, setTurns] = useState(0);
  const pick = <T,>(options: T[]) => options[variant % options.length];

  // The goal box is one line tall to start and grows as more is typed.
  const goalRef = useRef<HTMLTextAreaElement>(null);

  const toolName =
    destination === "other"
      ? (otherTool ?? "your AI tool")
      : (destinations.find((d) => d.id === destination)?.name ??
        "your AI tool");
  const generated = (promptFor[destination] ?? promptFor.other)({
    goal: `${trimEnd(goal)}.`,
    references: pick(phrasing.references),
    audience: audience.trim() && `Design it for ${trimEnd(audience)}.`,
    requirement:
      requirement.trim() && `Key requirement: ${trimEnd(requirement)}.`,
    experience: pick(phrasing.experience),
    mood:
      mood.length > 0
        ? pick(phrasing.mood)(mood.join(", ").toLowerCase())
        : null,
    palette:
      palette.length > 0 ? `Colour palette: ${palette.join(", ")}.` : null,
    typography: brief
      ? `Typography: ${brief.typography} (${brief.fonts.heading} / ${brief.fonts.body}).`
      : null,
    sharing:
      mode === "live"
        ? "This board is a live reference, so check back for updates as it evolves."
        : "The references are a one-time export, so treat them as final.",
    tool: toolName,
  }).slice(0, PROMPT_MAX);
  // The prompt follows the form above until it is edited by hand; Regenerate goes back to following it.
  const [promptEdited, setPromptEdited] = useState<string | null>(null);
  const prompt = promptEdited ?? generated;

  useLayoutEffect(() => {
    const el = goalRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [goal]);

  const regenerate = () => {
    setPromptEdited(null);
    setVariant((v) => v + 1);
    setTurns((t) => t + 1);
  };

  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(copyTimer.current), []);
  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      // Clipboard can be blocked (insecure context / permissions); fall back to a hidden textarea.
      const ta = document.createElement("textarea");
      ta.value = prompt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 1600);
  };

  const count = send.length;
  const summary = `${count} ${count === 1 ? "reference" : "references"}`;

  const colHead = "flex flex-col gap-3";

  return (
    <BoardShell board={board}>
      <div className="flex flex-col gap-6 pl-10 pr-10 pb-28 pt-[27px] xl:pr-[134px]">
        <Breadcrumb
          items={[
            { label: origin.label, to: origin.to },
            { label: board.title, to: `/boards/${board.id}` },
            { label: "AI Hand-Off", to: `/boards/${board.id}/handoff` },
            { label: "Build from this board" },
          ]}
        />

        <div className="flex flex-col gap-2">
          <div className="relative">
            <BackLink
              to={`/boards/${board.id}/handoff`}
              label="Back to AI Hand-Off"
            />
            <h1 className="text-[27px] font-semibold leading-tight text-ink">
              Build from this board
            </h1>
          </div>
          <p className="text-[16px] leading-snug text-text-secondary">
            Turn your curated references into a build-ready prompt.
          </p>
        </div>

        <section className={cardClass}>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-[20px] font-semibold leading-tight text-ink">
              What do you want to build?
            </h2>
          </div>

          <div
            role="group"
            aria-label="What to build"
            className="flex flex-wrap gap-2.5"
          >
            {kinds.map((k) => (
              <button
                key={k.id}
                type="button"
                aria-pressed={kindId === k.id}
                onClick={() => setKindId(k.id)}
                className={`flex h-[38px] items-center rounded-full border px-5 text-[13px] leading-none text-ink transition-colors ${
                  kindId === k.id
                    ? "border-transparent bg-accent-tint"
                    : "border-border bg-surface hover:bg-surface-soft"
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2.5">
            <label htmlFor="build-goal" className={captionClass}>
              Build goal
            </label>
            <textarea
              id="build-goal"
              ref={goalRef}
              rows={1}
              maxLength={GOAL_MAX}
              value={goal}
              onChange={(e) => setGoalEdited(e.target.value)}
              className={`${fieldClass} min-h-[46px] resize-none overflow-hidden py-[11px] leading-[1.5]`}
            />
            <p className="text-right text-[12px] leading-none text-text-secondary">
              {goal.length}/{GOAL_MAX}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-2.5">
              <label htmlFor="build-audience" className={captionClass}>
                Audience{" "}
                <span className="font-medium text-text-muted">(optional)</span>
              </label>
              <input
                id="build-audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. Potential clients and design recruiters"
                className={`${fieldClass} h-[46px]`}
              />
            </div>
            <div className="flex flex-col gap-2.5">
              <label htmlFor="build-requirement" className={captionClass}>
                Key requirement{" "}
                <span className="font-medium text-text-muted">(optional)</span>
              </label>
              <input
                id="build-requirement"
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                placeholder="e.g. Make the projects easy to browse and understand"
                className={`${fieldClass} h-[46px]`}
              />
            </div>
          </div>
        </section>

        <section className={cardClass}>
          <div className="flex flex-col gap-3">
            <p className={captionClass}>Send to</p>
            <div
              role="radiogroup"
              aria-label="AI tool"
              className="grid grid-cols-3 gap-3 sm:grid-cols-6"
            >
              {destinations.map((dest) => {
                const selected = destination === dest.id;
                const name =
                  dest.id === "other" && otherTool ? otherTool : dest.name;
                return (
                  <button
                    key={dest.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => {
                      if (dest.id === "other") {
                        if (destination !== "other")
                          previousDestination.current = destination;
                        setPickingOther(true);
                      }
                      setDestination(dest.id);
                    }}
                    className={`flex h-[104px] flex-col items-center justify-center gap-2.5 rounded-[14px] border px-2 text-center transition-colors ${
                      selected
                        ? "border-transparent bg-accent-tint"
                        : "border-[#e6e6e6] bg-surface hover:bg-surface-soft"
                    }`}
                  >
                    <img
                      src={dest.logo}
                      alt=""
                      className="size-[48px] object-contain"
                    />
                    <span className="w-full truncate text-[13px] leading-none text-ink">
                      {name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className={captionClass}>Reference mode</p>
            <div
              role="radiogroup"
              aria-label="Reference mode"
              className="flex flex-wrap items-center gap-x-10 gap-y-3"
            >
              {(
                [
                  [
                    "one-time",
                    "One-time export",
                    "Sends the board once, as a snapshot of how it looks now.",
                  ],
                  [
                    "live",
                    "Live reference",
                    "Lets the tool check back as the board evolves, so it always sees the latest.",
                  ],
                ] as const
              ).map(([id, label, detail]) => {
                const selected = mode === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setMode(id)}
                    className="group/tip relative flex items-center gap-3 rounded-full py-1 pr-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <img
                      src={selected ? radioSelected : radioUnselected}
                      alt=""
                      className="size-[18px] shrink-0"
                    />
                    <span className="text-[15px] leading-none text-ink">
                      {label}
                    </span>
                    {/* Hover (or focus) the option for what the mode does. */}
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 w-[240px] translate-y-1 rounded-[10px] bg-ink px-3 py-2.5 text-[12px] leading-snug text-white opacity-0 transition-[opacity,transform] duration-150 group-hover/tip:translate-y-0 group-hover/tip:opacity-100 group-focus-visible/tip:translate-y-0 group-focus-visible/tip:opacity-100"
                    >
                      {detail}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className={cardClass}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <h2 className="text-[20px] font-semibold leading-tight text-ink">
                Visual direction
              </h2>
              <p className="text-[14px] leading-snug text-text-secondary">
                {summary}
              </p>
            </div>
            <button
              type="button"
              aria-expanded={open}
              aria-label={
                open ? "Collapse visual direction" : "Expand visual direction"
              }
              onClick={() => setOpen((v) => !v)}
              className="flex size-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-surface-soft"
            >
              <img
                src={chevronDown}
                alt=""
                className={`w-[11px] transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {open && (
            <div className="flex flex-wrap gap-y-6">
              <div className={`${colHead} pr-6`}>
                <p className={labelClass}>Mood</p>
                <div className="flex flex-wrap gap-2">
                  {mood.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border bg-surface px-3 py-2 text-[13px] leading-none text-ink"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className={`${colHead} border-l border-[#e6e6e6] px-6`}>
                <p className={labelClass}>Colour palette</p>
                <div className="flex h-9 items-center gap-1.5">
                  {palette.map((colour) => (
                    <span
                      key={colour}
                      className="size-6 rounded-full border border-border"
                      style={{ backgroundColor: colour }}
                    />
                  ))}
                </div>
              </div>

              <div className={`${colHead} border-l border-[#e6e6e6] px-6`}>
                <p className={labelClass}>Typography</p>
                <span className="w-fit rounded-md border border-border px-2.5 py-2 text-[13px] leading-none text-ink">
                  {brief?.typography}
                </span>
              </div>

              <div className={`${colHead} border-l border-[#e6e6e6] pl-6`}>
                <p className={labelClass}>
                  References{" "}
                  <span className="font-normal text-text-secondary">
                    ({count})
                  </span>
                </p>
                <ReferenceThumbs
                  size="sm"
                  images={send.map((r) => r.imageUrl)}
                />
              </div>
            </div>
          )}
        </section>

        <section className={cardClass}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <h2 className="text-[20px] font-semibold leading-tight text-ink">
                Generate prompt
              </h2>
            </div>
            <button
              type="button"
              onClick={regenerate}
              className="flex h-9 shrink-0 items-center gap-2 rounded-full border border-border bg-surface px-4 text-[13px] leading-none text-ink transition-colors hover:bg-surface-soft"
            >
              <img
                src={refreshIcon}
                alt=""
                style={{ transform: `rotate(${turns * 360}deg)` }}
                className="size-[14px] transition-transform duration-500"
              />
              Regenerate
            </button>
          </div>

          <div className="relative rounded-[14px] bg-surface-soft">
            <textarea
              aria-label="Generated prompt"
              rows={5}
              maxLength={PROMPT_MAX}
              value={prompt}
              onChange={(e) => setPromptEdited(e.target.value)}
              className="w-full resize-none rounded-[14px] bg-transparent py-4 pl-5 pr-5 text-[14px] leading-[1.6] text-ink outline-none"
            />
            <div className="flex items-center justify-between px-3 pb-2.5">
              <button
                type="button"
                aria-label="Copy prompt"
                onClick={copyPrompt}
                className="flex h-8 items-center gap-1.5 rounded-full px-2 text-[12px] leading-none text-text-secondary transition-colors hover:bg-black/5 hover:text-ink"
              >
                <img src={copyIcon} alt="" className="size-[16px] opacity-70" />
                {copied && <span>Copied</span>}
              </button>
              <p className="pr-2 text-[12px] leading-none text-text-secondary">
                {prompt.length}/{PROMPT_MAX}
              </p>
            </div>
          </div>
        </section>

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
            className="h-[43px] px-[22px] !text-[14px]"
            onClick={() =>
              navigate(
                `/boards/${board.id}/handoff/sent?to=${destination}${
                  destination === "other" && otherTool
                    ? `&name=${encodeURIComponent(otherTool)}`
                    : ""
                }&mode=${mode}`,
              )
            }
          >
            Send to AI
          </Button>
        </div>
      </div>
      {pickingOther && (
        <AddIntegrationDialog
          onClose={() => {
            setPickingOther(false);
            // Closed without choosing a tool: go back to the previous destination.
            if (!otherTool && !justChose.current)
              setDestination(previousDestination.current);
            justChose.current = false;
          }}
          onChoose={(name) => {
            justChose.current = true;
            setOtherTool(name);
            setDestination("other");
          }}
        />
      )}
    </BoardShell>
  );
}
