"use client";

import { useState } from "react";
import type { Game, Player, Clue, ClueAssignment } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { CharacterBuilder } from "./CharacterBuilder";
import { ClueDesigner } from "./ClueDesigner";
import { PhaseNotes } from "./PhaseNotes";
import { PreviewTab } from "./PreviewTab";
import { LaunchPanel } from "./LaunchPanel";

export type ClueWithAssignments = Clue & {
  clue_assignments: ClueAssignment[];
};

type Tab = "characters" | "clues" | "phases" | "preview";

const TABS: { id: Tab; label: string }[] = [
  { id: "characters", label: "Characters" },
  { id: "clues", label: "Clues" },
  { id: "phases", label: "Phases" },
  { id: "preview", label: "Preview" },
];

export function SetupClient({
  game,
  players: initialPlayers,
  clues,
}: {
  game: Game;
  players: Player[];
  clues: ClueWithAssignments[];
}) {
  const [tab, setTab] = useState<Tab>("characters");
  // Local copy so the interaction web updates instantly as the host edits.
  const [players, setPlayers] = useState<Player[]>(initialPlayers);

  function patchPlayer(id: string, fields: Partial<Player>) {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...fields } : p))
    );
  }

  const configured = players.filter((p) => p.character_name?.trim()).length;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b-[0.5px] border-line bg-bg/90 px-5 py-4 backdrop-blur">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">
            Host setup
          </p>
          <h1 className="truncate text-lg font-semibold text-ink">
            {game.name}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone="neutral">
            <span className="tabular-nums">{game.code}</span>
          </Badge>
          <Badge tone={configured === 16 ? "green" : "amber"}>
            {configured}/16 set
          </Badge>
        </div>
      </header>

      {/* Tab bar */}
      <nav className="flex gap-1 border-b-[0.5px] border-line px-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "relative px-4 py-3 text-sm font-medium transition-colors",
              tab === t.id ? "text-ink" : "text-ink-muted hover:text-ink-secondary"
            )}
          >
            {t.label}
            {tab === t.id && (
              <span className="absolute inset-x-3 -bottom-px h-px bg-ink" />
            )}
          </button>
        ))}
      </nav>

      <main className="flex-1 p-5">
        {tab === "characters" && (
          <CharacterBuilder
            gameId={game.id}
            players={players}
            onPatch={patchPlayer}
          />
        )}
        {tab === "clues" && (
          <ClueDesigner gameId={game.id} players={players} clues={clues} />
        )}
        {tab === "phases" && <PhaseNotes />}
        {tab === "preview" && <PreviewTab players={players} />}
      </main>

      <LaunchPanel game={game} players={players} configured={configured} />
    </div>
  );
}
