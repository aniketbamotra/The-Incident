"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { claimSeat } from "@/lib/actions/join";

function JoinButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" fullWidth disabled={pending}>
      {pending ? "Joining…" : "Join"}
    </Button>
  );
}

export function JoinClient({
  gameName,
  code,
  pid,
  seatHint,
}: {
  gameName: string;
  code: string;
  pid: string | null;
  seatHint: string | null;
}) {
  const [error, setError] = useState<string | null>(null);

  async function action(formData: FormData) {
    setError(null);
    const res = await claimSeat(formData);
    if (res?.error) setError(res.error);
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-[11px] uppercase tracking-[0.4em] text-ink-muted">
            Joining
          </p>
          <h1 className="text-2xl font-semibold text-ink">{gameName}</h1>
          {seatHint && (
            <p className="text-sm text-ink-secondary">
              You&apos;ll be playing{" "}
              <span className="text-ink">{seatHint}</span>
            </p>
          )}
        </div>

        <form action={action} className="flex flex-col gap-3">
          <input type="hidden" name="code" value={code} />
          {pid && <input type="hidden" name="pid" value={pid} />}
          <input
            name="name"
            autoFocus
            placeholder="Your name"
            className="h-12 rounded-[12px] border-[0.5px] border-line bg-surface px-4 text-ink placeholder:text-ink-muted focus:border-white/20 focus:outline-none"
          />
          {error && <p className="text-sm text-red">{error}</p>}
          <JoinButton />
        </form>
      </div>
    </main>
  );
}
