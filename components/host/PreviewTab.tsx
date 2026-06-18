"use client";

import { useState } from "react";
import type { Player } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Card, CardLabel } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function PreviewTab({ players }: { players: Player[] }) {
  const named = players.filter((p) => p.character_name?.trim());
  const [selectedId, setSelectedId] = useState(named[0]?.id ?? null);
  const selected = players.find((p) => p.id === selectedId);
  const target = players.find((p) => p.id === selected?.find_player_id);

  if (named.length === 0) {
    return (
      <p className="text-sm text-ink-muted">
        Configure a character to preview their sheet.
      </p>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
      <div className="flex flex-wrap gap-2 lg:flex-col">
        {named.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedId(p.id)}
            className={cn(
              "flex items-center gap-2 rounded-[10px] border-[0.5px] px-3 py-2 text-left text-sm transition-colors",
              p.id === selectedId
                ? "border-white/30 bg-white/[0.04] text-ink"
                : "border-line text-ink-secondary hover:bg-white/[0.02]"
            )}
          >
            <Avatar name={p.character_name!} size="sm" />
            <span className="truncate">{p.character_name}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="mx-auto w-full max-w-md space-y-4">
          <div className="flex items-center gap-3">
            <Avatar name={selected.character_name!} size="lg" />
            <div>
              <h2 className="text-xl font-semibold text-ink">
                {selected.character_name}
              </h2>
              {selected.role && (
                <p className="text-sm text-ink-secondary">{selected.role}</p>
              )}
            </div>
          </div>

          {selected.public_persona && (
            <Card inset>
              <CardLabel>Public persona</CardLabel>
              <p className="text-sm text-ink-secondary">
                {selected.public_persona}
              </p>
            </Card>
          )}

          {selected.secret && (
            <Card tint="red" inset>
              <CardLabel>Your secret</CardLabel>
              <p className="text-sm text-ink">{selected.secret}</p>
            </Card>
          )}

          {selected.objective && (
            <Card tint="green" inset>
              <CardLabel>Your objective</CardLabel>
              <p className="text-sm text-ink">{selected.objective}</p>
            </Card>
          )}

          {target && (
            <Card inset>
              <CardLabel>Who to find</CardLabel>
              <p className="text-sm text-ink">{target.character_name}</p>
              {selected.find_question && (
                <p className="mt-1 text-sm italic text-ink-secondary">
                  “{selected.find_question}”
                </p>
              )}
            </Card>
          )}

          <div className="space-y-2">
            <CardLabel>Memories</CardLabel>
            {[selected.memory_1, selected.memory_2, selected.memory_3]
              .filter(Boolean)
              .map((m, i) => (
                <p
                  key={i}
                  className="rounded-[10px] border-[0.5px] border-line bg-surface px-3 py-2.5 text-sm italic text-ink-secondary"
                >
                  {m}
                </p>
              ))}
          </div>

          {selected.hide_description && (
            <Card tint="amber" inset>
              <CardLabel>What you&apos;re hiding</CardLabel>
              <p className="text-sm text-ink-secondary">
                {selected.hide_description}
              </p>
              <Badge tone="amber" className="mt-2">
                Host note — not shown to player
              </Badge>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
