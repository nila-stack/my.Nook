import { initials } from "../../data/people";

/** Initials in a light-orange circle, like the profile avatar in the sidebar. */
export function Avatar({ name, size = 36, className = "" }: { name: string; size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      className={`flex shrink-0 items-center justify-center rounded-full bg-accent-tint font-medium leading-none text-accent ${className}`}
    >
      {initials(name)}
    </span>
  );
}
