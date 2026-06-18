"use client";

import { useState, useTransition } from "react";
import type { Player, TrustRating } from "@/lib/supabase/types";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { setTrustRating } from "@/lib/actions/play";

export function TrustTab({
  gameId,
  me,
  players,
  trust,
}: {
  gameId: string;
  me: Player;
  players: Player[];
  trust: TrustRating[];
}) {
  const others = players.filter(
    (p) => p.id !== me.id && (p.character_name?.trim() || p.user_id)
  );

  // My existing ratings, keyed by rated player.
  const myRatings = new Map(
    trust.filter((t) => t.rater_id === me.id).map((t) => [t.rated_id, t.score])
  );

  // What others rated me — average is my public trust score.
  const aboutMe = trust.filter((t) => t.rated_id === me.id);
  const myScore =
    aboutMe.length > 0
      ? Math.round(
          aboutMe.reduce((s, t) => s + t.score, 0) / aboutMe.length
        )
      : null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-ink">Trust</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Your trust ratings are public. Everyone can see them.
        </p>
      </div>

      <div className="space-y-2">
        {others.map((p) => (
          <TrustRow
            key={p.id}
            gameId={gameId}
            me={me}
            player={p}
            initial={myRatings.get(p.id) ?? 50}
            rated={myRatings.has(p.id)}
          />
        ))}
      </div>

      <Card inset>
        <p className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">
          Your trust score
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-semibold tabular-nums text-ink">
            {myScore ?? "—"}
          </span>
          <span className="text-sm text-ink-muted">
            {myScore === null
              ? "no one has rated you yet"
              : `from ${aboutMe.length} ${aboutMe.length === 1 ? "person" : "people"}`}
          </span>
        </div>
      </Card>
    </div>
  );
}

function TrustRow({
  gameId,
  me,
  player,
  initial,
  rated,
}: {
  gameId: string;
  me: Player;
  player: Player;
  initial: number;
  rated: boolean;
}) {
  const [score, setScore] = useState(initial);
  const [touched, setTouched] = useState(rated);
  const [, startTransition] = useTransition();

  function commit(v: number) {
    setTouched(true);
    startTransition(() =>
      setTrustRating({
        gameId,
        raterId: me.id,
        ratedId: player.id,
        score: v,
      })
    );
  }

  return (
    <div className="rounded-[10px] border-[0.5px] border-line bg-surface px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Avatar name={player.character_name || player.name} size="sm" />
          <span className="text-sm text-ink">
            {player.character_name || player.name}
          </span>
        </div>
        <span className="text-sm tabular-nums text-ink-secondary">
          {touched ? score : "—"}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={score}
        onChange={(e) => setScore(Number(e.target.value))}
        onMouseUp={() => commit(score)}
        onTouchEnd={() => commit(score)}
        className="w-full"
      />
    </div>
  );
}
