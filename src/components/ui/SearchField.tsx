import type { InputHTMLAttributes } from "react";

type SearchFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  containerClassName?: string;
  /** "accent" (default) matches most search fields in the app; "neutral" matches
   *  the black/ink icon treatment used on the Home screen's search fields. */
  iconTone?: "accent" | "neutral";
};

export function SearchField({
  containerClassName = "",
  className = "",
  placeholder = "Search",
  iconTone = "accent",
  ...props
}: SearchFieldProps) {
  return (
    <div
      className={`flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-3 ${containerClassName}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className={`size-[17px] shrink-0 fill-none stroke-2 ${iconTone === "neutral" ? "stroke-ink" : "stroke-accent"}`}
      >
        <circle cx="9" cy="9" r="6" />
        <line x1="18" y1="18" x2="13.5" y2="13.5" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        placeholder={placeholder}
        className={`w-full bg-transparent text-[14px] text-ink placeholder:text-text-secondary focus:outline-none ${className}`}
        {...props}
      />
    </div>
  );
}
