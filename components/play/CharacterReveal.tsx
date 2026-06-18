"use client";

import { useState } from "react";
import type { Player } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";

// Staged dramatic reveal shown once, on first entry to a game.
export function CharacterReveal({
  me,
  targetName,
  onDone,
}: {
  me: Player;
  targetName: string | null;
  onDone: () => void;
}) {
  const [stage, setStage] = useState(0);
  const memories = [me.memory_1, me.memory_2, me.memory_3].filter(Boolean);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-sm flex-col items-center gap-8 text-center">
        {/* Stage 0 — name + role */}
        <div className="flex flex-col items-center gap-4">
          <Avatar name={me.character_name || me.name} size="lg" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-ink-muted">
              You are
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-ink">
              {me.character_name || me.name}
            </h1>
            {me.role && (
              <p className="mt-1 text-sm text-ink-secondary">{me.role}</p>
            )}
          </div>
        </div>

        {stage >= 1 && me.secret && (
          <Reveal label="Your secret" tone="red">
            {me.secret}
          </Reveal>
        )}
        {stage >= 2 && me.objective && (
          <Reveal label="Your objective" tone="green">
            {me.objective}
          </Reveal>
        )}
        {stage >= 3 && (
          <div className="w-full space-y-2 text-left">
            <p className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">
              What you remember
            </p>
            {memories.map((m, i) => (
              <p
                key={i}
                className="rounded-[10px] border-[0.5px] border-line bg-surface px-4 py-3 text-sm italic text-ink-secondary"
              >
                {m}
              </p>
            ))}
            {targetName && (
              <p className="pt-2 text-sm text-ink-secondary">
                Find <span className="text-ink">{targetName}</span> tonight.
              </p>
            )}
          </div>
        )}

        <div className="w-full pt-2">
          {stage < 3 ? (
            <Button fullWidth size="lg" onClick={() => setStage((s) => s + 1)}>
              {stage === 0
                ? "Reveal my secret"
                : stage === 1
                  ? "Reveal my objective"
                  : "Show my memories"}
            </Button>
          ) : (
            <Button fullWidth size="lg" onClick={onDone}>
              I&apos;ve read this
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}

function Reveal({
  label,
  tone,
  children,
}: {
  label: string;
  tone: "red" | "green";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "w-full rounded-[12px] border-[0.5px] p-4 text-left",
        tone === "red"
          ? "border-red/20 bg-red/[0.06]"
          : "border-green/20 bg-green/[0.06]"
      )}
    >
      <p className="mb-1.5 text-[11px] uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </p>
      <p className="text-sm text-ink">{children}</p>
    </div>
  );
}
