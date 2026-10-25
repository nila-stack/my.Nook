import { useRef, useState, type DragEvent, type FormEvent } from "react";
import { linkTile, parseUrl, titleFromUrl } from "../../lib/links";
import { unsortedActions, type UnsortedItem } from "../../data/unsorted";
import type { Board } from "../../data/boards";
import { Button, Chip } from "../ui";
import { Modal } from "./CreateDialogs";

type Mode = "links" | "files";

type Picked = { id: string; name: string; url: string };

/**
 * "Add reference" for a board: paste links or upload images, and they're filed straight into that board
 * (no stop in Unsorted). `onAdded` lets the page confirm how many came in.
 */
export function AddReferenceDialog({
  board,
  suggestedTags = [],
  onClose,
  onAdded,
}: {
  board: Board;
  /** The board's existing tags, offered as one-tap choices. */
  suggestedTags?: string[];
  onClose: () => void;
  onAdded: (count: number) => void;
}) {
  const [mode, setMode] = useState<Mode>("links");
  const [text, setText] = useState("");
  const [files, setFiles] = useState<Picked[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const take = (list: FileList | File[] | null) => {
    const images = [...(list ?? [])].filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) {
      setError("Only image files can be added for now.");
      return;
    }
    setError(null);
    setFiles((prev) => [
      ...prev,
      ...images.map((f, i) => ({
        id: `${Date.now()}-${prev.length + i}`,
        name: f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
        url: URL.createObjectURL(f),
      })),
    ]);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    take(e.dataTransfer.files);
  };

  const addTag = () => {
    const tag = tagInput.trim().replace(/\s+/g, " ").slice(0, 24);
    if (!tag) return;
    const existing = [...suggestedTags, ...tags].find(
      (t) => t.toLowerCase() === tag.toLowerCase(),
    );
    const final = existing ?? tag;
    setTags((prev) => (prev.includes(final) ? prev : [...prev, final]));
    setTagInput("");
  };

  const toggleTag = (tag: string) =>
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const stamp = Date.now();
    let items: UnsortedItem[] = [];

    if (mode === "links") {
      const lines = text
        .split(/\n|,|\s{2,}/)
        .map((l) => l.trim())
        .filter(Boolean);
      const urls = lines.map(parseUrl);
      if (lines.length === 0 || urls.some((u) => u === null)) {
        setError(
          lines.length === 0
            ? "Paste at least one link."
            : "One of those doesn't look like a link.",
        );
        textRef.current?.focus();
        return;
      }
      items = (urls as URL[]).map((u, i) => {
        const host = u.hostname.replace(/^www\./, "");
        return {
          id: `ref-${stamp}-${i}`,
          title: titleFromUrl(u),
          domain: host,
          imageUrl: linkTile(host),
          boardId: board.id,
          essential: false,
          tags,
        };
      });
    } else {
      if (files.length === 0) {
        setError("Choose at least one image.");
        return;
      }
      items = files.map((f) => ({
        id: `ref-${stamp}-${f.id}`,
        title: f.name,
        domain: "From this device",
        imageUrl: f.url,
        boardId: board.id,
        essential: false,
        tags,
      }));
    }

    unsortedActions.addToBoard(items, board.id);
    onAdded(items.length);
    onClose();
  };

  const count =
    mode === "links"
      ? text.split(/\n|,|\s{2,}/).filter((l) => l.trim()).length
      : files.length;

  return (
    <Modal
      title="Add reference"
      description={`Add links or images straight into ${board.title}.`}
      onClose={onClose}
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-6">
        <div role="group" aria-label="How to add" className="flex gap-2">
          {(
            [
              ["links", "Paste links"],
              ["files", "Upload files"],
            ] as const
          ).map(([id, label]) => (
            <Chip
              key={id}
              tone="tint"
              selected={mode === id}
              aria-pressed={mode === id}
              onClick={() => {
                setMode(id);
                setError(null);
              }}
              className="h-9 px-4 text-[13px] leading-none"
            >
              {label}
            </Chip>
          ))}
        </div>

        {mode === "links" ? (
          <div className="flex flex-col gap-2.5">
            <label
              htmlFor="add-ref-links"
              className="text-[15px] font-semibold leading-none text-ink"
            >
              Links
            </label>
            <textarea
              id="add-ref-links"
              ref={textRef}
              autoFocus
              rows={4}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setError(null);
              }}
              placeholder={
                "https://www.behance.net/gallery/…\nhttps://dribbble.com/shots/…"
              }
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "add-ref-error" : undefined}
              className="w-full resize-none rounded-[12px] border border-border bg-surface px-4 py-3 text-[14px] leading-[1.5] text-ink outline-none transition-colors focus:border-accent"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                take(e.target.files);
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
              className={`flex h-[120px] w-full flex-col items-center justify-center gap-1.5 rounded-[16px] border border-dashed text-center transition-colors ${
                dragging
                  ? "border-accent bg-accent-tint"
                  : "border-border bg-surface hover:bg-surface-soft"
              }`}
            >
              <span className="text-[15px] font-medium leading-none text-ink">
                Drop images here
              </span>
              <span className="text-[13px] leading-none text-text-secondary">
                or click to choose from your computer
              </span>
            </button>
            {files.length > 0 && (
              <ul className="flex flex-wrap gap-2" aria-label="Chosen images">
                {files.map((f) => (
                  <li
                    key={f.id}
                    className="group relative size-[64px] overflow-hidden rounded-[10px] bg-placeholder"
                  >
                    <img
                      src={f.url}
                      alt={f.name}
                      className="size-full object-cover"
                    />
                    <button
                      type="button"
                      aria-label={`Remove ${f.name}`}
                      onClick={() =>
                        setFiles((prev) => prev.filter((x) => x.id !== f.id))
                      }
                      className="absolute right-1 top-1 flex size-[18px] items-center justify-center rounded-full bg-black/60 text-[12px] leading-none text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <p className="text-[15px] font-semibold leading-none text-ink">
            Tags{" "}
            <span className="font-normal text-text-secondary">(optional)</span>
          </p>
          {suggestedTags.length > 0 && (
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Board tags"
            >
              {suggestedTags.map((t) => (
                <Chip
                  key={t}
                  tone="tint"
                  selected={tags.includes(t)}
                  aria-pressed={tags.includes(t)}
                  onClick={() => toggleTag(t)}
                  className="h-8 px-3.5 text-[13px] leading-none"
                >
                  {t}
                </Chip>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              maxLength={24}
              placeholder="Add your own tag"
              aria-label="New tag"
              className="h-10 min-w-0 flex-1 rounded-full border border-border bg-surface px-4 text-[14px] text-ink outline-none transition-colors focus:border-accent"
            />
            <button
              type="button"
              onClick={addTag}
              disabled={tagInput.trim() === ""}
              className="h-10 rounded-full border border-border bg-surface px-5 text-[13px] leading-none text-ink transition-colors hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add tag
            </button>
          </div>
          {tags.some((t) => !suggestedTags.includes(t)) && (
            <div className="flex flex-wrap gap-2" aria-label="Your new tags">
              {tags
                .filter((t) => !suggestedTags.includes(t))
                .map((t) => (
                  <Chip
                    key={t}
                    tone="tint"
                    selected
                    aria-label={`Remove tag ${t}`}
                    onClick={() => toggleTag(t)}
                    className="h-8 gap-1.5 px-3.5 text-[13px] leading-none"
                  >
                    {t} <span aria-hidden="true">×</span>
                  </Chip>
                ))}
            </div>
          )}
        </div>

        {error && (
          <p
            id="add-ref-error"
            role="alert"
            className="-mt-3 text-[13px] leading-none text-accent"
          >
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
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
            type="submit"
            className="h-10 px-6 !text-[14px] leading-none"
          >
            {count > 0
              ? `Add ${count} ${count === 1 ? "reference" : "references"}`
              : "Add reference"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
