import type { HTMLAttributes } from "react";

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

/** Generic loading placeholder — compose it into skeleton states for boards, lists, etc. */
export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-xs bg-surface-soft ${className}`}
      {...props}
    />
  );
}
