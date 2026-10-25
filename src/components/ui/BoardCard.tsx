import type { ButtonHTMLAttributes } from "react";

type BoardCardProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  title: string;
  meta: string;
  imageUrl?: string;
  selected?: boolean;
};

export function BoardCard({
  title,
  meta,
  imageUrl,
  selected = false,
  className = "",
  ...props
}: BoardCardProps) {
  return (
    <button
      type="button"
      className={`group relative flex w-full flex-col items-start gap-2 rounded-card bg-surface pb-[11px] text-left shadow-[0px_0px_18px_0px_rgba(187,187,187,0.25)] transition-transform duration-150 hover:-translate-y-0.5 ${
        selected ? "border-2 border-accent" : "border border-transparent"
      } ${className}`}
      {...props}
    >
      <div
        className="h-[173px] w-full shrink-0 rounded-t-card bg-placeholder bg-cover bg-center"
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
      />
      <div className="flex w-full flex-col gap-0.5 px-[18px] pr-9">
        <p className="truncate text-[15px] font-medium leading-tight text-ink">{title}</p>
        <p className="truncate text-[11px] leading-tight text-text-secondary">{meta}</p>
      </div>
      <div className="absolute bottom-[14px] right-4 flex items-center gap-[3px] opacity-60" aria-hidden="true">
        <span className="size-[3px] rounded-full bg-ink" />
        <span className="size-[3px] rounded-full bg-ink" />
        <span className="size-[3px] rounded-full bg-ink" />
      </div>
    </button>
  );
}
