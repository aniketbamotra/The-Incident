"use client";

import { cn } from "@/lib/utils";

export type PlayTab = "you" | "events" | "trust" | "intel" | "tips";

const TABS: { id: PlayTab; label: string }[] = [
  { id: "you", label: "You" },
  { id: "events", label: "Events" },
  { id: "trust", label: "Trust" },
  { id: "intel", label: "Intel" },
  { id: "tips", label: "Tips" },
];

export function TabBar({
  active,
  onChange,
  intelBadge,
}: {
  active: PlayTab;
  onChange: (t: PlayTab) => void;
  intelBadge?: number;
}) {
  return (
    <nav className="sticky bottom-0 z-20 grid grid-cols-5 border-t-[0.5px] border-line bg-bg/95 backdrop-blur">
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "relative flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors",
            active === t.id ? "text-ink" : "text-ink-muted"
          )}
        >
          {t.label}
          {t.id === "intel" && intelBadge ? (
            <span className="absolute right-[28%] top-2 h-1.5 w-1.5 rounded-full bg-amber" />
          ) : null}
          {active === t.id && (
            <span className="absolute inset-x-6 top-0 h-px bg-ink" />
          )}
        </button>
      ))}
    </nav>
  );
}
