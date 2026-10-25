import starFilled from "../../assets/icons/star-filled.svg";
import starOutline from "../../assets/icons/star-outline.svg";
import menuIcon from "../../assets/icons/reference-card-menu.svg";
import commentIcon from "../../assets/icons/nav-comment.svg";
import commentOutline from "../../assets/icons/comment-outline.svg";
import { Checkbox } from "./Checkbox";
import type { Reference } from "../../data/references";

export function ReferenceCard({
  reference,
  essential,
  selected,
  selecting,
  onToggleEssential,
  onToggleSelect,
  commentCount = 0,
  onComment,
}: {
  reference: Reference;
  /** Marked essential — shown as a filled star; these are the references an AI handoff prioritises. */
  essential: boolean;
  selected: boolean;
  /** True while at least one reference on the board is selected, so every checkbox stays visible. */
  selecting: boolean;
  onToggleEssential: () => void;
  onToggleSelect: () => void;
  /** Comments on this reference; a small bubble shows when there are any. */
  commentCount?: number;
  onComment?: () => void;
}) {
  return (
    <div
      className={`group w-full overflow-hidden rounded-[20px] bg-surface shadow-card transition-shadow ${
        selected ? "ring-2 ring-accent" : ""
      }`}
    >
      <div
        className="relative h-[200px] w-full bg-placeholder bg-cover bg-center"
        style={{ backgroundImage: `url(${reference.imageUrl})` }}
      >
        <Checkbox
          aria-label={`Select ${reference.domain} reference`}
          checked={selected}
          onChange={onToggleSelect}
          className={`absolute left-3 top-3 size-[20px] shadow-sm transition-opacity focus-visible:opacity-100 ${
            selected || selecting
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
          }`}
        />
        <button
          type="button"
          aria-label={essential ? "Remove from essential" : "Mark essential"}
          aria-pressed={essential}
          onClick={onToggleEssential}
          className="absolute right-3 top-3 size-[18px]"
        >
          <img
            src={essential ? starFilled : starOutline}
            alt=""
            className="size-full"
          />
        </button>
      </div>
      <div className="flex items-center justify-between px-3.5 py-3">
        <p className="text-[12px] text-text-secondary">{reference.domain}</p>
        <div className="flex items-center gap-1">
          {onComment && (
            <button
              type="button"
              aria-label={
                commentCount > 0
                  ? `${commentCount} ${commentCount === 1 ? "comment" : "comments"}, open`
                  : "Add a comment"
              }
              onClick={onComment}
              className="p-1 transition-opacity hover:opacity-70"
            >
              <img
                src={commentCount > 0 ? commentIcon : commentOutline}
                alt=""
                className="size-[14px]"
              />
            </button>
          )}
          <button type="button" aria-label="More options" className="p-1">
            <img src={menuIcon} alt="" className="h-[4px] w-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
