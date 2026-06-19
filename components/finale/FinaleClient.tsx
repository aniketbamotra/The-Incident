"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type {
  Game,
  Player,
  Vote,
  TrustRating,
  Interaction,
} from "@/lib/supabase/types";
import type { ClueWithAssignments } from "@/components/host/SetupClient";
import type { FinaleEvent } from "@/app/finale/[gameId]/page";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { computeScores } from "@/lib/scoring";
import { TimelinePhase } from "./TimelinePhase";
import { LiesPhase } from "./LiesPhase";
import { TrustGraph } from "./TrustGraph";
import { EpiloguePhase } from "./EpiloguePhase";
import { Leaderboard } from "./Leaderboard";

const PHASES = [
  "What happened",
  "Every lie",
  "The trust map",
  "Epilogues",
  "Leaderboard",
];

export function FinaleClient({
  game,
  players,
  clues,
  events,
  votes,
  trust,
  interactions,
}: {
  game: Game;
  players: Player[];
  clues: ClueWithAssignments[];
  events: FinaleEvent[];
  votes: Vote[];
  trust: TrustRating[];
  interactions: Interaction[];
}) {
  const [phase, setPhase] = useState(0);

  const assignments = useMemo(
    () => clues.flatMap((c) => c.clue_assignments),
    [clues]
  );
  const scores = useMemo(
    () => computeScores({ players, assignments, votes, trust, interactions }),
    [players, assignments, votes, trust, interactions]
  );

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      {/* Progress rail */}
      <header className="flex items-center justify-between border-b-[0.5px] border-line px-8 py-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.4em] text-purple">
            The reckoning
          </p>
          <h1 className="text-2xl font-semibold text-ink">{game.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          {PHASES.map((p, i) => (
            <motion.div
              key={p}
              animate={{
                width: i === phase ? 32 : 16,
                backgroundColor:
                  i === phase
                    ? "rgb(127,119,221)"
                    : i < phase
                      ? "rgba(127,119,221,0.4)"
                      : "rgba(255,255,255,0.1)",
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-1.5 rounded-full"
            />
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mx-auto max-w-5xl">
          <p className="mb-6 text-[11px] uppercase tracking-[0.3em] text-ink-muted">
            Phase {phase + 1} — {PHASES[phase]}
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {phase === 0 && (
                <TimelinePhase clues={clues} events={events} players={players} />
              )}
              {phase === 1 && <LiesPhase clues={clues} players={players} />}
              {phase === 2 && (
                <TrustGraph players={players} trust={trust} assignments={assignments} />
              )}
              {phase === 3 && (
                <EpiloguePhase scores={scores} players={players} trust={trust} />
              )}
              {phase === 4 && <Leaderboard scores={scores} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <footer className="flex items-center justify-between border-t-[0.5px] border-line px-8 py-5">
        <Button
          variant="ghost"
          onClick={() => setPhase((p) => Math.max(0, p - 1))}
          disabled={phase === 0}
        >
          ← Back
        </Button>
        <p className="text-sm text-ink-muted">
          {phase + 1} / {PHASES.length}
        </p>
        <Button
          variant="purple"
          onClick={() => setPhase((p) => Math.min(PHASES.length - 1, p + 1))}
          disabled={phase === PHASES.length - 1}
        >
          Next →
        </Button>
      </footer>
    </div>
  );
}
