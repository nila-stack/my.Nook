import { useEffect, useRef, type InputHTMLAttributes } from "react";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Shows a dash instead of a tick — used by "select all" when only some items are selected. */
  indeterminate?: boolean;
};

export function Checkbox({ className = "", indeterminate = false, ...props }: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      className={`nook-checkbox size-[18px] shrink-0 cursor-pointer appearance-none rounded-xs border border-border bg-surface checked:border-ink checked:bg-ink disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
