"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { createGame, joinByCode } from "@/lib/actions/games";

function SubmitButton({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost";
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" fullWidth variant={variant} disabled={pending}>
      {pending ? "…" : children}
    </Button>
  );
}

export function LandingActions() {
  const [mode, setMode] = useState<"idle" | "create" | "join">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleJoin(formData: FormData) {
    setError(null);
    const res = await joinByCode(formData);
    if (res?.error) setError(res.error);
  }

  if (mode === "create") {
    return (
      <form action={createGame} className="flex w-full flex-col gap-3">
        <input
          name="name"
          autoFocus
          placeholder="Name your game"
          className="h-12 rounded-[12px] border-[0.5px] border-line bg-surface px-4 text-ink placeholder:text-ink-muted focus:border-white/20 focus:outline-none"
        />
        <SubmitButton>Create</SubmitButton>
        <button
          type="button"
          onClick={() => setMode("idle")}
          className="text-sm text-ink-muted hover:text-ink-secondary"
        >
          Back
        </button>
      </form>
    );
  }

  if (mode === "join") {
    return (
      <form action={handleJoin} className="flex w-full flex-col gap-3">
        <input
          name="code"
          autoFocus
          maxLength={6}
          autoCapitalize="characters"
          placeholder="6-CHAR CODE"
          className="h-12 rounded-[12px] border-[0.5px] border-line bg-surface px-4 text-center text-lg tracking-[0.3em] text-ink uppercase placeholder:tracking-normal placeholder:text-ink-muted focus:border-white/20 focus:outline-none"
        />
        {error && <p className="text-sm text-red">{error}</p>}
        <SubmitButton>Join</SubmitButton>
        <button
          type="button"
          onClick={() => {
            setMode("idle");
            setError(null);
          }}
          className="text-sm text-ink-muted hover:text-ink-secondary"
        >
          Back
        </button>
      </form>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <Button size="lg" fullWidth onClick={() => setMode("create")}>
        Create a game
      </Button>
      <Button
        size="lg"
        fullWidth
        variant="ghost"
        onClick={() => setMode("join")}
      >
        Join a game
      </Button>
    </div>
  );
}
