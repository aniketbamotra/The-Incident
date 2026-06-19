"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import type { Player, Vote } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { castVote } from "@/lib/actions/play";

export function VoteModal({
  open,
  gameId,
  phase,
  me,
  players,
  existingVote,
}: {
  open: boolean;
  gameId: string;
  phase: number;
  me: Player;
  players: Player[];
  existingVote: Vote | null;
}) {
  const [suspect, setSuspect] = useState<string | null>(
    existingVote?.suspect_id ?? null
  );
  const [recorded, setRecorded] = useState(!!existingVote);
  const [pending, startTransition] = useTransition();

  const others = players.filter(
    (p) => p.id !== me.id && (p.character_name?.trim() || p.user_id)
  );

  function submit() {
    if (!suspect) return;
    startTransition(async () => {
      await castVote({ gameId, phase, voterId: me.id, suspectId: suspect });
      setRecorded(true);
    });
  }

  return (
    <Modal open={open} dismissable={false} fullScreen title="Time to vote">
      <div className="space-y-4">
        <p className="text-sm text-ink-secondary">
          Who do you suspect most right now?
        </p>

        <div className="space-y-2">
          {others.map((p, index) => {
            const on = suspect === p.id;
            return (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.25, ease: "easeOut" }}
                onClick={() => {
                  setSuspect(p.id);
                  setRecorded(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[10px] border-[0.5px] px-4 py-3 text-left transition-colors",
                  on
                    ? "border-red/40 bg-red/[0.08]"
                    : "border-line hover:bg-white/[0.03]"
                )}
              >
                <Avatar name={p.character_name || p.name} size="sm" />
                <span className="flex-1 text-sm text-ink">
                  {p.character_name || p.name}
                </span>
                <motion.span
                  animate={on ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className={cn(
                    "h-4 w-4 rounded-full border-[1.5px]",
                    on ? "border-red bg-red" : "border-line"
                  )}
                />
              </motion.button>
            );
          })}
        </div>

        <Button
          variant="red"
          fullWidth
          size="lg"
          disabled={!suspect || pending}
          onClick={submit}
        >
          {pending ? "Recording…" : recorded ? "Change vote" : "Submit vote"}
        </Button>

        {recorded && (
          <p className="text-center text-sm text-green">
            Vote recorded. You can change this until the phase closes.
          </p>
        )}
      </div>
    </Modal>
  );
}
