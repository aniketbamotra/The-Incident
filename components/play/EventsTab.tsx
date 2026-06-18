"use client";

import { useState, useTransition } from "react";
import type { Player } from "@/lib/supabase/types";
import type { StoryEventWithPlayers } from "@/app/play/[gameId]/page";
import { cn, timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { addStoryEvent } from "@/lib/actions/play";

export function EventsTab({
  gameId,
  me,
  players,
  events,
}: {
  gameId: string;
  me: Player;
  players: Player[];
  events: StoryEventWithPlayers[];
}) {
  const [open, setOpen] = useState(false);
  const nameOf = (id: string | null) => {
    const p = players.find((x) => x.id === id);
    return p?.character_name || p?.name || "Someone";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-ink">The night, so far</h1>
        <Button size="sm" onClick={() => setOpen(true)}>
          + Add
        </Button>
      </div>

      {events.length === 0 && (
        <p className="text-sm text-ink-muted">
          Nothing on the record yet. Add what you witnessed.
        </p>
      )}

      <div className="space-y-3">
        {events.map((e) => (
          <Card key={e.id} inset>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[11px] tabular-nums text-ink-muted">
                {e.event_time || timeAgo(e.created_at)}
              </span>
              <span className="text-[11px] text-ink-muted">
                by {nameOf(e.created_by)}
              </span>
            </div>
            <p className="text-sm font-medium text-ink">{e.title}</p>
            {e.description && (
              <p className="mt-1 text-sm text-ink-secondary">{e.description}</p>
            )}
            {e.story_event_players.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {e.story_event_players.map((sp) => (
                  <span
                    key={sp.player_id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] py-1 pl-1 pr-2.5"
                  >
                    <Avatar name={nameOf(sp.player_id)} size="sm" />
                    <span className="text-[11px] text-ink-secondary">
                      {nameOf(sp.player_id)}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      <AddEventModal
        open={open}
        onClose={() => setOpen(false)}
        gameId={gameId}
        me={me}
        players={players}
      />
    </div>
  );
}

function AddEventModal({
  open,
  onClose,
  gameId,
  me,
  players,
}: {
  open: boolean;
  onClose: () => void;
  gameId: string;
  me: Player;
  players: Player[];
}) {
  const [time, setTime] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [attached, setAttached] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  function toggle(id: string) {
    setAttached((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function submit() {
    if (!title.trim()) return;
    startTransition(async () => {
      await addStoryEvent({
        gameId,
        authorId: me.id,
        eventTime: time,
        title,
        description: desc,
        attachedPlayerIds: attached,
      });
      setTime("");
      setTitle("");
      setDesc("");
      setAttached([]);
      onClose();
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="What you witnessed">
      <div className="space-y-4">
        <input
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="Approx. time — e.g. ~20:00"
          className="h-11 w-full rounded-[10px] border-[0.5px] border-line bg-bg px-3 text-sm text-ink placeholder:text-ink-muted focus:border-white/20 focus:outline-none"
        />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What happened"
          autoFocus
          className="h-11 w-full rounded-[10px] border-[0.5px] border-line bg-bg px-3 text-sm text-ink placeholder:text-ink-muted focus:border-white/20 focus:outline-none"
        />
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Details (optional)"
          rows={3}
          className="w-full resize-none rounded-[10px] border-[0.5px] border-line bg-bg px-3 py-2.5 text-sm leading-6 text-ink placeholder:text-ink-muted focus:border-white/20 focus:outline-none"
        />
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.12em] text-ink-muted">
            Who was there?
          </p>
          <div className="flex flex-wrap gap-1.5">
            {players
              .filter((p) => p.character_name?.trim() || p.user_id)
              .map((p) => {
                const on = attached.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggle(p.id)}
                    className={cn(
                      "rounded-full border-[0.5px] px-3 py-1.5 text-[12px] transition-colors",
                      on
                        ? "border-white/30 bg-white/[0.08] text-ink"
                        : "border-line text-ink-secondary hover:bg-white/[0.03]"
                    )}
                  >
                    {p.character_name || p.name}
                  </button>
                );
              })}
          </div>
        </div>
        <Button
          fullWidth
          disabled={!title.trim() || pending}
          onClick={submit}
        >
          {pending ? "Adding…" : "Add to the record"}
        </Button>
      </div>
    </Modal>
  );
}
