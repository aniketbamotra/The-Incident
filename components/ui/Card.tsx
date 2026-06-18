import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  tint?: "none" | "green" | "red" | "amber" | "purple";
  inset?: boolean;
}

const TINTS: Record<NonNullable<Props["tint"]>, string> = {
  none: "bg-surface",
  green: "bg-green/[0.06] border-green/20",
  red: "bg-red/[0.06] border-red/20",
  amber: "bg-amber/[0.06] border-amber/20",
  purple: "bg-purple/[0.06] border-purple/20",
};

export function Card({
  tint = "none",
  inset,
  className,
  children,
  ...props
}: Props) {
  return (
    <div
      className={cn(
        "rounded-[12px] border-[0.5px] border-line",
        TINTS[tint],
        inset ? "p-4" : "p-5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
      {children}
    </p>
  );
}
