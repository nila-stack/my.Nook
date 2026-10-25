import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  "aria-label": string;
};

export function IconButton({ icon, className = "", ...props }: IconButtonProps) {
  return (
    <button
      className={`inline-flex size-10 items-center justify-center rounded-full border border-border bg-surface text-ink transition-colors duration-150 hover:bg-surface-soft ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
}
