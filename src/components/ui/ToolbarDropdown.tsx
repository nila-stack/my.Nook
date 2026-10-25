import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "./Button";

/** Toolbar button + floating panel; closes on outside click, Esc, or when a child calls `close`. */
export function ToolbarDropdown({
  icon,
  iconClass,
  label,
  panelClassName = "w-[196px]",
  children,
}: {
  icon: string;
  iconClass: string;
  label: ReactNode;
  /** Width classes for the floating panel. */
  panelClassName?: string;
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

  return (
    <div ref={ref} className="relative">
      <Button
        variant="secondary"
        className="h-10 gap-1.5 leading-none"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <img src={icon} alt="" className={iconClass} />
        {label}
      </Button>
      {open && (
        <div className={`absolute left-0 top-full z-20 mt-2 ${panelClassName} rounded-[8px] border border-border bg-surface py-[10px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.1)]`}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}
