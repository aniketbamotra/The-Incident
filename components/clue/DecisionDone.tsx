"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardLabel } from "@/components/ui/Card";

export function DecisionDone({
  decision,
  sharedContent,
  onBack,
}: {
  decision: string;
  sharedContent: string | null;
  onBack: () => void;
}) {
  const revealed = decision === "revealed";
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-6">
      <div className="space-y-5">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={
              revealed
                ? { type: "spring", stiffness: 200, damping: 15 }
                : { duration: 0.3, ease: "easeOut" }
            }
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl"
            style={{
              backgroundColor: revealed
                ? "rgba(29,158,117,0.12)"
                : "rgba(226,75,74,0.12)",
              color: revealed ? "var(--green)" : "var(--red)",
            }}
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.2 }}
            >
              {revealed ? "✓" : "—"}
            </motion.span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
            className="text-xl font-semibold text-ink"
          >
            {revealed ? "You revealed it" : "You sat on it"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="mt-1 text-sm text-ink-secondary"
          >
            {revealed
              ? "It's gone out to the group, attributed to you."
              : "You withheld this. It's recorded and will surface in the epilogue."}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.3, ease: "easeOut" }}
        >
          {revealed && sharedContent && (
            <Card inset>
              <CardLabel>What the group saw</CardLabel>
              <p className="text-sm italic text-ink">&ldquo;{sharedContent}&rdquo;</p>
            </Card>
          )}

          {!revealed && (
            <Card tint="red" inset>
              <CardLabel>Logged</CardLabel>
              <p className="text-sm text-ink-secondary">
                The group knows you received something. What you chose to do with
                it is now part of the record.
              </p>
            </Card>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.3 }}
        >
          <Button fullWidth size="lg" onClick={onBack}>
            Back to the game
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
