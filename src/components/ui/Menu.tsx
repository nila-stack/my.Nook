import { useEffect, useRef, useState, type ReactNode } from "react";
import chevronDown from "../../assets/icons/chevron-down.svg";

export const toolbarButton =
  "flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-4 text-[13px] leading-none text-ink transition-colors hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface";

/** Button + floating panel (same look as the Home toolbar menus); closes on outside click, Esc or a pick. */
export function Menu({
  label,
  disabled,
  align = "left",
  className = toolbarButton,
  children,
}: {
  label: ReactNode;
  disabled?: boolean;
  align?: "left" | "right";
  className?: string;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // A disabled menu is never shown open, even if it was open when it became disabled.
  const isOpen = open && !disabled;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={className}
      >
        {label}
        <img src={chevronDown} alt="" className={`w-[9px] transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div
          className={`absolute top-full z-30 mt-2 max-h-[320px] w-[210px] overflow-y-auto rounded-[8px] border border-border bg-surface py-2 shadow-[0px_8px_24px_0px_rgba(0,0,0,0.1)] ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function MenuOption({ onClick, selected, children }: { onClick: () => void; selected?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[36px] w-full items-center px-[14px] text-left text-[14px] leading-none hover:bg-surface-soft ${
        selected ? "text-ink" : "text-text-secondary hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
