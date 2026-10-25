import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import navSettings from "../../assets/icons/nav-settings.svg";

// Single source for the storage meter: drives both the bar width and the hover details.
const STORAGE_TOTAL_GB = 10;
const STORAGE_USED_GB = 3.4;
const STORAGE_PCT = Math.round((STORAGE_USED_GB / STORAGE_TOTAL_GB) * 100);
const STORAGE_FREE_GB = +(STORAGE_TOTAL_GB - STORAGE_USED_GB).toFixed(1);

/**
 * Bottom block shared by every left sidebar: divider, Settings, storage meter and the profile.
 * Rendered as siblings (a fragment) so the parent sidebar's flex gap spaces them; the spacer pins the profile
 * to the bottom whenever the sidebar has spare height.
 */
export function SidebarFooter({
  showSettings = true,
  showStorage = true,
  pinToBottom = true,
  heading,
  children,
}: {
  showSettings?: boolean;
  /** Show the storage meter (off in Settings, where Storage is a list item instead). */
  showStorage?: boolean;
  /** Optional caption for the cluster above the Settings row (e.g. "ACCOUNT"). */
  heading?: string;
  /** Extra rows shown above Settings in the same cluster. */
  children?: ReactNode;
  /** Push the profile to the bottom of the sidebar; off for short sidebars (Settings) so it follows Storage closely. */
  pinToBottom?: boolean;
}) {
  return (
    <>
      <hr className="w-[250px] border-border" />

      {showSettings && (
        <nav className="flex flex-col gap-1">
          {heading && (
            <p className="px-3 text-[12px] font-medium leading-none text-text-muted">
              {heading}
            </p>
          )}
          {children}
          <NavLink to="/settings" end className="block w-[240px]">
            {({ isActive }) => (
              <span
                className={`flex w-[240px] items-center gap-[15px] rounded-[32px] px-3 py-2 text-[14px] leading-none text-ink ${
                  isActive
                    ? "bg-accent-tint font-semibold"
                    : "font-normal hover:bg-surface-soft"
                }`}
              >
                <img
                  src={navSettings}
                  alt=""
                  className="size-[19px] shrink-0"
                />
                Settings
              </span>
            )}
          </NavLink>
        </nav>
      )}

      {showStorage && (
        <>
          {/* Hovering (or focusing) the meter reveals the details; the whole block is the hover target, not just the thin bar. */}
          <div
            className="group relative flex w-[240px] flex-col gap-1 px-3 outline-none"
            tabIndex={0}
            aria-label={`Storage: ${STORAGE_USED_GB} GB of ${STORAGE_TOTAL_GB} GB used`}
          >
            <p className="text-[12px] leading-none text-ink">Storage</p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-soft">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${STORAGE_PCT}%` }}
              />
            </div>

            <div
              role="tooltip"
              className="pointer-events-none absolute bottom-full left-3 z-50 mb-2 flex w-[216px] translate-y-1 flex-col gap-2 rounded-[12px] bg-surface p-3 opacity-0 shadow-card transition-[opacity,transform] duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
            >
              <div className="flex items-baseline justify-between text-[12px] leading-none">
                <span className="font-medium text-ink">
                  {STORAGE_USED_GB} GB used
                </span>
                <span className="text-text-secondary">
                  of {STORAGE_TOTAL_GB} GB
                </span>
              </div>
              <div className="flex items-baseline justify-between text-[12px] leading-none text-text-secondary">
                <span>{STORAGE_PCT}% full</span>
                <span>{STORAGE_FREE_GB} GB free</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Always present (so the gap matches the other sidebars); only grows when the profile is pinned. */}
      <div className={pinToBottom ? "flex-1" : "h-0"} />

      <div className="-mt-[17px] mb-[17px] flex items-center gap-2.5 px-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-tint">
          <span className="text-[14px] leading-none text-accent">R</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-[14px] font-medium leading-none text-ink-soft">
            Remi
          </p>
          <p className="text-[12px] leading-none text-text-secondary">
            Pro Plan
          </p>
        </div>
      </div>
    </>
  );
}
