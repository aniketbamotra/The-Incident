"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Player, TrustRating } from "@/lib/supabase/types";
import type { PlayerScore } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Card, CardLabel } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function EpiloguePhase({
  scores,
  players,
  trust,
}: {
  scores: PlayerScore[];
  players: Player[];
  trust: TrustRating[];
}) {
  const [idx, setIdx] = useState(0);
  const current = scores[idx];
  if (!current) return <p className="text-sm text-ink-muted">No players.</p>;

  const nameOf = (id: string | null) => {
    const p = players.find((x) => x.id === id);
    return p?.character_name || p?.name || "someone";
  };

  // Who this player trusted most, and that person's real honesty.
  const myRatings = trust.filter((t) => t.rater_id === current.player.id);
  const mostTrusted = [...myRatings].sort((a, b) => b.score - a.score)[0];
  const mostTrustedHonesty = mostTrusted
    ? Math.round(
        (scores.find((s) => s.player.id === mostTrusted.rated_id)?.honesty ?? 0) *
          100
      )
    : null;

  const epilogue =
    `${current.player.character_name || current.player.name} spent the night ${
      current.interactions > 6 ? "in the thick of it" : "on the edges of the room"
    }. ` +
    `${current.lies > current.reveals ? "They kept more than they gave away." : "They told more truth than most."} ` +
    `${current.objectiveMet ? "And they got what they came for." : "Whatever they came for, it slipped away."}`;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="space-y-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={current.player.character_name || current.player.name} size="lg" />
              <div>
                <h2 className="text-xl font-semibold text-ink">
                  {current.player.character_name || current.player.name}
                </h2>
                {current.player.role && (
                  <p className="text-sm text-ink-secondary">{current.player.role}</p>
                )}
              </div>
            </div>
            <Badge tone={current.objectiveMet ? "green" : "neutral"}>
              {current.score} pts
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Mini value={current.interactions} label="Conversations" />
            <Mini value={current.reveals} label="Came clean" tone="green" />
            <Mini value={current.lies} label="Withheld" tone="red" />
            <Mini value={current.correctVotes} label="Right votes" />
          </div>

          <Card inset>
            <CardLabel>Epilogue</CardLabel>
            <p className="text-sm leading-7 text-ink">{epilogue}</p>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2">
            <Card inset>
              <CardLabel>Their secret</CardLabel>
              <p className="text-sm text-ink">
                {current.player.secret || "—"}
              </p>
            </Card>
            <Card inset>
              <CardLabel>Trusted most</CardLabel>
              {mostTrusted ? (
                <p className="text-sm text-ink">
                  {nameOf(mostTrusted.rated_id)} —{" "}
                  <span
                    className={cn(
                      (mostTrustedHonesty ?? 0) >= 50 ? "text-green" : "text-red"
                    )}
                  >
                    {mostTrustedHonesty}% honest
                  </span>
                </p>
              ) : (
                <p className="text-sm text-ink-muted">Trusted no one.</p>
              )}
            </Card>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between pt-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={idx === 0}
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
        >
          ← Prev player
        </Button>
        <span className="text-sm text-ink-muted">
          Player {idx + 1} / {scores.length}
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={idx === scores.length - 1}
          onClick={() => setIdx((i) => Math.min(scores.length - 1, i + 1))}
        >
          Next player →
        </Button>
      </div>
    </div>
  );
}

function Mini({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone?: "green" | "red";
}) {
  return (
    <div className="rounded-[10px] border-[0.5px] border-line bg-surface px-3 py-2.5 text-center">
      <p
        className={cn(
          "text-2xl font-semibold tabular-nums",
          tone === "green" ? "text-green" : tone === "red" ? "text-red" : "text-ink"
        )}
      >
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-[0.1em] text-ink-muted">
        {label}
      </p>
    </div>
  );
}
