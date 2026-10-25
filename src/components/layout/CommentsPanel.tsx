import { useEffect, useRef, useState } from "react";
import type { Board } from "../../data/boards";
import {
  commentActions,
  useBoardComments,
  useCommentsUi,
  type Comment,
} from "../../data/comments";
import { useHandoffReferences } from "../../data/essentials";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui";
import chatActions from "../../assets/icons/chat-actions.svg";

function CommentCard({
  comment,
  image,
  onResolve,
  onDelete,
}: {
  comment: Comment;
  image?: string;
  onResolve: () => void;
  onDelete: () => void;
}) {
  const [menu, setMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menu) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [menu]);

  return (
    <li
      className={`flex gap-4 rounded-[14px] border border-[#e6e6e6] bg-surface p-4 transition-opacity ${comment.resolved ? "opacity-60" : ""}`}
    >
      <div className="size-[88px] shrink-0 overflow-hidden rounded-[8px] bg-placeholder">
        {image && <img src={image} alt="" className="size-full object-cover" />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <Avatar name={comment.author} size={24} />
          <span className="min-w-0 flex-1 truncate text-[14px] leading-none text-ink">
            {comment.author}
          </span>
          <div ref={ref} className="relative">
            <button
              type="button"
              aria-label="More options"
              aria-expanded={menu}
              onClick={() => setMenu((v) => !v)}
              className="flex h-7 items-center rounded-full px-2 text-[16px] leading-none tracking-[1px] text-ink hover:bg-surface-soft"
            >
              •••
            </button>
            {menu && (
              <div className="absolute right-0 top-full z-10 mt-1 w-[130px] rounded-[8px] border border-border bg-surface py-1.5 shadow-[0px_8px_24px_0px_rgba(0,0,0,0.1)]">
                <button
                  type="button"
                  onClick={() => {
                    setMenu(false);
                    onDelete();
                  }}
                  className="flex h-9 w-full items-center px-3.5 text-left text-[14px] leading-none text-ink hover:bg-surface-soft"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            role="checkbox"
            aria-checked={comment.resolved}
            aria-label={comment.resolved ? "Mark as unresolved" : "Resolve"}
            onClick={onResolve}
            className={`flex size-[22px] shrink-0 items-center justify-center rounded-full border text-[12px] leading-none transition-colors ${
              comment.resolved
                ? "border-accent bg-accent text-white"
                : "border-ink text-ink hover:bg-surface-soft"
            }`}
          >
            ✓
          </button>
        </div>
        <p
          className={`text-[13px] leading-[1.5] text-text-secondary ${comment.resolved ? "line-through" : ""}`}
        >
          #{comment.n}: {comment.text}
        </p>
      </div>
    </li>
  );
}

/** Right-hand comments drawer for a board: every comment with its reference thumbnail, resolve and delete. */
export function CommentsPanel({ board }: { board: Board }) {
  const { open, target, scope } = useCommentsUi();
  const comments = useBoardComments(board.id);
  const { all } = useHandoffReferences(board.id);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") commentActions.close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open && target) inputRef.current?.focus();
  }, [open, target]);

  if (!open) return null;

  const targetRef = target ? all.find((r) => r.id === target) : undefined;
  const submit = () => {
    const text = draft.trim();
    if (!text || !targetRef) return;
    commentActions.add(board.id, targetRef.id, text);
    setDraft("");
  };

  return (
    <aside
      aria-label="Comments"
      className="fixed right-0 top-0 z-40 flex h-screen w-[404px] max-w-full flex-col gap-6 bg-surface pb-[55px] pl-[46px] pr-[44px] pt-[64px] shadow-[-6px_0px_33px_0px_rgba(0,0,0,0.12)]"
    >
      <header className="flex items-center justify-between">
        <h2 className="text-[20px] font-semibold leading-none text-ink">
          {scope === "all" ? "All Comments" : "Comments"}
        </h2>
        <button
          type="button"
          aria-label="Close comments"
          onClick={commentActions.close}
          className="flex size-8 items-center justify-center rounded-full hover:bg-surface-soft"
        >
          {/* Only the » half of the chat panel's action icon (the other half is the new-chat bubble). */}
          <span className="relative block h-[23px] w-[20px] overflow-hidden">
            <img
              src={chatActions}
              alt=""
              className="absolute right-0 top-0 h-[23px] w-[60.85px] max-w-none"
            />
          </span>
        </button>
      </header>

      {comments.length === 0 ? (
        <p className="text-[14px] leading-snug text-text-secondary">
          No comments yet. Click the comment icon on a reference to start one.
        </p>
      ) : (
        <ul className="-mr-2 flex flex-1 flex-col gap-4 overflow-y-auto pr-2">
          {comments.map((c) => (
            <CommentCard
              key={c.id}
              comment={c}
              image={all.find((r) => r.id === c.refId)?.imageUrl}
              onResolve={() => commentActions.toggleResolved(board.id, c.id)}
              onDelete={() => commentActions.remove(board.id, c.id)}
            />
          ))}
        </ul>
      )}

      {targetRef && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex flex-col gap-3 rounded-[14px] border border-[#e6e6e6] bg-surface p-4"
        >
          <div className="flex items-center gap-3">
            <img
              src={targetRef.imageUrl}
              alt=""
              className="size-10 rounded-[6px] object-cover"
            />
            <p className="min-w-0 flex-1 truncate text-[13px] leading-none text-text-secondary">
              Comment on this reference
            </p>
          </div>
          <textarea
            ref={inputRef}
            aria-label="Write a comment"
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Write a comment…"
            className="w-full resize-none rounded-[12px] border border-border bg-surface px-3.5 py-2.5 text-[14px] leading-[1.5] text-ink outline-none transition-colors placeholder:text-text-muted focus:border-accent"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => commentActions.open(null)}
              className="h-10 px-5 text-[13px] leading-none"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={draft.trim() === ""}
              className="h-10 px-5 !text-[13px] leading-none"
            >
              Comment
            </Button>
          </div>
        </form>
      )}
    </aside>
  );
}
