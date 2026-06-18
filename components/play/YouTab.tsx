"use client";

import type { Player } from "@/lib/supabase/types";
import { Avatar } from "@/components/ui/Avatar";
import { Card, CardLabel } from "@/components/ui/Card";
import { DecayBar } from "@/components/ui/DecayBar";

export function YouTab({
  me,
  target,
}: {
  me: Player;
  target: Player | null;
}) {
  const memories = [
    { text: me.memory_1, strength: me.memory_1_strength ?? 100 },
    { text: me.memory_2, strength: me.memory_2_strength ?? 100 },
    { text: me.memory_3, strength: me.memory_3_strength ?? 100 },
  ].filter((m) => m.text);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Avatar name={me.character_name || me.name} size="lg" />
        <div>
          <h1 className="text-xl font-semibold text-ink">
            {me.character_name || me.name}
          </h1>
          {me.role && <p className="text-sm text-ink-secondary">{me.role}</p>}
        </div>
      </div>

      {me.public_persona && (
        <Card inset>
          <CardLabel>Public persona</CardLabel>
          <p className="text-sm text-ink-secondary">{me.public_persona}</p>
        </Card>
      )}

      {me.secret && (
        <Card tint="red" inset>
          <CardLabel>Your secret</CardLabel>
          <p className="text-sm text-ink">{me.secret}</p>
        </Card>
      )}

      {me.objective && (
        <Card tint="green" inset>
          <CardLabel>Your objective</CardLabel>
          <p className="text-sm text-ink">{me.objective}</p>
        </Card>
      )}

      {memories.length > 0 && (
        <div className="space-y-3">
          <CardLabel>What you remember</CardLabel>
          {memories.map((m, i) => {
            const faint = m.strength < 40;
            return (
              <div
                key={i}
                className="space-y-2 rounded-[10px] border-[0.5px] border-line bg-surface px-4 py-3"
              >
                <p
                  className="text-sm italic text-ink-secondary"
                  style={{ opacity: 0.4 + (m.strength / 100) * 0.6 }}
                >
                  {m.text}
                </p>
                <DecayBar strength={m.strength} />
                {faint && (
                  <p className="text-[11px] italic text-red/80">
                    You&apos;re no longer certain about this.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {target && (
        <Card tint="amber" inset>
          <CardLabel>Who to find</CardLabel>
          <p className="text-base text-ink">{target.character_name || target.name}</p>
          {me.find_question && (
            <p className="mt-2 text-sm italic text-ink-secondary">
              Ask them: “{me.find_question}”
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
