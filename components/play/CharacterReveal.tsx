"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Avatar name={me.character_name || me.name} size="lg" />
          </motion.div>
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
        </motion.div>

        <AnimatePresence>
          {stage >= 1 && me.secret && (
            <motion.div
              key="secret"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="w-full"
            >
              <Reveal label="Your secret" tone="red">
                {me.secret}
              </Reveal>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {stage >= 2 && me.objective && (
            <motion.div
              key="objective"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="w-full"
            >
              <Reveal label="Your objective" tone="green">
                {me.objective}
              </Reveal>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {stage >= 3 && (
            <motion.div
              key="memories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="w-full space-y-2 text-left"
            >
              <p className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                What you remember
              </p>
              {memories.map((m, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.3, ease: "easeOut" }}
                  className="rounded-[10px] border-[0.5px] border-line bg-surface px-4 py-3 text-sm italic text-ink-secondary"
                >
                  {m}
                </motion.p>
              ))}
              {targetName && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: memories.length * 0.1 + 0.1, duration: 0.3 }}
                  className="pt-2 text-sm text-ink-secondary"
                >
                  Find <span className="text-ink">{targetName}</span> tonight.
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full pt-2">
          <AnimatePresence mode="wait">
            {stage < 3 ? (
              <motion.div
                key={stage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Button fullWidth size="lg" onClick={() => setStage((s) => s + 1)}>
                  {stage === 0
                    ? "Reveal my secret"
                    : stage === 1
                      ? "Reveal my objective"
                      : "Show my memories"}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
              >
                <Button fullWidth size="lg" onClick={onDone}>
                  I&apos;ve read this
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
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
          ? "border-red/20 bg-red/[0.06] animate-glow-red"
          : "border-green/20 bg-green/[0.06] animate-glow-green"
      )}
    >
      <p className="mb-1.5 text-[11px] uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </p>
      <p className="text-sm text-ink">{children}</p>
    </div>
  );
}
