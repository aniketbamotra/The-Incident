"use client";

import type { Player, Vote } from "@/lib/supabase/types";

export function VoteResults({
  players,
  votes,
}: {
  players: Player[];
  votes: Vote[];
}) {
  const counts = new Map<string, number>();
  votes.forEach((v) => {
    if (v.suspect_id)
      counts.set(v.suspect_id, (counts.get(v.suspect_id) ?? 0) + 1);
  });

  const rows = players
    .filter((p) => counts.has(p.id))
    .map((p) => ({ player: p, count: counts.get(p.id) ?? 0 }))
    .sort((a, b) => b.count - a.count);

  const max = Math.max(1, ...rows.map((r) => r.count));

  if (votes.length === 0) {
    return (
      <p className="text-sm text-ink-muted">No votes cast this phase yet.</p>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map(({ player, count }) => (
        <div key={player.id}>
          <div className="mb-1 flex items-center justify-between text-[13px]">
            <span className="text-ink-secondary">
              {player.character_name || player.name}
            </span>
            <span className="tabular-nums text-ink">{count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-red transition-[width] duration-500"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
      <p className="pt-1 text-[11px] text-ink-muted">
        {votes.length} vote{votes.length === 1 ? "" : "s"} · anonymous until
        finale
      </p>
    </div>
  );
}
