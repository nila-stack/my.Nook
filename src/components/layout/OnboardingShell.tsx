import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import logoMark from "../../assets/icons/logo-mark.svg";

/** Shell for the pre-auth onboarding flow: just the wordmark, no sidebar. */
export function OnboardingShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-surface">
      {/* Brand lockup: the circle mark always comes before the wordmark. */}
      <Link to="/home" aria-label="my.Nook home" className="absolute left-[26px] top-6 z-10 flex items-center gap-2">
        <img src={logoMark} alt="" className="size-[33px]" />
        <p className="font-logo font-normal text-[27.5px] leading-none text-ink-soft">my.Nook</p>
      </Link>
      {children}
    </div>
  );
}
