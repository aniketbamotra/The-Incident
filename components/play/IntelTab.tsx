"use client";

import Link from "next/link";
import type { Revelation } from "@/lib/supabase/types";
import type { MyClue } from "@/app/play/[gameId]/page";
import { timeAgo } from "@/lib/utils";
import { Card, CardLabel } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function IntelTab({
  gameId,
  revelations,
  myClues,
}: {
  gameId: string;
  revelations: Revelation[];
  myClues: MyClue[];
}) {
  // Only clues whose parent has been released and that still need a decision.
  const pendingClues = myClues.filter(
    (c) => c.clues?.released_at && !c.decision
  );
  const decidedClues = myClues.filter(
    (c) => c.clues?.released_at && c.decision
  );

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-ink">Intel</h1>

      {pendingClues.map((c) => (
        <Link key={c.id} href={`/play/${gameId}/clue/${c.id}`}>
          <Card tint="amber" inset className="transition-colors hover:bg-amber/[0.1]">
            <div className="flex items-center justify-between">
              <CardLabel>Private clue · waiting on you</CardLabel>
              <Badge tone="amber">Tap to view</Badge>
            </div>
            <p className="mt-1 text-sm text-ink">
              You received something only you can act on.
            </p>
          </Card>
        </Link>
      ))}

      {revelations.length === 0 && pendingClues.length === 0 && (
        <p className="text-sm text-ink-muted">
          Nothing has surfaced yet. Stay close.
        </p>
      )}

      <div className="space-y-3">
        {revelations.map((r) => (
          <Card key={r.id} inset>
            <div className="mb-2 flex items-center justify-between">
              <Badge tone={r.type === "private" ? "purple" : "neutral"}>
                {r.type === "private" ? "Private" : "Public"}
              </Badge>
              <span className="text-[11px] tabular-nums text-ink-muted">
                {timeAgo(r.released_at)}
              </span>
            </div>
            <p className="text-sm text-ink">{r.content}</p>
          </Card>
        ))}
      </div>

      {decidedClues.length > 0 && (
        <div className="space-y-2 pt-2">
          <CardLabel>Your past clue decisions</CardLabel>
          {decidedClues.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-[10px] border-[0.5px] border-line bg-surface px-4 py-3"
            >
              <p className="text-sm text-ink-secondary">
                {c.clues?.public_announcement}
              </p>
              <Badge tone={c.decision === "revealed" ? "green" : "red"}>
                {c.decision === "revealed" ? "Revealed" : "Hidden"}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
