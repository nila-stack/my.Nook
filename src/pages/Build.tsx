import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { BoardShell } from "../components/layout/BoardShell";
import { PrototypePreview } from "../components/build/PrototypePreview";
import { EditableChips, HexField } from "../components/build/EditFields";
import { Breadcrumb } from "../components/ui";
import { BackLink } from "../components/ui/BackLink";
import { useBoards } from "../data/unsorted";
import { boards as seedBoards } from "../data/boards";
import { briefEdits, useBriefEdit } from "../data/briefEdits";
import { referencesByBoard, type Reference } from "../data/references";
import {
  aiTools,
  buildPrompt,
  buildTokens,
  colourTokens,
  fontTokens,
  googleFontsUrl,
  prototypeKinds,
  spacingTokens,
  tokenFormats,
  type AiTool,
  type Brief,
  type Include,
  type PrototypeKind,
  type TokenFormat,
} from "../lib/buildOutputs";
import checkmark from "../assets/icons/checkmark.svg";
import editIcon from "../assets/icons/edit-pencil.svg";
import chevronDown from "../assets/icons/chevron-down.svg";
import sparkleWhite from "../assets/icons/ai-fab.svg";
import iconTokens from "../assets/icons/nav-tags.svg";
import iconPrompt from "../assets/icons/nav-comment.svg";
import iconPrototype from "../assets/icons/nav-send-ai.svg";
import logoClaude from "../assets/images/ai-logo-claude.png";
import logoCursor from "../assets/images/ai-logo-cursor.png";
import logoAntigravity from "../assets/images/ai-logo-antigravity.png";
import logoLoveable from "../assets/images/ai-logo-loveable.png";
import logoChatgpt from "../assets/images/ai-logo-chatgpt.png";
import { useBoardOrigin } from "../data/boardOrigin";

type Mode = "tokens" | "prompt" | "prototype";
type Tab = "preview" | "palette" | "typography" | "notes";

const noReferences: Reference[] = [];

const modes: { id: Mode; title: string; blurb: string; icon: string }[] = [
  {
    id: "tokens",
    title: "Design Language",
    blurb:
      "Generate colour palette, typography and style guidelines from this board.",
    icon: iconTokens,
  },
  {
    id: "prompt",
    title: "AI prompt / build brief",
    blurb: "Create a detailed prompt with your references, styles and notes.",
    icon: iconPrompt,
  },
  {
    id: "prototype",
    title: "Quick prototype",
    blurb: "Generate a starter layout or component set in this style.",
    icon: iconPrototype,
  },
];

const modeCopy: Record<
  Mode,
  { title: string; description: string; action: string }
> = {
  tokens: {
    title: "Design Language",
    description:
      "Your Board Brief becomes a ready-to-use design language, including colours, typography and style notes.",
    action: "Generate design language",
  },
  prompt: {
    title: "AI prompt / build brief",
    description:
      "Your Board Brief becomes a detailed prompt your AI tool can build from, with styles, notes and sources.",
    action: "Generate prompt",
  },
  prototype: {
    title: "Quick prototype",
    description:
      "See this board's palette and type applied to a starter layout, then hand the same brief to your AI tool.",
    action: "Generate prototype",
  },
};

const includeOptions: {
  id: keyof Include;
  title: string;
  detail: string;
  only?: Mode;
}[] = [
  {
    id: "palette",
    title: "Colour palette",
    detail: "Extract key colours from your references",
  },
  {
    id: "typography",
    title: "Typography",
    detail: "Include font styles and scale",
  },
  {
    id: "notes",
    title: "Style notes",
    detail: "Add mood and visual guidelines",
  },
  {
    id: "sources",
    title: "Reference sources",
    detail: "List where the references came from",
    only: "prompt",
  },
];

const toolLogos: Record<AiTool, string> = {
  claude: logoClaude,
  cursor: logoCursor,
  antigravity: logoAntigravity,
  loveable: logoLoveable,
  chatgpt: logoChatgpt,
};

const labelClass = "text-[15px] font-semibold leading-none text-ink";

function OptionChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex h-[38px] items-center rounded-[10px] border px-4 text-[13px] leading-none text-ink transition-colors ${
        selected
          ? "border-transparent bg-accent-tint"
          : "border-border bg-surface hover:bg-surface-soft"
      }`}
    >
      {children}
    </button>
  );
}

function AccentCheck({
  checked,
  onChange,
  title,
  detail,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  title: string;
  detail: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-start gap-[11px] text-left"
    >
      <span
        className={`mt-0.5 flex size-[19px] shrink-0 items-center justify-center rounded-[6px] border ${
          checked ? "border-accent bg-accent" : "border-border bg-surface"
        }`}
      >
        {checked && <img src={checkmark} alt="" className="w-[10.5px]" />}
      </span>
      <span className="flex flex-col gap-[5px]">
        <span className="text-[13px] font-semibold leading-none text-ink">
          {title}
        </span>
        <span className="text-[11px] leading-none text-text-secondary">
          {detail}
        </span>
      </span>
    </button>
  );
}

function ToolSelect({
  value,
  onChange,
}: {
  value: AiTool;
  onChange: (tool: AiTool) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = aiTools.find((t) => t.id === value) ?? aiTools[0];

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
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-[50px] w-full items-center gap-3 rounded-[12px] border border-border bg-surface px-4 text-left text-[15px] text-ink"
      >
        <img
          src={toolLogos[current.id]}
          alt=""
          className="size-[26px] object-contain"
        />
        <span className="flex-1">{current.label}</span>
        <img
          src={chevronDown}
          alt=""
          className={`w-[11px] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-20 mt-2 w-full rounded-[12px] border border-border bg-surface py-1.5 shadow-[0px_8px_24px_0px_rgba(0,0,0,0.1)]"
        >
          {aiTools.map((t) => (
            <li key={t.id} role="option" aria-selected={t.id === value}>
              <button
                type="button"
                onClick={() => {
                  onChange(t.id);
                  setOpen(false);
                }}
                className="flex h-10 w-full items-center gap-3 px-4 text-left text-[14px] text-ink hover:bg-surface-soft"
              >
                <img
                  src={toolLogos[t.id]}
                  alt=""
                  className="size-[22px] object-contain"
                />
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Light syntax colouring for the generated CSS / JSON: comments, custom properties, values and strings. */
function Highlight({ text }: { text: string }) {
  const parts = text.split(
    /(\/\*.*?\*\/|"[^"\n]*"|#[0-9A-Fa-f]{6}\b|--[\w-]+|\b\d+px\b)/g,
  );
  return (
    <>
      {parts.map((part, i) => {
        let cls = "";
        if (part.startsWith("/*")) cls = "text-[#7a8a7a]";
        else if (part.startsWith("--")) cls = "text-[#0f766e]";
        else if (part.startsWith('"')) cls = "text-[#1d4ed8]";
        else if (/^#[0-9A-Fa-f]{6}$/.test(part) || /px$/.test(part))
          cls = "text-[#1d4ed8]";
        return cls ? (
          <span key={i} className={cls}>
            {part}
          </span>
        ) : (
          part
        );
      })}
    </>
  );
}

/** Google fonts offered in the editor: a curated set plus whatever the boards already use. */
const fontChoices = [
  ...new Set([
    ...seedBoards.flatMap((b) =>
      b.brief ? [b.brief.fonts.heading, b.brief.fonts.body] : [],
    ),
    "Anton",
    "Archivo Black",
    "Bebas Neue",
    "DM Sans",
    "Fraunces",
    "IBM Plex Sans",
    "Inter",
    "Libre Franklin",
    "Manrope",
    "Merriweather",
    "Roboto",
    "Syne",
    "Work Sans",
  ]),
].sort();

const smallButton =
  "flex h-8 items-center gap-1.5 rounded-full border px-4 text-[13px] leading-none text-ink transition-colors";

function Swatches({ brief }: { brief: Brief }) {
  const colours = colourTokens(brief.palette, brief.colours);
  return (
    <div className="flex flex-wrap gap-3">
      {colours.map((c) => (
        <div
          key={c.name}
          className="flex w-[52px] flex-col items-center gap-1.5"
        >
          <span
            className="h-[46px] w-full rounded-[10px] border border-black/5"
            style={{ backgroundColor: c.hex }}
          />
          <span className="text-[9px] leading-none text-text-secondary">
            {c.hex}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Build() {
  const origin = useBoardOrigin();
  const { boardId } = useParams();
  const boards = useBoards();
  const board = boards.find((b) => b.id === boardId) ?? boards[0];
  const baseBrief = board.brief;
  // Edits made on this page live in a shared store (per board), so every preview, output and the sidebar follow them.
  const edit = useBriefEdit(board.id);
  const brief = edit ?? baseBrief;
  const edited = edit !== undefined;
  const [editing, setEditing] = useState(false);
  const liveBoard = useMemo(() => ({ ...board, brief }), [board, brief]);
  const updateBrief = (patch: Partial<Brief>) => {
    if (brief) briefEdits.set(board.id, { ...brief, ...patch });
  };
  const setColour = (name: string, hex: string) =>
    updateBrief({ colours: { ...brief?.colours, [name]: hex } });
  const references = referencesByBoard[board.id] ?? noReferences;

  const [mode, setMode] = useState<Mode>("tokens");
  const [tab, setTab] = useState<Tab>("preview");
  const [format, setFormat] = useState<TokenFormat>("css");
  const [kind, setKind] = useState<PrototypeKind>("landing");
  const [what, setWhat] = useState("a landing page");
  const [tool, setTool] = useState<AiTool>("claude");
  const [include, setInclude] = useState<Include>({
    palette: true,
    typography: true,
    notes: true,
    sources: true,
  });
  const [status, setStatus] = useState<{ key: string; text: string } | null>(
    null,
  );
  const copyTimer = useRef<number | undefined>(undefined);
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  // Load this board's fonts so the specimens and the prototype render in the real families.
  useEffect(() => {
    if (!brief) return;
    const id = "nook-build-fonts";
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = googleFontsUrl(brief);
  }, [brief]);

  const fonts = useMemo(() => (brief ? fontTokens(brief) : []), [brief]);
  const spacing = useMemo(() => (brief ? spacingTokens(brief) : []), [brief]);
  const kindInfo =
    prototypeKinds.find((k) => k.id === kind) ?? prototypeKinds[0];

  const output = useMemo(() => {
    if (!brief) return "";
    if (mode === "tokens") return buildTokens(board, brief, format, include);
    return buildPrompt({
      board,
      brief,
      references,
      tool,
      what:
        mode === "prototype" ? `${kindInfo.what} as a starter prototype` : what,
      include,
    });
  }, [board, brief, references, mode, format, include, tool, what, kindInfo]);

  const settingsKey = JSON.stringify({
    brief,
    mode,
    format,
    kind,
    what,
    tool,
    include,
  });
  const activeStatus =
    status && status.key === settingsKey ? status.text : null;

  const writeClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard can be blocked (insecure context / permissions) — fall back to a hidden textarea.
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
  };

  const copyAll = async () => {
    await writeClipboard(output);
    setCopiedAll(true);
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopiedAll(false), 1600);
  };

  const generate = async () => {
    await writeClipboard(output);
    const toolLabel = (aiTools.find((t) => t.id === tool) ?? aiTools[0]).label;
    const what =
      mode === "tokens"
        ? "design language"
        : mode === "prompt"
          ? "prompt"
          : "prototype brief";
    setTab("preview");
    setStatus({
      key: settingsKey,
      text: `Copied the ${what} for ${toolLabel}. Paste it into your chat.`,
    });
  };

  const setIncluded = (id: keyof Include, next: boolean) =>
    setInclude((prev) => ({ ...prev, [id]: next }));

  const tabs: [Tab, string][] = [
    ["preview", "Preview"],
    ["palette", "Colour palette"],
    ["typography", "Typography"],
    ["notes", "Style notes"],
  ];

  return (
    <BoardShell board={board}>
      <div className="flex flex-col gap-6 pl-10 pr-10 pb-28 pt-[27px] xl:pr-[134px]">
        <Breadcrumb
          items={[
            { label: origin.label, to: origin.to },
            { label: board.title, to: `/boards/${board.id}` },
            { label: "Build" },
          ]}
        />

        <div className="flex flex-col gap-2">
          <div className="relative">
            <BackLink to={`/boards/${board.id}`} label="Back to board" />
            <h1 className="text-[27px] font-semibold leading-tight text-ink">
              Build from this board
            </h1>
          </div>
          <p className="text-[16px] leading-snug text-text-secondary">
            Turn your collected references into ready-to-use assets, prompts or
            a starter prototype.
          </p>
        </div>

        {!brief ? (
          <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-border bg-surface/60 py-20 text-center">
            <p className="text-[16px] font-medium text-ink">
              No board brief yet
            </p>
            <p className="max-w-sm text-[14px] text-text-secondary">
              Add mood, palette and typography to this board&apos;s brief and
              they&apos;ll show up here.
            </p>
          </div>
        ) : (
          <>
            <div
              role="tablist"
              aria-label="What to build"
              className="grid grid-cols-1 gap-4 lg:grid-cols-3"
            >
              {modes.map((m) => {
                const selected = mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => {
                      setMode(m.id);
                      setTab("preview");
                    }}
                    className={`flex items-center gap-4 rounded-[16px] border p-[18px] text-left transition-colors ${
                      selected
                        ? "border-transparent bg-accent-tint"
                        : "border-[#e6e6e6] bg-surface hover:bg-surface-soft/60"
                    }`}
                  >
                    <span
                      className={`flex size-[52px] shrink-0 items-center justify-center rounded-[14px] ${
                        selected ? "bg-white/70" : "bg-surface-soft"
                      }`}
                    >
                      <img src={m.icon} alt="" className="size-[22px]" />
                    </span>
                    <span className="flex flex-col gap-1.5">
                      <span className="text-[15px] font-semibold leading-none text-ink">
                        {m.title}
                      </span>
                      <span className="text-[13px] leading-[1.35] text-text-secondary">
                        {m.blurb}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,9fr)_minmax(0,11fr)]">
              {/* Controls */}
              <section className="flex flex-col gap-6 self-start rounded-[20px] border border-[#e6e6e6] bg-surface px-7 pb-[35px] pt-7">
                <div className="flex flex-col gap-2.5">
                  <h2 className="text-[22px] font-semibold leading-none text-ink">
                    {modeCopy[mode].title}
                  </h2>
                  <p className="text-[14px] leading-[1.5] text-text-secondary">
                    {modeCopy[mode].description}
                  </p>
                </div>
                <hr className="border-[#e6e6e6]" />

                {mode === "tokens" && (
                  <div className="flex flex-col gap-3">
                    <p className={labelClass}>Output format</p>
                    <div className="flex flex-wrap gap-2.5">
                      {tokenFormats.map((f) => (
                        <OptionChip
                          key={f.id}
                          selected={format === f.id}
                          onClick={() => setFormat(f.id)}
                        >
                          {f.label}
                        </OptionChip>
                      ))}
                    </div>
                  </div>
                )}

                {mode === "prompt" && (
                  <div className="flex flex-col gap-3">
                    <label htmlFor="build-what" className={labelClass}>
                      What do you want to build?
                    </label>
                    <input
                      id="build-what"
                      value={what}
                      onChange={(e) => setWhat(e.target.value)}
                      placeholder="a landing page"
                      className="h-[48px] w-full rounded-[12px] border border-border bg-surface px-4 text-[15px] text-ink outline-none transition-colors focus:border-accent"
                    />
                  </div>
                )}

                {mode === "prototype" && (
                  <div className="flex flex-col gap-3">
                    <p className={labelClass}>What to generate</p>
                    <div className="flex flex-wrap gap-2.5">
                      {prototypeKinds.map((k) => (
                        <OptionChip
                          key={k.id}
                          selected={kind === k.id}
                          onClick={() => setKind(k.id)}
                        >
                          {k.label}
                        </OptionChip>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  <p className="text-[14px] font-semibold leading-none text-ink">
                    {mode === "tokens"
                      ? "Include in design language"
                      : mode === "prompt"
                        ? "Include in prompt"
                        : "Apply to the prototype"}
                  </p>
                  {includeOptions
                    .filter((o) => !o.only || o.only === mode)
                    .map((o) => (
                      <AccentCheck
                        key={o.id}
                        checked={Boolean(include[o.id])}
                        onChange={(next) => setIncluded(o.id, next)}
                        title={o.title}
                        detail={o.detail}
                      />
                    ))}
                </div>

                <div className="flex flex-col gap-3">
                  <p className={labelClass}>AI tool</p>
                  <ToolSelect value={tool} onChange={setTool} />
                  <p className="text-[13px] leading-none text-text-secondary">
                    Send the generated{" "}
                    {mode === "tokens"
                      ? "design language"
                      : mode === "prompt"
                        ? "prompt"
                        : "brief"}{" "}
                    directly to your connected AI tool.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={generate}
                    className="flex h-[43px] w-full items-center justify-center gap-2 rounded-full bg-accent text-[14px] font-medium leading-none text-white transition-colors hover:bg-accent-hover active:scale-[0.99]"
                  >
                    <img src={sparkleWhite} alt="" className="size-[19px]" />
                    {modeCopy[mode].action}
                  </button>
                  <p
                    aria-live="polite"
                    className="text-center text-[13px] leading-none text-text-secondary empty:hidden"
                  >
                    {activeStatus}
                  </p>
                </div>
              </section>

              {/* Preview */}
              <section className="flex min-w-0 flex-col gap-5 rounded-[20px] border border-[#e6e6e6] bg-surface p-7">
                <div className="flex items-center justify-between gap-4 border-b border-[#e6e6e6]">
                  <div
                    role="tablist"
                    aria-label="Preview sections"
                    className="flex flex-wrap gap-6"
                  >
                    {tabs.map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        role="tab"
                        aria-selected={tab === id}
                        onClick={() => setTab(id)}
                        className={`-mb-px border-b-2 pb-3 text-[14px] leading-none transition-colors ${
                          tab === id
                            ? "border-accent font-medium text-ink"
                            : "border-transparent text-text-secondary hover:text-ink"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={copyAll}
                    className="mb-3 flex min-w-[78px] items-center justify-end text-[14px] leading-none text-ink hover:text-accent"
                  >
                    {copiedAll ? "Copied" : "Copy all"}
                  </button>
                </div>

                {tab === "preview" && (
                  <div className="flex flex-col gap-5">
                    {mode === "prototype" ? (
                      <>
                        <h3 className="text-[16px] font-semibold leading-none text-ink">
                          {kindInfo.label}
                        </h3>
                        <PrototypePreview
                          board={liveBoard}
                          kind={kind}
                          include={include}
                        />
                      </>
                    ) : (
                      <>
                        <h3 className="text-[16px] font-semibold leading-none text-ink">
                          {mode === "tokens"
                            ? (
                                tokenFormats.find((f) => f.id === format) ??
                                tokenFormats[0]
                              ).title
                            : "AI prompt"}
                        </h3>
                        <pre
                          aria-label={
                            mode === "tokens"
                              ? "Generated design language"
                              : "Generated AI prompt"
                          }
                          className="max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-[14px] bg-surface-soft p-5 font-mono text-[12.5px] leading-[1.65] text-ink"
                        >
                          {mode === "tokens" ? (
                            <Highlight text={output} />
                          ) : (
                            output
                          )}
                        </pre>
                      </>
                    )}

                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-[16px] font-semibold leading-none text-ink">
                          Quick preview
                        </h3>
                        <button
                          type="button"
                          aria-label="Edit colours, fonts and tags"
                          onClick={() => {
                            setTab("palette");
                            setEditing(true);
                          }}
                          className="flex items-center gap-1.5 text-[13px] leading-none text-text-secondary transition-colors hover:text-ink"
                        >
                          <img
                            src={editIcon}
                            alt=""
                            className="size-[12px] opacity-60"
                          />
                          Edit
                        </button>
                      </div>
                      <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
                        <Swatches brief={brief} />
                        <div className="flex gap-6">
                          {fonts.slice(0, 2).map((f) => (
                            <div
                              key={f.name}
                              className="flex flex-col items-center gap-1"
                            >
                              <span
                                className="text-[34px] leading-none text-ink"
                                style={{ fontFamily: f.stack }}
                              >
                                Aa
                              </span>
                              <span className="text-[12px] leading-none text-text-secondary">
                                {f.family}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {tab !== "preview" && (
                  <div className="-mt-1 flex items-center justify-between gap-3">
                    <p className="text-[13px] leading-snug text-text-secondary">
                      {editing
                        ? "Changes update the preview, design language and prompt live."
                        : edited
                          ? "Edited. Reset brings back the board's original brief."
                          : "Pulled from this board's brief."}
                    </p>
                    <div className="flex shrink-0 items-center gap-2">
                      {edited && (
                        <button
                          type="button"
                          onClick={() => briefEdits.set(board.id, null)}
                          className={`${smallButton} border-border bg-surface hover:bg-surface-soft`}
                        >
                          Reset
                        </button>
                      )}
                      <button
                        type="button"
                        aria-pressed={editing}
                        onClick={() => setEditing((v) => !v)}
                        className={`${smallButton} ${
                          editing
                            ? "border-transparent bg-accent-tint"
                            : "border-border bg-surface hover:bg-surface-soft"
                        }`}
                      >
                        {!editing && (
                          <img src={editIcon} alt="" className="size-[12px]" />
                        )}
                        {editing ? "Done" : "Edit"}
                      </button>
                    </div>
                  </div>
                )}

                {tab === "palette" && (
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {colourTokens(brief.palette, brief.colours).map((c) => (
                      <li
                        key={c.name}
                        className="flex items-center gap-4 rounded-[14px] border border-[#e6e6e6] p-3"
                      >
                        {editing ? (
                          <label
                            className="relative size-[48px] shrink-0 cursor-pointer overflow-hidden rounded-[10px] border border-black/10 ring-2 ring-transparent transition-shadow focus-within:ring-accent hover:ring-accent"
                            style={{ backgroundColor: c.hex }}
                          >
                            <span className="sr-only">
                              Pick {c.role} colour
                            </span>
                            <input
                              type="color"
                              value={c.hex.toLowerCase()}
                              onChange={(e) =>
                                setColour(c.name, e.target.value.toUpperCase())
                              }
                              className="absolute inset-0 size-full cursor-pointer opacity-0"
                            />
                          </label>
                        ) : (
                          <span
                            className="size-[48px] shrink-0 rounded-[10px] border border-black/5"
                            style={{ backgroundColor: c.hex }}
                          />
                        )}
                        <span className="flex min-w-0 flex-col gap-1.5">
                          <span className="text-[14px] font-medium leading-none text-ink">
                            {c.role}
                          </span>
                          {editing ? (
                            <HexField
                              label={c.role}
                              value={c.hex}
                              onCommit={(hex) => setColour(c.name, hex)}
                            />
                          ) : (
                            <span className="text-[13px] leading-none text-text-secondary">
                              {c.hex} · --color-{c.name}
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {tab === "typography" && (
                  <ul className="flex flex-col gap-4">
                    {fonts.map((f) => {
                      const key = f.name === "heading" ? "heading" : "body";
                      const pickable = f.name !== "mono";
                      return (
                        <li
                          key={f.name}
                          className="flex items-center justify-between gap-4 rounded-[14px] border border-[#e6e6e6] p-5"
                        >
                          <span className="flex min-w-0 flex-col gap-2">
                            <span className="text-[12px] uppercase leading-none text-text-secondary">
                              {f.role} · {f.family}
                            </span>
                            <span
                              className="text-[26px] leading-tight text-ink"
                              style={{ fontFamily: f.stack }}
                            >
                              {f.name === "mono"
                                ? "const style = board.brief;"
                                : brief.tagline}
                            </span>
                          </span>
                          {editing && pickable ? (
                            <select
                              aria-label={`${f.role} font`}
                              value={f.family}
                              onChange={(e) =>
                                updateBrief({
                                  fonts: {
                                    ...brief.fonts,
                                    [key]: e.target.value,
                                  },
                                })
                              }
                              className="h-9 shrink-0 cursor-pointer rounded-[10px] border border-border bg-surface px-3 text-[13px] text-ink outline-none transition-colors focus:border-accent"
                            >
                              {[...new Set([f.family, ...fontChoices])]
                                .sort()
                                .map((family) => (
                                  <option key={family} value={family}>
                                    {family}
                                  </option>
                                ))}
                            </select>
                          ) : (
                            <span className="text-[13px] text-text-secondary">
                              {f.sample}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}

                {tab === "notes" && (
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2.5">
                      <p className={labelClass}>Mood</p>
                      <EditableChips
                        label="Add a mood"
                        placeholder="Add mood"
                        tone="outline"
                        editing={editing}
                        min={1}
                        items={brief.mood}
                        onChange={(mood) => updateBrief({ mood })}
                      />
                    </div>
                    <div className="flex flex-col gap-2.5">
                      <p className={labelClass}>Style keywords</p>
                      <EditableChips
                        label="Add a style keyword"
                        placeholder="Add keyword"
                        tone="tint"
                        editing={editing}
                        items={brief.keywords}
                        onChange={(keywords) => updateBrief({ keywords })}
                      />
                    </div>
                    <div className="flex flex-col gap-2.5">
                      <p className={labelClass}>Visual guidelines</p>
                      {editing ? (
                        <textarea
                          aria-label="Visual guidelines"
                          rows={3}
                          value={brief.notes}
                          onChange={(e) =>
                            updateBrief({ notes: e.target.value })
                          }
                          className="w-full resize-none rounded-[12px] border border-border bg-surface px-4 py-3 text-[14px] leading-[1.6] text-ink outline-none transition-colors focus:border-accent"
                        />
                      ) : (
                        <p className="text-[14px] leading-[1.6] text-text-secondary">
                          {brief.notes.replace(/\.+$/, "")}.
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2.5">
                      <p className={labelClass}>Spacing scale</p>
                      <div className="flex items-end gap-4">
                        {spacing.map((s) => (
                          <div
                            key={s.name}
                            className="flex flex-col items-center gap-1.5"
                          >
                            <span
                              className="rounded-[4px] bg-accent"
                              style={{ width: s.px, height: s.px }}
                            />
                            <span className="text-[12px] leading-none text-text-secondary">
                              {s.name} · {s.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </BoardShell>
  );
}
