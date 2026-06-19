"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export type PlayTab = "you" | "events" | "trust" | "intel" | "tips";

function YouIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="7" r="3" />
      <path d="M3.5 17c0-3.314 2.91-6 6.5-6s6.5 2.686 6.5 6" />
    </svg>
  );
}

function EventsIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="16" y2="6" />
      <line x1="4" y1="10" x2="16" y2="10" />
      <line x1="4" y1="14" x2="11" y2="14" />
    </svg>
  );
}

function TrustIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 16.5S3 12.5 3 7.5A4 4 0 0 1 10 5a4 4 0 0 1 7 2.5c0 5-7 9-7 9z" />
    </svg>
  );
}

function IntelIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="7" />
      <line x1="10" y1="9" x2="10" y2="14" />
      <circle cx="10" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TipsIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 10c0 3.866-3.134 7-7 7a6.97 6.97 0 0 1-3.5-.937L3 17l.937-3.5A6.97 6.97 0 0 1 3 10c0-3.866 3.134-7 7-7s7 3.134 7 7z" />
    </svg>
  );
}

const TABS: { id: PlayTab; label: string; Icon: React.FC<{ active: boolean }> }[] = [
  { id: "you",    label: "You",    Icon: YouIcon },
  { id: "events", label: "Events", Icon: EventsIcon },
  { id: "trust",  label: "Trust",  Icon: TrustIcon },
  { id: "intel",  label: "Intel",  Icon: IntelIcon },
  { id: "tips",   label: "Tips",   Icon: TipsIcon },
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
    <nav
      className="fixed bottom-0 inset-x-0 z-20 grid grid-cols-5 border-t-[0.5px] border-line bg-bg/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map((t) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              "relative flex flex-col items-center justify-center gap-1 py-2.5 transition-colors",
              isActive ? "text-ink" : "text-ink-muted"
            )}
          >
            <t.Icon active={isActive} />
            <span className="text-[10px] font-medium">{t.label}</span>
            {t.id === "intel" && intelBadge ? (
              <span className="absolute right-[calc(50%-16px)] top-2 h-1.5 w-1.5 rounded-full bg-amber" />
            ) : null}
            {isActive && (
              <motion.span
                layoutId="tab-indicator"
                className="absolute inset-x-4 top-0 h-px bg-ink"
                transition={{ duration: 0.22, ease: "easeOut" }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
