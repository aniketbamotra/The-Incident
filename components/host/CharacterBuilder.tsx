"use client";

import { useState, useTransition } from "react";
import type { Player } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { saveCharacter } from "@/lib/actions/setup";
import { Avatar } from "@/components/ui/Avatar";
import { InteractionWeb } from "./InteractionWeb";

export function CharacterBuilder({
  gameId,
  players,
  onPatch,
}: {
  gameId: string;
  players: Player[];
  onPatch: (id: string, fields: Partial<Player>) => void;
}) {
  const [selectedId, setSelectedId] = useState(players[0]?.id ?? null);
  const [, startTransition] = useTransition();
  const [savingField, setSavingField] = useState<string | null>(null);

  const selected = players.find((p) => p.id === selectedId) ?? null;

  function commit(field: keyof Player, value: string | null) {
    if (!selected) return;
    onPatch(selected.id, { [field]: value } as Partial<Player>);
    setSavingField(field);
    startTransition(async () => {
      await saveCharacter(gameId, selected.id, { [field]: value });
      setSavingField(null);
    });
  }

  return (
    <div className="space-y-6">
      <InteractionWeb players={players} onSelect={setSelectedId} selectedId={selectedId} />

      {/* Slot grid */}
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {players.map((p, i) => {
          const isSet = !!p.character_name?.trim();
          return (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-[10px] border-[0.5px] p-2.5 transition-colors",
                p.id === selectedId
                  ? "border-white/30 bg-white/[0.04]"
                  : "border-line hover:bg-white/[0.02]"
              )}
            >
              <Avatar name={p.character_name || `${i + 1}`} size="sm" />
              <span className="w-full truncate text-center text-[11px] text-ink-secondary">
                {p.character_name || `Seat ${i + 1}`}
              </span>
              {!isSet && (
                <span className="h-1 w-1 rounded-full bg-amber" />
              )}
            </button>
          );
        })}
      </div>

      {/* Editor */}
      {selected && (
        <div className="space-y-4 rounded-[12px] border-[0.5px] border-line bg-surface p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Character name"
              value={selected.character_name}
              onCommit={(v) => commit("character_name", v)}
              saving={savingField === "character_name"}
            />
            <Field
              label="Role"
              value={selected.role}
              onCommit={(v) => commit("role", v)}
              saving={savingField === "role"}
            />
          </div>

          <Field
            label="Public persona"
            value={selected.public_persona}
            onCommit={(v) => commit("public_persona", v)}
            saving={savingField === "public_persona"}
            textarea
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Secret (only they see)"
              value={selected.secret}
              onCommit={(v) => commit("secret", v)}
              saving={savingField === "secret"}
              textarea
              tone="red"
            />
            <Field
              label="Objective (only they see)"
              value={selected.objective}
              onCommit={(v) => commit("objective", v)}
              saving={savingField === "objective"}
              textarea
              tone="green"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>Finds (directed target)</FieldLabel>
              <select
                value={selected.find_player_id ?? ""}
                onChange={(e) =>
                  commit("find_player_id", e.target.value || null)
                }
                className="h-11 w-full rounded-[10px] border-[0.5px] border-line bg-bg px-3 text-sm text-ink focus:border-white/20 focus:outline-none"
              >
                <option value="">— No one —</option>
                {players
                  .filter((p) => p.id !== selected.id)
                  .map((p, i) => (
                    <option key={p.id} value={p.id}>
                      {p.character_name || `Seat ${i + 1}`}
                    </option>
                  ))}
              </select>
            </div>
            <Field
              label="Question to ask them"
              value={selected.find_question}
              onCommit={(v) => commit("find_question", v)}
              saving={savingField === "find_question"}
            />
          </div>

          <Field
            label="What to hide"
            value={selected.hide_description}
            onCommit={(v) => commit("hide_description", v)}
            saving={savingField === "hide_description"}
            textarea
          />

          <div className="space-y-3">
            <FieldLabel>Memories (first-person fragments)</FieldLabel>
            <Field
              label="Memory 1"
              value={selected.memory_1}
              onCommit={(v) => commit("memory_1", v)}
              saving={savingField === "memory_1"}
              textarea
              compact
            />
            <Field
              label="Memory 2"
              value={selected.memory_2}
              onCommit={(v) => commit("memory_2", v)}
              saving={savingField === "memory_2"}
              textarea
              compact
            />
            <Field
              label="Memory 3"
              value={selected.memory_3}
              onCommit={(v) => commit("memory_3", v)}
              saving={savingField === "memory_3"}
              textarea
              compact
            />
          </div>
        </div>
      )}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
      {children}
    </label>
  );
}

function Field({
  label,
  value,
  onCommit,
  saving,
  textarea,
  compact,
  tone = "none",
}: {
  label: string;
  value: string | null;
  onCommit: (v: string) => void;
  saving?: boolean;
  textarea?: boolean;
  compact?: boolean;
  tone?: "none" | "red" | "green";
}) {
  const [local, setLocal] = useState(value ?? "");
  const border =
    tone === "red"
      ? "border-red/20"
      : tone === "green"
        ? "border-green/20"
        : "border-line";

  const base = cn(
    "w-full rounded-[10px] border-[0.5px] bg-bg px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-white/20 focus:outline-none",
    border
  );

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <FieldLabel>{label}</FieldLabel>
        {saving && <span className="text-[10px] text-ink-muted">saving…</span>}
      </div>
      {textarea ? (
        <textarea
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={() => local !== (value ?? "") && onCommit(local)}
          rows={compact ? 2 : 3}
          className={cn(base, "resize-none leading-6")}
        />
      ) : (
        <input
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={() => local !== (value ?? "") && onCommit(local)}
          className={base}
        />
      )}
    </div>
  );
}
