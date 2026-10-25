import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

const base =
  "inline-flex items-center justify-center rounded-full px-3 py-2 transition-colors duration-150 disabled:cursor-not-allowed";

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-accent text-white text-[18px] font-medium hover:bg-accent-hover active:scale-[0.98] disabled:bg-[#e8e8e8] disabled:text-[#b3b3b3]",
  secondary:
    "bg-surface text-ink text-[14px] border border-border hover:bg-surface-soft disabled:text-text-muted disabled:bg-surface",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}
