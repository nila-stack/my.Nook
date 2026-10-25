import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { boardCategories, type BoardCategory } from "../../data/boards";
import {
  closeCreateDialog,
  createBoard,
  useCreateDialog,
  useCreatePayload,
} from "../../data/createdBoards";
import { unsortedActions, type UnsortedItem } from "../../data/unsorted";
import { Button, Chip } from "../ui";
import { linkTile, parseUrl, titleFromUrl } from "../../lib/links";

export function Modal({
  title,
  description,
  onClose,
  children,
  width = "w-[440px]",
  hideTitle = false,
}: {
  title: string;
  /** Optional line under the title. */
  description?: string;
  onClose: () => void;
  children: ReactNode;
  /** Tailwind width class for the dialog (default 440px). */
  width?: string;
  /** Keep the title for screen readers but don't show it. */
  hideTitle?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex ${width} max-w-full flex-col gap-6 rounded-[24px] bg-surface p-8 shadow-[0px_16px_48px_0px_rgba(0,0,0,0.18)]`}
      >
        <div className="flex flex-col gap-2">
          <h2
            className={
              hideTitle
                ? "sr-only"
                : "text-[22px] font-semibold leading-none text-ink"
            }
          >
            {title}
          </h2>
          {description && (
            <p className="text-[14px] leading-snug text-text-secondary">
              {description}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

const fieldClass =
  "h-[48px] w-full rounded-[12px] border border-border bg-surface px-4 text-[15px] text-ink outline-none transition-colors focus:border-accent";

function NewBoardForm() {
  const navigate = useNavigate();
  const moveIds = useCreatePayload()?.moveIds;
  const [name, setName] = useState("");
  const [cats, setCats] = useState<BoardCategory[]>([]);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const title = name.trim();
    if (!title) {
      setError("Give your board a name.");
      return;
    }
    const board = createBoard(title, cats);
    // Opened from Unsorted's "Move to board → Create New": file the selected items straight into the new board.
    if (moveIds && moveIds.length > 0)
      unsortedActions.moveTo(moveIds, board.id);
    closeCreateDialog();
    navigate(`/boards/${board.id}`);
  };

  return (
    <Modal
      title="New board"
      description={
        moveIds && moveIds.length > 0
          ? `Name it and ${moveIds.length === 1 ? "1 selected item moves" : `${moveIds.length} selected items move`} in right away.`
          : "Name it, pick where it belongs, and start collecting."
      }
      onClose={closeCreateDialog}
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-6">
        <div className="flex flex-col gap-2.5">
          <label
            htmlFor="new-board-name"
            className="text-[15px] font-semibold leading-none text-ink"
          >
            Board name
          </label>
          <input
            id="new-board-name"
            autoFocus
            maxLength={40}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            placeholder="e.g. Summer Campaign"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "new-board-error" : undefined}
            className={fieldClass}
          />
          {error && (
            <p
              id="new-board-error"
              role="alert"
              className="text-[13px] leading-none text-accent"
            >
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-[15px] font-semibold leading-none text-ink">
            Category{" "}
            <span className="font-normal text-text-secondary">(optional)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {boardCategories.map((c) => (
              <Chip
                key={c}
                tone="tint"
                selected={cats.includes(c)}
                aria-pressed={cats.includes(c)}
                onClick={() =>
                  setCats((prev) =>
                    prev.includes(c)
                      ? prev.filter((x) => x !== c)
                      : [...prev, c],
                  )
                }
                className="h-9 px-4 text-[13px] leading-none"
              >
                {c}
              </Chip>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            type="button"
            onClick={closeCreateDialog}
            className="h-10 px-6 text-[14px] leading-none"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="h-10 px-6 !text-[14px] leading-none"
          >
            Create board
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function AddLinkForm() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
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
      ref.current?.focus();
      return;
    }
    const stamp = Date.now();
    const items: UnsortedItem[] = (urls as URL[]).map((u, i) => {
      const host = u.hostname.replace(/^www\./, "");
      return {
        id: `link-${stamp}-${i}`,
        title: titleFromUrl(u),
        domain: host,
        imageUrl: linkTile(host),
        boardId: "moodboards",
        essential: false,
        tags: [],
      };
    });
    unsortedActions.add(items);
    closeCreateDialog();
    navigate("/unsorted");
  };

  return (
    <Modal
      title="Add link"
      description="Paste one or more links, one per line. They land in Unsorted until you file them."
      onClose={closeCreateDialog}
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-6">
        <div className="flex flex-col gap-2.5">
          <label
            htmlFor="add-link-urls"
            className="text-[15px] font-semibold leading-none text-ink"
          >
            Links
          </label>
          <textarea
            id="add-link-urls"
            ref={ref}
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
            aria-describedby={error ? "add-link-error" : undefined}
            className="w-full resize-none rounded-[12px] border border-border bg-surface px-4 py-3 text-[14px] leading-[1.5] text-ink outline-none transition-colors focus:border-accent"
          />
          {error && (
            <p
              id="add-link-error"
              role="alert"
              className="text-[13px] leading-none text-accent"
            >
              {error}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            type="button"
            onClick={closeCreateDialog}
            className="h-10 px-6 text-[14px] leading-none"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="h-10 px-6 !text-[14px] leading-none"
          >
            Add to Unsorted
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/** Mounted once in the app shell; renders whichever create dialog is open. */
export function CreateDialogs() {
  const open = useCreateDialog();
  if (open === "board") return <NewBoardForm />;
  if (open === "link") return <AddLinkForm />;
  return null;
}
