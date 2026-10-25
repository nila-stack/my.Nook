import type { ButtonHTMLAttributes } from "react";

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  /** "ink" matches the Design System's documented selected state (mood/tag chips).
   *  "tint" matches the lighter accent highlight actually used for Home's category filters. */
  tone?: "ink" | "tint";
};

export function Chip({
  selected = false,
  tone = "ink",
  className = "",
  ...props
}: ChipProps) {
  const selectedStyle =
    tone === "tint" ? "bg-accent-tint text-ink border-border" : "bg-ink text-white border-ink";
  const state = selected
    ? selectedStyle
    : "bg-surface text-ink border-border hover:bg-surface-soft";

  return (
    <button
      type="button"
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors duration-150 ${state} ${className}`}
      {...props}
    />
  );
}
