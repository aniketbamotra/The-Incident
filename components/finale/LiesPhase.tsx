"use client";

import type { Player } from "@/lib/supabase/types";
import type { ClueWithAssignments } from "@/components/host/SetupClient";
import { Card, CardLabel } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function LiesPhase({
  clues,
  players,
}: {
  clues: ClueWithAssignments[];
  players: Player[];
}) {
  const nameOf = (id: string | null) => {
    const p = players.find((x) => x.id === id);
    return p?.character_name || p?.name || "Someone";
  };

  const allAssignments = clues.flatMap((c) => c.clue_assignments);
  const totalLies = allAssignments.filter((a) => a.decision === "hidden").length;
  const totalReveals = allAssignments.filter(
    (a) => a.decision === "revealed"
  ).length;

  // A contradiction: one partner revealed while the other hid.
  const contradictions = clues.filter((c) => {
    const decided = c.clue_assignments.filter((a) => a.decision);
    return (
      decided.length === 2 &&
      decided.some((a) => a.decision === "revealed") &&
      decided.some((a) => a.decision === "hidden")
    );
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Stat value={totalLies} label="Clues withheld" tone="red" />
        <Stat value={totalReveals} label="Clues revealed" tone="green" />
        <Stat value={contradictions.length} label="Contradictions" tone="amber" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {clues.map((c) => (
          <Card key={c.id} inset>
            <div className="mb-2 flex items-center justify-between">
              <Badge tone="neutral">Phase {c.phase}</Badge>
            </div>
            <p className="mb-3 text-xs text-ink-muted">
              {c.public_announcement}
            </p>
            <div className="space-y-2">
              {c.clue_assignments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-[8px] border-[0.5px] border-line bg-bg px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-ink">{nameOf(a.player_id)}</p>
                    <p className="truncate text-[11px] text-ink-muted">
                      {a.version === "implicating" ? "implicating" : "neutral"}{" "}
                      version
                    </p>
                  </div>
                  <Badge
                    tone={
                      a.decision === "revealed"
                        ? "green"
                        : a.decision === "hidden"
                          ? "red"
                          : "neutral"
                    }
                  >
                    {a.decision ?? "no decision"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Stat({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: "red" | "green" | "amber";
}) {
  return (
    <Card tint={tone} inset>
      <p className="text-3xl font-semibold tabular-nums text-ink">{value}</p>
      <CardLabel>{label}</CardLabel>
    </Card>
  );
}
