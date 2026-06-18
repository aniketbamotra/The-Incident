"use client";

import { useState, useTransition } from "react";
import type { Player } from "@/lib/supabase/types";
import type { ClueWithAssignments } from "./SetupClient";
import { createClue, deleteClue } from "@/lib/actions/setup";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardLabel } from "@/components/ui/Card";

const PHASES = [1, 2, 3, 4, 5];

export function ClueDesigner({
  gameId,
  players,
  clues,
}: {
  gameId: string;
  players: Player[];
  clues: ClueWithAssignments[];
}) {
  const named = players.filter((p) => p.character_name?.trim());
  const nameOf = (id: string | null) =>
    players.find((p) => p.id === id)?.character_name || "—";

  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    phase: 1,
    publicAnnouncement: "",
    masterContent: "",
    playerAId: "",
    playerAContent: "",
    playerAImplicatesSelf: true,
    playerBId: "",
    playerBContent: "",
  });

  const valid =
    form.publicAnnouncement.trim() &&
    form.masterContent.trim() &&
    form.playerAId &&
    form.playerAContent.trim() &&
    form.playerBId &&
    form.playerBContent.trim() &&
    form.playerAId !== form.playerBId;

  function submit() {
    if (!valid) return;
    startTransition(async () => {
      await createClue(gameId, form);
      setForm((f) => ({
        ...f,
        publicAnnouncement: "",
        masterContent: "",
        playerAContent: "",
        playerBContent: "",
      }));
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Existing clues */}
      <div className="space-y-3">
        <CardLabel>Clue drops ({clues.length})</CardLabel>
        {clues.length === 0 && (
          <p className="text-sm text-ink-muted">
            No clues yet. Each clue goes to exactly two players.
          </p>
        )}
        {clues.map((clue) => {
          const a = clue.clue_assignments.find(
            (x) => x.version === "implicating"
          );
          const b = clue.clue_assignments.find((x) => x.version === "neutral");
          return (
            <Card key={clue.id} inset>
              <div className="mb-2 flex items-center justify-between">
                <Badge tone="purple">Phase {clue.phase}</Badge>
                <button
                  onClick={() =>
                    startTransition(() => deleteClue(gameId, clue.id))
                  }
                  className="text-[11px] text-ink-muted hover:text-red"
                >
                  Delete
                </button>
              </div>
              <p className="text-sm text-ink">{clue.public_announcement}</p>
              <p className="mt-1 text-xs italic text-ink-muted">
                Truth: {clue.master_content}
              </p>
              <div className="mt-3 space-y-1 border-t-[0.5px] border-line pt-3 text-xs">
                <p className="text-red">
                  {nameOf(a?.player_id ?? null)} (implicating
                  {a?.implicates_self ? ", self" : ""})
                </p>
                <p className="text-ink-secondary">
                  {nameOf(b?.player_id ?? null)} (neutral)
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* New clue form */}
      <Card className="space-y-4 self-start">
        <div className="flex items-center justify-between">
          <CardLabel>New clue</CardLabel>
          <select
            value={form.phase}
            onChange={(e) =>
              setForm({ ...form, phase: Number(e.target.value) })
            }
            className="h-8 rounded-[8px] border-[0.5px] border-line bg-bg px-2 text-xs text-ink"
          >
            {PHASES.map((p) => (
              <option key={p} value={p}>
                Phase {p}
              </option>
            ))}
          </select>
        </div>

        <TextField
          label="Public announcement (everyone sees)"
          value={form.publicAnnouncement}
          onChange={(v) => setForm({ ...form, publicAnnouncement: v })}
        />
        <TextField
          label="Master content (truth — finale only)"
          value={form.masterContent}
          onChange={(v) => setForm({ ...form, masterContent: v })}
        />

        <div className="space-y-3 rounded-[10px] border-[0.5px] border-red/20 bg-red/[0.04] p-3">
          <PlayerPicker
            label="Player A — implicating version"
            players={named}
            value={form.playerAId}
            onChange={(v) => setForm({ ...form, playerAId: v })}
          />
          <TextField
            value={form.playerAContent}
            onChange={(v) => setForm({ ...form, playerAContent: v })}
            placeholder="What Player A privately sees…"
          />
          <label className="flex items-center gap-2 text-xs text-ink-secondary">
            <input
              type="checkbox"
              checked={form.playerAImplicatesSelf}
              onChange={(e) =>
                setForm({ ...form, playerAImplicatesSelf: e.target.checked })
              }
              className="accent-red"
            />
            This version implicates the recipient
          </label>
        </div>

        <div className="space-y-3 rounded-[10px] border-[0.5px] border-line p-3">
          <PlayerPicker
            label="Player B — neutral version"
            players={named}
            value={form.playerBId}
            onChange={(v) => setForm({ ...form, playerBId: v })}
          />
          <TextField
            value={form.playerBContent}
            onChange={(v) => setForm({ ...form, playerBContent: v })}
            placeholder="What Player B privately sees…"
          />
        </div>

        <Button
          variant="purple"
          fullWidth
          disabled={!valid || pending}
          onClick={submit}
        >
          {pending ? "Saving…" : "Add clue drop"}
        </Button>
      </Card>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="w-full resize-none rounded-[10px] border-[0.5px] border-line bg-bg px-3 py-2.5 text-sm leading-6 text-ink placeholder:text-ink-muted focus:border-white/20 focus:outline-none"
      />
    </div>
  );
}

function PlayerPicker({
  label,
  players,
  value,
  onChange,
}: {
  label: string;
  players: Player[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-[10px] border-[0.5px] border-line bg-bg px-3 text-sm text-ink focus:border-white/20 focus:outline-none"
      >
        <option value="">Select a character…</option>
        {players.map((p) => (
          <option key={p.id} value={p.id}>
            {p.character_name}
          </option>
        ))}
      </select>
    </div>
  );
}
