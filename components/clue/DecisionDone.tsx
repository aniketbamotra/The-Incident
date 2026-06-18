"use client";

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
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl"
            style={{
              backgroundColor: revealed
                ? "rgba(29,158,117,0.12)"
                : "rgba(226,75,74,0.12)",
              color: revealed ? "var(--green)" : "var(--red)",
            }}
          >
            {revealed ? "✓" : "—"}
          </div>
          <h1 className="text-xl font-semibold text-ink">
            {revealed ? "You revealed it" : "You sat on it"}
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            {revealed
              ? "It's gone out to the group, attributed to you."
              : "You withheld this. It's recorded and will surface in the epilogue."}
          </p>
        </div>

        {revealed && sharedContent && (
          <Card inset>
            <CardLabel>What the group saw</CardLabel>
            <p className="text-sm italic text-ink">“{sharedContent}”</p>
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

        <Button fullWidth size="lg" onClick={onBack}>
          Back to the game
        </Button>
      </div>
    </main>
  );
}
