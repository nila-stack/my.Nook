import { Link } from "react-router-dom";
import chevronDown from "../../assets/icons/chevron-down.svg";

/**
 * Back chevron that hangs in the left gutter beside a page heading (the heading itself stays aligned with the page
 * content). Put it inside a `relative` wrapper next to the <h1>; it centres on the wrapper's height.
 */
export function BackLink({ to, label = "Go back" }: { to: string; label?: string }) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="absolute -left-7 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full transition-opacity hover:opacity-60 focus-visible:opacity-60"
    >
      {/* The icon file is grey; brightness(0) renders it solid black. */}
      <img src={chevronDown} alt="" className="w-[16px] rotate-90 brightness-0" />
    </Link>
  );
}
