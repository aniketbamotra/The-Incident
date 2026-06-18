"use client";

import { useState, useTransition } from "react";
import type { Player } from "@/lib/supabase/types";
import { timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { sendTip } from "@/lib/actions/play";

export type VisibleTip = {
  id: string;
  content: string;
  recipient_id: string | null;
  created_at: string | null;
};

export function TipsTab({
  gameId,
  me,
  players,
  tips,
}: {
  gameId: string;
  me: Player;
  players: Player[];
  tips: VisibleTip[];
}) {
  const [content, setContent] = useState("");
  const [recipient, setRecipient] = useState<string>("");
  const [pending, startTransition] = useTransition();

  const others = players.filter(
    (p) => p.id !== me.id && (p.character_name?.trim() || p.user_id)
  );

  function submit() {
    if (!content.trim()) return;
    startTransition(async () => {
      await sendTip({
        gameId,
        senderId: me.id,
        content: content.trim(),
        recipientId: recipient || null,
      });
      setContent("");
      setRecipient("");
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-ink">Tips</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Anonymous. No one sees who sent what.
        </p>
      </div>

      <Card className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Drop an anonymous tip…"
          rows={3}
          className="w-full resize-none rounded-[10px] border-[0.5px] border-line bg-bg px-3 py-2.5 text-sm leading-6 text-ink placeholder:text-ink-muted focus:border-white/20 focus:outline-none"
        />
        <div className="flex items-center gap-2">
          <select
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="h-10 flex-1 rounded-[10px] border-[0.5px] border-line bg-bg px-3 text-sm text-ink focus:border-white/20 focus:outline-none"
          >
            <option value="">Everyone</option>
            {others.map((p) => (
              <option key={p.id} value={p.id}>
                {p.character_name || p.name}
              </option>
            ))}
          </select>
          <Button disabled={!content.trim() || pending} onClick={submit}>
            {pending ? "…" : "Send"}
          </Button>
        </div>
      </Card>

      <div className="space-y-2">
        {tips.length === 0 && (
          <p className="text-sm text-ink-muted">No tips have reached you.</p>
        )}
        {tips.map((t) => (
          <div
            key={t.id}
            className="rounded-[10px] border-[0.5px] border-line bg-surface px-4 py-3"
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                Anonymous
                {t.recipient_id ? " · to you" : " · to everyone"}
              </span>
              <span className="text-[11px] tabular-nums text-ink-muted">
                {timeAgo(t.created_at)}
              </span>
            </div>
            <p className="text-sm text-ink">{t.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
