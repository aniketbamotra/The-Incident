"use client";

export function GatheringBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="flex items-center gap-3 border-b-[0.5px] border-amber/30 bg-amber/[0.08] px-5 py-3">
      <span className="h-2 w-2 shrink-0 animate-pulse-soft rounded-full bg-amber" />
      <p className="flex-1 text-sm text-amber">
        The group is gathering. Go to the main room.
      </p>
      <button
        onClick={onDismiss}
        className="text-[11px] text-amber/70 hover:text-amber"
      >
        I&apos;m there
      </button>
    </div>
  );
}
