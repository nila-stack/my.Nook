import type { InputHTMLAttributes } from "react";

type ToggleProps = InputHTMLAttributes<HTMLInputElement>;

export function Toggle({ className = "", ...props }: ToggleProps) {
  return (
    <input
      type="checkbox"
      role="switch"
      className={`relative h-6 w-10 shrink-0 appearance-none rounded-full bg-border-soft transition-colors duration-150 before:absolute before:left-0.5 before:top-0.5 before:size-5 before:rounded-full before:bg-white before:shadow-sm before:transition-transform before:duration-150 checked:bg-accent checked:before:translate-x-4 ${className}`}
      {...props}
    />
  );
}
