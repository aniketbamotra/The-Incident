"use client";

import { useEffect, useState } from "react";
import { Card, CardLabel } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const PHASES = [
  { n: 1, name: "Arrival", hint: "Everyone mingles. First clues drop." },
  { n: 2, name: "Dispersal", hint: "Group breaks apart. Directed finds happen." },
  { n: 3, name: "The turn", hint: "Contradictory clues land. Trust shifts." },
  { n: 4, name: "Regather", hint: "Pull everyone back. First vote." },
  { n: 5, name: "Reckoning", hint: "Final clues, final vote, into the finale." },
];

// No phases table exists in the schema, so these planning notes are kept
// locally on the host's device. Live phase control happens on the dashboard.
export function PhaseNotes() {
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("incident-phase-notes");
      if (raw) setNotes(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem("incident-phase-notes", JSON.stringify(notes));
  }, [notes, loaded]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-secondary">
        A guide to pacing the evening. Notes here stay on your device — release
        clues and advance phases live from the dashboard.
      </p>
      {PHASES.map((p) => (
        <Card key={p.n}>
          <div className="mb-2 flex items-center gap-3">
            <Badge tone="purple">Phase {p.n}</Badge>
            <span className="font-medium text-ink">{p.name}</span>
          </div>
          <p className="mb-3 text-sm text-ink-muted">{p.hint}</p>
          <CardLabel>Your notes</CardLabel>
          <textarea
            value={notes[p.n] ?? ""}
            onChange={(e) =>
              setNotes((prev) => ({ ...prev, [p.n]: e.target.value }))
            }
            rows={2}
            placeholder="Gathering prompt, vote prompt, anything to remember…"
            className="w-full resize-none rounded-[10px] border-[0.5px] border-line bg-bg px-3 py-2.5 text-sm leading-6 text-ink placeholder:text-ink-muted focus:border-white/20 focus:outline-none"
          />
        </Card>
      ))}
    </div>
  );
}
