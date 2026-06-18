"use client";

import { useState } from "react";
import type { PlayerScore } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

export function Leaderboard({ scores }: { scores: PlayerScore[] }) {
  // Reveal from the bottom up — drama. Start showing only the last place,
  // each click reveals one rank higher.
  const [revealed, setRevealed] = useState(1);
  const total = scores.length;
  const shownFromRank = Math.max(0, total - revealed);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-ink">Final standing</h2>
        {revealed < total && (
          <Button
            variant="purple"
            size="sm"
            onClick={() => setRevealed((r) => Math.min(total, r + 1))}
          >
            Reveal next
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {scores.map((s, i) => {
          const rank = i + 1;
          const visible = i >= shownFromRank;
          if (!visible) {
            return (
              <div
                key={s.player.id}
                className="h-[60px] rounded-[10px] border-[0.5px] border-line bg-surface/40"
              />
            );
          }
          return (
            <div
              key={s.player.id}
              className={cn(
                "flex items-center gap-3 rounded-[10px] border-[0.5px] px-4 py-3",
                rank === 1
                  ? "border-purple/40 bg-purple/[0.08]"
                  : "border-line bg-surface"
              )}
            >
              <span
                className={cn(
                  "w-7 text-center text-lg font-semibold tabular-nums",
                  rank === 1 ? "text-purple" : "text-ink-muted"
                )}
              >
                {rank}
              </span>
              <Avatar name={s.player.character_name || s.player.name} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                  {s.player.character_name || s.player.name}
                </p>
                <p className="truncate text-[11px] text-ink-muted">
                  {s.player.role ? `${s.player.role} · ` : ""}
                  {s.keyLine}
                </p>
              </div>
              <span className="text-lg font-semibold tabular-nums text-ink">
                {s.score}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
