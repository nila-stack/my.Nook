import { useEffect, useRef, useState, type DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { Board } from "../../data/boards";
import {
  collectionSamples,
  unsortedActions,
  type UnsortedItem,
} from "../../data/unsorted";
import { linkTile, parseUrl, titleFromUrl } from "../../lib/links";
import { Button, Checkbox, Chip } from "../ui";
import { Modal } from "./CreateDialogs";

type Tab = "collection" | "file" | "extension";
type Destination = "board" | "unsorted";

/** One thing that can be imported: a reference from a collection, or a link found in a file. */
type Candidate = {
  key: string;
  title: string;
  domain: string;
  imageUrl: string;
};

/** Keys of everything imported this session, so a second import can say "Already added". */
const imported = new Set<string>();

const sources = [
  { host: "pinterest.com", label: "Pinterest" },
  { host: "are.na", label: "Are.na" },
  { host: "dribbble.com", label: "Dribbble" },
  { host: "behance.net", label: "Behance" },
];

const MAX_FILE_LINKS = 200;

/** Pulls links out of a bookmarks export, CSV or plain text: anchors first (they carry a title), then bare URLs. */
function linksFromText(text: string): Candidate[] {
  const found: Candidate[] = [];
  const seen = new Set<string>();
  const add = (raw: string, label?: string) => {
    const url = parseUrl(raw.replace(/[.,;:!?)\]]+$/, ""));
    if (!url || seen.has(url.href)) return;
    seen.add(url.href);
    const host = url.hostname.replace(/^www\./, "");
    const title = label?.trim() || titleFromUrl(url);
    found.push({
      key: url.href,
      title,
      domain: host,
      imageUrl: linkTile(host),
    });
  };
  for (const m of text.matchAll(
    /<a\s[^>]*href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi,
  ))
    add(m[1], m[2]);
  for (const m of text.matchAll(/https?:\/\/[^\s"'<>]+/gi)) add(m[0]);
  return found.slice(0, MAX_FILE_LINKS);
}

const captionClass = "text-[15px] font-semibold leading-none text-ink";
const fieldClass =
  "h-[46px] w-full rounded-[12px] border border-border bg-surface px-4 text-[14px] text-ink outline-none transition-colors placeholder:text-text-muted focus:border-accent";

/** Tick-list of candidates; ones already imported are greyed and can't be picked again. */
function CandidateList({
  candidates,
  selected,
  onToggle,
  layout,
}: {
  candidates: Candidate[];
  selected: Set<string>;
  onToggle: (key: string) => void;
  layout: "grid" | "list";
}) {
  return (
    <ul
      className={
        layout === "grid"
          ? "grid grid-cols-4 gap-3"
          : "flex max-h-[220px] flex-col gap-2 overflow-y-auto"
      }
    >
      {candidates.map((c) => {
        const done = imported.has(c.key);
        const checked = selected.has(c.key);
        return (
          <li key={c.key}>
            <label
              className={`relative flex cursor-pointer ${
                layout === "grid"
                  ? "flex-col gap-1.5"
                  : "items-center gap-3 rounded-[12px] border border-[#e6e6e6] bg-surface px-3 py-2"
              } ${done ? "cursor-not-allowed opacity-50" : ""}`}
            >
              {layout === "grid" ? (
                <>
                  <span
                    className={`relative block aspect-square overflow-hidden rounded-[10px] bg-placeholder ring-2 ${
                      checked ? "ring-accent" : "ring-transparent"
                    }`}
                  >
                    <img
                      src={c.imageUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                    <Checkbox
                      aria-label={`Select ${c.title}`}
                      checked={checked}
                      disabled={done}
                      onChange={() => onToggle(c.key)}
                      className="absolute left-1.5 top-1.5 size-[16px] shadow-sm"
                    />
                  </span>
                  <span className="truncate text-[12px] leading-none text-ink">
                    {c.title}
                  </span>
                  {done && (
                    <span className="text-[11px] leading-none text-text-secondary">
                      Already added
                    </span>
                  )}
                </>
              ) : (
                <>
                  <Checkbox
                    aria-label={`Select ${c.title}`}
                    checked={checked}
                    disabled={done}
                    onChange={() => onToggle(c.key)}
                    className="size-[16px] shrink-0"
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="truncate text-[13px] leading-none text-ink">
                      {c.title}
                    </span>
                    <span className="truncate text-[12px] leading-none text-text-secondary">
                      {done ? "Already added" : c.domain}
                    </span>
                  </span>
                </>
              )}
            </label>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * "Import links" from a board's sidebar. Three ways in: a collection link (Pinterest, Are.na, Dribbble, Behance),
 * a file of links (bookmarks export, CSV, text), or the browser extension. Candidates are previewed first so you
 * choose what comes in, and anything imported before is flagged.
 */
export function ImportLinksDialog({
  board,
  onClose,
}: {
  board: Board;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("collection");
  const [destination, setDestination] = useState<Destination>("board");

  // Collection
  const [collectionUrl, setCollectionUrl] = useState("");
  const [finding, setFinding] = useState(false);
  const [collection, setCollection] = useState<{
    label: string;
    candidates: Candidate[];
  } | null>(null);
  const [collectionError, setCollectionError] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // File
  const [file, setFile] = useState<{
    name: string;
    candidates: Candidate[];
  } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Extension
  const [connected, setConnected] = useState(false);

  const [picked, setPicked] = useState<Set<string>>(new Set());

  const findCollection = () => {
    const url = parseUrl(collectionUrl);
    const source = url
      ? sources.find(
          (s) => url.hostname === s.host || url.hostname.endsWith(`.${s.host}`),
        )
      : undefined;
    setCollection(null);
    setPicked(new Set());
    if (!url || !source) {
      setCollectionError(
        "That doesn't look like a Pinterest, Are.na, Dribbble or Behance link.",
      );
      return;
    }
    if (url.pathname.replace(/\//g, "") === "") {
      setCollectionError(
        `Paste the link to a specific ${source.label} board or collection, not the home page.`,
      );
      return;
    }
    setCollectionError(null);
    setFinding(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const base = url.href.replace(/[#?].*$/, "");
      const candidates = collectionSamples(base).map((s, i) => ({
        key: `${base}#${i}`,
        title: s.title,
        domain: source.host,
        imageUrl: s.imageUrl,
      }));
      setCollection({ label: source.label, candidates });
      setPicked(
        new Set(
          candidates.filter((c) => !imported.has(c.key)).map((c) => c.key),
        ),
      );
      setFinding(false);
    }, 600);
  };

  const readFile = async (list: FileList | File[] | null) => {
    const f = list?.[0];
    if (!f) return;
    setPicked(new Set());
    setFile(null);
    if (f.size > 5 * 1024 * 1024) {
      setFileError("That file is over 5 MB. Try a smaller export.");
      return;
    }
    const candidates = linksFromText(await f.text());
    if (candidates.length === 0) {
      setFileError(
        `No links found in ${f.name}. Use a bookmarks export (.html), a .csv or a .txt with one link per line.`,
      );
      return;
    }
    setFileError(null);
    setFile({ name: f.name, candidates });
    setPicked(
      new Set(candidates.filter((c) => !imported.has(c.key)).map((c) => c.key)),
    );
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    void readFile(e.dataTransfer.files);
  };

  const switchTab = (next: Tab) => {
    setTab(next);
    // Each tab keeps its own previewed list; the ticks follow whichever is showing.
    const list =
      next === "collection"
        ? collection?.candidates
        : next === "file"
          ? file?.candidates
          : undefined;
    setPicked(
      new Set(
        (list ?? []).filter((c) => !imported.has(c.key)).map((c) => c.key),
      ),
    );
  };

  const candidates =
    tab === "collection"
      ? (collection?.candidates ?? [])
      : tab === "file"
        ? (file?.candidates ?? [])
        : [];
  const selectable = candidates.filter((c) => !imported.has(c.key));
  const count = candidates.filter((c) => picked.has(c.key)).length;
  const allPicked = selectable.length > 0 && count === selectable.length;

  const toggle = (key: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (!next.delete(key)) next.add(key);
      return next;
    });

  const submit = () => {
    const chosen = candidates.filter((c) => picked.has(c.key));
    if (chosen.length === 0) return;
    const stamp = Date.now();
    const items: UnsortedItem[] = chosen.map((c, i) => ({
      id: `import-${stamp}-${i}`,
      title: c.title,
      domain: c.domain,
      imageUrl: c.imageUrl,
      boardId: board.id,
      essential: false,
      tags: [],
    }));
    chosen.forEach((c) => imported.add(c.key));
    if (destination === "board") unsortedActions.addToBoard(items, board.id);
    else unsortedActions.add(items);
    onClose();
    navigate(destination === "board" ? `/boards/${board.id}` : "/unsorted");
  };

  const tabs: [Tab, string][] = [
    ["collection", "Collection"],
    ["file", "File"],
    ["extension", "Extension"],
  ];

  return (
    <Modal
      title="Import links"
      description="Bring in links from a collection, a file or the browser extension."
      width="w-[560px]"
      onClose={onClose}
    >
      <div
        role="group"
        aria-label="Where to import from"
        className="flex gap-2"
      >
        {tabs.map(([id, label]) => (
          <Chip
            key={id}
            tone="tint"
            selected={tab === id}
            aria-pressed={tab === id}
            onClick={() => switchTab(id)}
            className="h-9 px-4 text-[13px] leading-none"
          >
            {label}
          </Chip>
        ))}
      </div>

      <div className="flex max-h-[52vh] flex-col gap-5 overflow-y-auto pr-1">
        {tab === "collection" && (
          <>
            <div className="flex flex-col gap-2.5">
              <label htmlFor="import-collection-url" className={captionClass}>
                Collection link
              </label>
              <div className="flex gap-2">
                <input
                  id="import-collection-url"
                  value={collectionUrl}
                  autoFocus
                  onChange={(e) => {
                    setCollectionUrl(e.target.value);
                    setCollectionError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      findCollection();
                    }
                  }}
                  placeholder="https://www.pinterest.com/you/moodboard/"
                  aria-invalid={collectionError ? true : undefined}
                  className={fieldClass}
                />
                <Button
                  variant="secondary"
                  type="button"
                  onClick={findCollection}
                  disabled={finding || collectionUrl.trim() === ""}
                  className="h-[46px] shrink-0 px-5 text-[14px] leading-none"
                >
                  {finding ? "Finding…" : "Find references"}
                </Button>
              </div>
              <p className="text-[12px] leading-none text-text-secondary">
                Works with Pinterest boards, Are.na channels, Dribbble
                collections and Behance moodboards.
              </p>
              {collectionError && (
                <p
                  role="alert"
                  className="text-[13px] leading-snug text-accent"
                >
                  {collectionError}
                </p>
              )}
            </div>

            {collection && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <p className={captionClass}>
                    Found {collection.candidates.length} references
                    <span className="font-normal text-text-secondary">
                      {" "}
                      from {collection.label}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setPicked(
                        allPicked
                          ? new Set()
                          : new Set(selectable.map((c) => c.key)),
                      )
                    }
                    className="text-[13px] leading-none text-ink underline underline-offset-[3px] hover:text-accent"
                  >
                    {allPicked ? "Select none" : "Select all"}
                  </button>
                </div>
                <CandidateList
                  layout="grid"
                  candidates={collection.candidates}
                  selected={picked}
                  onToggle={toggle}
                />
              </div>
            )}
          </>
        )}

        {tab === "file" && (
          <>
            <div className="flex flex-col gap-2.5">
              <p className={captionClass}>Links file</p>
              <input
                ref={fileRef}
                type="file"
                accept=".html,.htm,.csv,.txt,.md,.json,text/*"
                hidden
                onChange={(e) => {
                  void readFile(e.target.files);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`flex h-[104px] w-full flex-col items-center justify-center gap-1.5 rounded-[16px] border border-dashed text-center transition-colors ${
                  dragging
                    ? "border-accent bg-accent-tint"
                    : "border-border bg-surface hover:bg-surface-soft"
                }`}
              >
                <span className="text-[15px] font-medium leading-none text-ink">
                  {file ? file.name : "Drop a file here"}
                </span>
                <span className="text-[13px] leading-none text-text-secondary">
                  {file
                    ? "Click to choose a different file"
                    : "Bookmarks export (.html), .csv or .txt, up to 5 MB"}
                </span>
              </button>
              {fileError && (
                <p
                  role="alert"
                  className="text-[13px] leading-snug text-accent"
                >
                  {fileError}
                </p>
              )}
            </div>

            {file && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <p className={captionClass}>
                    Found {file.candidates.length}{" "}
                    {file.candidates.length === 1 ? "link" : "links"}
                    {file.candidates.length >= MAX_FILE_LINKS && (
                      <span className="font-normal text-text-secondary">
                        {" "}
                        (first {MAX_FILE_LINKS})
                      </span>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setPicked(
                        allPicked
                          ? new Set()
                          : new Set(selectable.map((c) => c.key)),
                      )
                    }
                    className="text-[13px] leading-none text-ink underline underline-offset-[3px] hover:text-accent"
                  >
                    {allPicked ? "Select none" : "Select all"}
                  </button>
                </div>
                <CandidateList
                  layout="list"
                  candidates={file.candidates}
                  selected={picked}
                  onToggle={toggle}
                />
              </div>
            )}
          </>
        )}

        {tab === "extension" && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2.5">
              <p className={captionClass}>Save from anywhere as you browse</p>
              <ul className="flex flex-col gap-2.5 text-[14px] leading-snug text-text-secondary">
                {[
                  "Add the my.Nook extension to your browser.",
                  "Sign in with your my.Nook account to connect it.",
                  `Click the extension on any page and it lands in ${board.title}.`,
                ].map((line) => (
                  <li key={line} className="flex gap-2.5">
                    <span
                      aria-hidden="true"
                      className="mt-[7px] size-[6px] shrink-0 rounded-full bg-accent"
                    />
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-[14px] border border-[#e6e6e6] bg-surface px-4 py-3.5">
              <span className="flex items-center gap-2.5 text-[14px] leading-none text-ink">
                <span
                  className={`size-2 rounded-full ${connected ? "bg-[#1fb15a]" : "bg-border"}`}
                />
                {connected ? "Extension connected" : "Not connected yet"}
              </span>
              <Button
                variant={connected ? "secondary" : "primary"}
                type="button"
                onClick={() => setConnected((v) => !v)}
                className="h-9 px-5 !text-[13px] leading-none"
              >
                {connected ? "Disconnect" : "Connect extension"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {tab !== "extension" && (
        <div className="flex flex-col gap-3">
          <p className={captionClass}>Add to</p>
          <div
            role="group"
            aria-label="Where to add"
            className="flex flex-wrap gap-2"
          >
            {(
              [
                ["board", board.title],
                ["unsorted", "Unsorted"],
              ] as const
            ).map(([id, label]) => (
              <Chip
                key={id}
                tone="tint"
                selected={destination === id}
                aria-pressed={destination === id}
                onClick={() => setDestination(id)}
                className="h-9 max-w-[220px] truncate px-4 text-[13px] leading-none"
              >
                {label}
              </Chip>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        {tab === "extension" ? (
          <Button
            variant="secondary"
            type="button"
            onClick={onClose}
            className="h-10 px-6 text-[14px] leading-none"
          >
            Done
          </Button>
        ) : (
          <>
            <Button
              variant="secondary"
              type="button"
              onClick={onClose}
              className="h-10 px-6 text-[14px] leading-none"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="button"
              onClick={submit}
              disabled={count === 0}
              className="h-10 px-6 !text-[14px] leading-none"
            >
              {count > 0
                ? `Add ${count} ${count === 1 ? "reference" : "references"}`
                : "Add references"}
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}
