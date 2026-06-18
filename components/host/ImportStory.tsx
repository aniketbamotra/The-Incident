"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { importStory } from "@/lib/actions/import";

export function ImportStory({
  open,
  onClose,
  gameId,
  hasExisting,
}: {
  open: boolean;
  onClose: () => void;
  gameId: string;
  hasExisting: boolean;
}) {
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then(setText);
  }

  function run() {
    setErrors([]);
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      setErrors(["That isn't valid JSON. Check for a missing comma or quote."]);
      return;
    }
    startTransition(async () => {
      const res = await importStory(gameId, parsed);
      if (!res.ok) {
        setErrors(res.errors ?? ["Import failed."]);
        return;
      }
      // Phase notes live in localStorage (no phases table) — merge them in.
      if (res.phaseNotes && Object.keys(res.phaseNotes).length) {
        try {
          const raw = localStorage.getItem("incident-phase-notes");
          const existing = raw ? JSON.parse(raw) : {};
          localStorage.setItem(
            "incident-phase-notes",
            JSON.stringify({ ...existing, ...res.phaseNotes })
          );
        } catch {}
      }
      // Full reload so every tab reflects the freshly imported data.
      window.location.reload();
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Import a story">
      <div className="space-y-4">
        <p className="text-sm leading-6 text-ink-secondary">
          Paste or upload a story JSON file to fill in every character and clue
          at once.{" "}
          <a
            href="/story-template.json"
            download
            className="text-ink underline underline-offset-2"
          >
            Download the template
          </a>{" "}
          to hand to an AI or edit by hand.
        </p>

        {hasExisting && (
          <div className="rounded-[10px] border-[0.5px] border-amber/25 bg-amber/[0.06] px-3 py-2.5">
            <p className="text-[13px] text-amber/90">
              This replaces the current setup — existing characters and clues
              will be cleared.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <label className="cursor-pointer text-sm text-ink-secondary hover:text-ink">
            <input
              type="file"
              accept=".json,application/json"
              onChange={onFile}
              className="hidden"
            />
            <span className="rounded-[10px] border-[0.5px] border-line px-3 py-2">
              Choose .json file
            </span>
          </label>
          <span className="text-[11px] text-ink-muted">or paste below</span>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          spellCheck={false}
          placeholder='{ "characters": [ … ], "clues": [ … ] }'
          className="w-full resize-none rounded-[10px] border-[0.5px] border-line bg-bg px-3 py-2.5 font-mono text-[12px] leading-5 text-ink placeholder:text-ink-muted focus:border-white/20 focus:outline-none"
        />

        {errors.length > 0 && (
          <div className="space-y-1 rounded-[10px] border-[0.5px] border-red/25 bg-red/[0.06] px-3 py-2.5">
            {errors.map((e, i) => (
              <p key={i} className="text-[13px] text-red/90">
                • {e}
              </p>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Button
            fullWidth
            disabled={!text.trim() || pending}
            onClick={run}
          >
            {pending ? "Importing…" : "Import & replace"}
          </Button>
          <Button variant="ghost" fullWidth onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
