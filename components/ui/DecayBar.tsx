import { cn } from "@/lib/utils";

// Memory-strength bar. Colour shifts as the memory fades.
export function DecayBar({ strength }: { strength: number }) {
  const pct = Math.max(0, Math.min(100, strength));
  const color =
    pct >= 70 ? "var(--green)" : pct >= 40 ? "var(--amber)" : "var(--red)";

  return (
    <div className="flex items-center gap-2">
      <div className="h-[2px] flex-1 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className={cn("h-full rounded-full transition-[width] duration-1000")}
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-8 text-right text-[10px] tabular-nums text-ink-muted">
        {Math.round(pct)}%
      </span>
    </div>
  );
}
