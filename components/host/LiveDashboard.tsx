"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type {
  Game,
  Player,
  Vote,
  Revelation,
  Interaction,
} from "@/lib/supabase/types";
import type { ClueWithAssignments } from "./SetupClient";
import { cn, timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardLabel } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { VoteResults } from "./VoteResults";
import {
  advancePhase,
  setGatheringStatus,
  toggleVote,
  releaseClue,
  sendAnnouncement,
  skipToFinale,
  rearmGame,
} from "@/lib/actions/host";

type FeedItem = {
  id: string;
  at: string | null;
  label: string;
  tone: "neutral" | "green" | "red" | "amber" | "purple";
};

export function LiveDashboard({
  game,
  players,
  clues,
  votes,
  events,
  revelations,
  tips,
  interactions,
}: {
  game: Game;
  players: Player[];
  clues: ClueWithAssignments[];
  votes: Vote[];
  events: { id: string; title: string; created_by: string | null; created_at: string | null }[];
  revelations: Revelation[];
  tips: { id: string; created_at: string | null; recipient_id: string | null }[];
  interactions: Interaction[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [announceOpen, setAnnounceOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [confirmFinale, setConfirmFinale] = useState(false);
  const [confirmRearm, setConfirmRearm] = useState(false);

  const phase = game.current_phase ?? 1;
  const joined = players.filter((p) => p.user_id).length;
  const nameOf = (id: string | null) => {
    const p = players.find((x) => x.id === id);
    return p?.character_name || p?.name || "Someone";
  };

  // Realtime — refresh on any change to this game's tables.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`host-${game.id}`);
    ["games", "players", "story_events", "revelations", "tips", "votes", "clue_assignments"].forEach(
      (table) =>
        channel.on(
          "postgres_changes",
          { event: "*", schema: "public", table },
          () => router.refresh()
        )
    );
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [game.id, router]);

  const phaseVotes = votes.filter((v) => v.phase === phase);

  // Merge sources into one time-sorted activity feed.
  const clueDecisions: FeedItem[] = clues.flatMap((c) =>
    c.clue_assignments
      .filter((a) => a.decided_at)
      .map((a) => ({
        id: a.id,
        at: a.decided_at,
        label: `${nameOf(a.player_id)} ${a.decision === "revealed" ? "revealed" : "hid"} a clue`,
        tone: (a.decision === "revealed" ? "green" : "red") as FeedItem["tone"],
      }))
  );
  const feed: FeedItem[] = [
    ...events.map((e) => ({
      id: `e-${e.id}`,
      at: e.created_at,
      label: `${nameOf(e.created_by)} added “${e.title}”`,
      tone: "neutral" as const,
    })),
    ...clueDecisions,
    ...tips.map((t) => ({
      id: `t-${t.id}`,
      at: t.created_at,
      label: t.recipient_id ? "Anonymous tip sent to a player" : "Anonymous tip sent to all",
      tone: "amber" as const,
    })),
    ...revelations.map((r) => ({
      id: `r-${r.id}`,
      at: r.released_at,
      label: `Revelation released: ${r.content.slice(0, 40)}${r.content.length > 40 ? "…" : ""}`,
      tone: "purple" as const,
    })),
  ]
    .filter((i) => i.at)
    .sort((a, b) => (b.at! > a.at! ? 1 : -1))
    .slice(0, 40);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">
            Host control
          </p>
          <h1 className="text-xl font-semibold text-ink">{game.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="neutral">{game.code}</Badge>
          <Badge tone={game.status === "finale" ? "purple" : "green"}>
            {game.status}
          </Badge>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* LEFT — state & controls */}
        <div className="space-y-5">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <CardLabel>Current phase</CardLabel>
                <p className="text-3xl font-semibold tabular-nums text-ink">
                  {phase}
                </p>
              </div>
              <div className="text-right">
                <CardLabel>Joined</CardLabel>
                <p className="text-3xl font-semibold tabular-nums text-ink">
                  {joined}
                  <span className="text-base text-ink-muted">/{players.length}</span>
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() =>
                  startTransition(() => advancePhase(game.id, phase))
                }
              >
                Advance to phase {phase + 1}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  startTransition(() =>
                    setGatheringStatus(
                      game.id,
                      game.status === "dispersal" ? "active" : "dispersal"
                    )
                  )
                }
              >
                {game.status === "dispersal" ? "End gathering" : "Call gathering"}
              </Button>
            </div>
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <CardLabel>Vote — phase {phase}</CardLabel>
              <Button
                size="sm"
                variant={game.vote_open ? "red" : "ghost"}
                onClick={() =>
                  startTransition(() => toggleVote(game.id, !game.vote_open))
                }
              >
                {game.vote_open ? "Close vote" : "Open vote"}
              </Button>
            </div>
            <VoteResults players={players} votes={phaseVotes} />
          </Card>

          <Card>
            <CardLabel>Clue drops</CardLabel>
            <div className="mt-2 space-y-2">
              {clues.length === 0 && (
                <p className="text-sm text-ink-muted">No clues configured.</p>
              )}
              {clues.map((c) => {
                const decided = c.clue_assignments.filter((a) => a.decided_at).length;
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-3 rounded-[10px] border-[0.5px] border-line bg-bg px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-ink">
                        {c.public_announcement}
                      </p>
                      <p className="text-[11px] text-ink-muted">
                        Phase {c.phase} · {decided}/2 decided
                      </p>
                    </div>
                    {c.released_at ? (
                      <Badge tone="green">Released</Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() =>
                          startTransition(() => releaseClue(game.id, c.id))
                        }
                      >
                        Release
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card tint="red">
            <CardLabel>Emergency</CardLabel>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" variant="ghost" onClick={() => setAnnounceOpen(true)}>
                Send announcement
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmRearm(true)}
              >
                Re-arm game
              </Button>
              <Button
                size="sm"
                variant="redOutline"
                onClick={() => setConfirmFinale(true)}
              >
                Skip to finale
              </Button>
            </div>
          </Card>
        </div>

        {/* RIGHT — activity feed + heatmap */}
        <div className="space-y-5">
          <Card>
            <CardLabel>Activity</CardLabel>
            <div className="mt-2 max-h-[320px] space-y-1.5 overflow-y-auto">
              {feed.length === 0 && (
                <p className="text-sm text-ink-muted">Quiet so far.</p>
              )}
              {feed.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ delay: i * 0.03, duration: 0.25, ease: "easeOut" }}
                  className="flex items-center gap-2.5 rounded-[8px] px-2 py-1.5 text-[13px]"
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      item.tone === "green" && "bg-green",
                      item.tone === "red" && "bg-red",
                      item.tone === "amber" && "bg-amber",
                      item.tone === "purple" && "bg-purple",
                      item.tone === "neutral" && "bg-white/30"
                    )}
                  />
                  <span className="flex-1 text-ink-secondary">{item.label}</span>
                  <span className="shrink-0 text-[11px] tabular-nums text-ink-muted">
                    {timeAgo(item.at)}
                  </span>
                </motion.div>
              ))}
            </div>
          </Card>

          <Card>
            <CardLabel>Interaction heat ({interactions.length} pairs)</CardLabel>
            <div className="mt-2 space-y-1.5">
              {interactions.length === 0 && (
                <p className="text-sm text-ink-muted">
                  No interactions tracked yet.
                </p>
              )}
              {[...interactions]
                .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
                .slice(0, 12)
                .map((it) => {
                  const max = Math.max(
                    1,
                    ...interactions.map((x) => x.count ?? 0)
                  );
                  return (
                    <div key={it.id} className="flex items-center gap-2 text-[13px]">
                      <span className="w-32 shrink-0 truncate text-ink-secondary">
                        {nameOf(it.player_a)} · {nameOf(it.player_b)}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-purple"
                          style={{ width: `${((it.count ?? 0) / max) * 100}%` }}
                        />
                      </div>
                      <span className="w-6 text-right tabular-nums text-ink-muted">
                        {it.count}
                      </span>
                    </div>
                  );
                })}
            </div>
          </Card>
        </div>
      </div>

      {/* Announcement modal */}
      <Modal
        open={announceOpen}
        onClose={() => setAnnounceOpen(false)}
        title="Announcement to all players"
      >
        <div className="space-y-3">
          <textarea
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            rows={3}
            autoFocus
            placeholder="This goes to every player's Intel tab…"
            className="w-full resize-none rounded-[10px] border-[0.5px] border-line bg-bg px-3 py-2.5 text-sm leading-6 text-ink placeholder:text-ink-muted focus:border-white/20 focus:outline-none"
          />
          <Button
            fullWidth
            disabled={!announcement.trim()}
            onClick={() =>
              startTransition(async () => {
                await sendAnnouncement(game.id, announcement);
                setAnnouncement("");
                setAnnounceOpen(false);
              })
            }
          >
            Send to all
          </Button>
        </div>
      </Modal>

      {/* Re-arm confirm */}
      <Modal
        open={confirmRearm}
        onClose={() => setConfirmRearm(false)}
        title="Re-arm for the real game?"
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-ink-secondary">
            Use this after a demo or walk-through. It resets the game to a clean
            start at phase 1:
          </p>
          <ul className="space-y-1.5 text-[13px] text-ink-secondary">
            <li className="text-green">• Memories restored to 100</li>
            <li className="text-red">
              • Clears clue decisions, revelations, votes, events, trust
              ratings, tips, interactions
            </li>
            <li className="text-ink-muted">
              • Keeps character sheets, clue setups, and claimed seats
            </li>
          </ul>
          <div className="flex flex-col gap-2">
            <Button
              variant="purple"
              fullWidth
              onClick={() =>
                startTransition(async () => {
                  await rearmGame(game.id);
                  setConfirmRearm(false);
                  router.refresh();
                })
              }
            >
              Re-arm — clean slate
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setConfirmRearm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Finale confirm */}
      <Modal
        open={confirmFinale}
        onClose={() => setConfirmFinale(false)}
        title="Skip to finale?"
      >
        <div className="space-y-4">
          <p className="text-sm text-ink-secondary">
            This ends the game and sends every player to the finale screen.
            There&apos;s no going back.
          </p>
          <div className="flex flex-col gap-2">
            <Button
              variant="purple"
              fullWidth
              onClick={() =>
                startTransition(async () => {
                  await skipToFinale(game.id);
                  router.push(`/finale/${game.id}`);
                })
              }
            >
              Start the finale
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setConfirmFinale(false)}>
              Not yet
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
