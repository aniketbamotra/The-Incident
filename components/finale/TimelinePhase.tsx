"use client";

import type { Player } from "@/lib/supabase/types";
import type { ClueWithAssignments } from "@/components/host/SetupClient";
import type { FinaleEvent } from "@/app/finale/[gameId]/page";
import { Card, CardLabel } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function TimelinePhase({
  clues,
  events,
  players,
}: {
  clues: ClueWithAssignments[];
  events: FinaleEvent[];
  players: Player[];
}) {
  const nameOf = (id: string | null) => {
    const p = players.find((x) => x.id === id);
    return p?.character_name || p?.name || "Someone";
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <h2 className="mb-3 text-lg font-medium text-ink">
          What actually happened
        </h2>
        <div className="space-y-3">
          {clues.map((c) => {
            const hiders = c.clue_assignments.filter(
              (a) => a.decision === "hidden"
            );
            return (
              <Card key={c.id} tint="purple" inset>
                <div className="mb-2 flex items-center justify-between">
                  <Badge tone="purple">Phase {c.phase}</Badge>
                  {hiders.length > 0 && (
                    <span className="text-[11px] text-red">
                      {hiders.map((h) => nameOf(h.player_id)).join(", ")} hid this
                    </span>
                  )}
                </div>
                <p className="text-sm text-ink">{c.master_content}</p>
                <p className="mt-1 text-xs text-ink-muted">
                  Group was told: {c.public_announcement}
                </p>
              </Card>
            );
          })}
          {clues.length === 0 && (
            <p className="text-sm text-ink-muted">No clues were configured.</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium text-ink">
          Reconstructed from the room
        </h2>
        <div className="relative space-y-3 border-l-[0.5px] border-line pl-5">
          {events.map((e) => (
            <div key={e.id} className="relative">
              <span className="absolute -left-[22px] top-1.5 h-2 w-2 rounded-full bg-white/40" />
              <CardLabel>{e.event_time || "some time"}</CardLabel>
              <p className="text-sm text-ink">{e.title}</p>
              {e.description && (
                <p className="text-xs text-ink-secondary">{e.description}</p>
              )}
              <p className="mt-1 text-[11px] text-ink-muted">
                {e.story_event_players.length > 0
                  ? `Involved: ${e.story_event_players.map((sp) => nameOf(sp.player_id)).join(", ")}`
                  : `Logged by ${nameOf(e.created_by)}`}
              </p>
            </div>
          ))}
          {events.length === 0 && (
            <p className="text-sm text-ink-muted">
              No one put anything on the record.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
