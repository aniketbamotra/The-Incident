"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Clue, ClueAssignment } from "@/lib/supabase/types";
import { timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardLabel } from "@/components/ui/Card";
import { RevealModal } from "./RevealModal";
import { HideModal } from "./HideModal";
import { DecisionDone } from "./DecisionDone";
import { decideClue } from "@/lib/actions/clue";

export function ClueScreen({
  gameId,
  assignment,
  clue,
  partnerName,
}: {
  gameId: string;
  assignment: ClueAssignment;
  clue: Clue;
  partnerName: string | null;
}) {
  const router = useRouter();
  const [modal, setModal] = useState<"reveal" | "hide" | null>(null);
  const [decision, setDecision] = useState(assignment.decision);
  const [pending, startTransition] = useTransition();

  function decide(choice: "revealed" | "hidden") {
    startTransition(async () => {
      await decideClue({
        gameId,
        assignmentId: assignment.id,
        decision: choice,
      });
      setDecision(choice);
      setModal(null);
    });
  }

  if (decision) {
    return (
      <DecisionDone
        decision={decision}
        sharedContent={assignment.revealed_content}
        onBack={() => router.push(`/play/${gameId}`)}
      />
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-6">
      <button
        onClick={() => router.push(`/play/${gameId}`)}
        className="mb-4 self-start text-sm text-ink-muted hover:text-ink-secondary"
      >
        ← Back
      </button>

      <div className="flex-1 space-y-5">
        {/* 1. Public context */}
        <div className="rounded-[12px] border-[0.5px] border-amber/30 bg-amber/[0.08] p-4">
          <p className="text-[11px] uppercase tracking-[0.12em] text-amber/80">
            The group has been told
          </p>
          <p className="mt-1.5 text-sm text-ink">{clue.public_announcement}</p>
          {partnerName && (
            <p className="mt-3 text-[13px] text-amber/90">
              {partnerName} also received a version of this clue.
            </p>
          )}
        </div>

        {/* 2. Private clue */}
        <Card>
          <CardLabel>Your private clue</CardLabel>
          <p className="text-base leading-7 text-ink">
            {assignment.private_content}
          </p>
          <p className="mt-3 text-[11px] tabular-nums text-ink-muted">
            Found {timeAgo(clue.released_at)}
          </p>
        </Card>

        {/* 3. Your situation */}
        <div className="rounded-[12px] border-[0.5px] border-line bg-surface/60 p-4">
          <CardLabel>Your situation</CardLabel>
          <p className="text-sm leading-6 text-ink-secondary">
            {assignment.implicates_self
              ? "This version points back at you. If it surfaces, people will have questions — and how you handle it now is its own kind of answer."
              : "This doesn't implicate you directly, but what you do with it says something. Sharing it moves suspicion; sitting on it is a choice others may later read into."}
          </p>
        </div>
      </div>

      {/* 4. Decision */}
      <div className="sticky bottom-0 mt-6 space-y-3 bg-bg/90 py-4 backdrop-blur">
        <Button
          variant="green"
          size="lg"
          fullWidth
          disabled={pending}
          onClick={() => setModal("reveal")}
        >
          Reveal
        </Button>
        <Button
          variant="redOutline"
          size="lg"
          fullWidth
          disabled={pending}
          onClick={() => setModal("hide")}
        >
          Sit on it
        </Button>
      </div>

      <RevealModal
        open={modal === "reveal"}
        onClose={() => setModal(null)}
        onConfirm={() => decide("revealed")}
        pending={pending}
        content={assignment.private_content}
        implicatesSelf={!!assignment.implicates_self}
      />
      <HideModal
        open={modal === "hide"}
        onClose={() => setModal(null)}
        onConfirm={() => decide("hidden")}
        pending={pending}
        partnerName={partnerName}
      />
    </main>
  );
}
