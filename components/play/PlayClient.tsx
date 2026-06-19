"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type {
  Game,
  Player,
  Revelation,
  TrustRating,
  Vote,
} from "@/lib/supabase/types";
import type { StoryEventWithPlayers, MyClue } from "@/app/play/[gameId]/page";
import { CharacterReveal } from "./CharacterReveal";
import { GatheringBanner } from "./GatheringBanner";
import { TabBar, type PlayTab } from "./TabBar";
import { YouTab } from "./YouTab";
import { EventsTab } from "./EventsTab";
import { TrustTab } from "./TrustTab";
import { IntelTab } from "./IntelTab";
import { TipsTab, type VisibleTip } from "./TipsTab";
import { VoteModal } from "./VoteModal";

export function PlayClient({
  game,
  me,
  players,
  events,
  revelations,
  tips,
  trust,
  myClues,
  myVote,
}: {
  game: Game;
  me: Player;
  players: Player[];
  events: StoryEventWithPlayers[];
  revelations: Revelation[];
  tips: VisibleTip[];
  trust: TrustRating[];
  myClues: MyClue[];
  myVote: Vote | null;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<PlayTab>("you");
  const [revealed, setRevealed] = useState<boolean | null>(null);
  const [gatheringDismissed, setGatheringDismissed] = useState<string | null>(null);

  const target = players.find((p) => p.id === me.find_player_id) ?? null;

  // Reveal gate — show the character intro once per device.
  useEffect(() => {
    setRevealed(localStorage.getItem(`incident-revealed-${me.id}`) === "1");
  }, [me.id]);

  // Realtime: any change to the game's live tables re-fetches server data.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`game-${game.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "games", filter: `id=eq.${game.id}` },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "story_events", filter: `game_id=eq.${game.id}` },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "revelations", filter: `game_id=eq.${game.id}` },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tips", filter: `game_id=eq.${game.id}` },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "clue_assignments", filter: `player_id=eq.${me.id}` },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [game.id, me.id, router]);

  // Finale started — send everyone to the finale screen.
  useEffect(() => {
    if (game.status === "finale") router.push(`/finale/${game.id}`);
  }, [game.status, game.id, router]);

  if (revealed === null) return null; // avoid reveal flash before localStorage read
  if (!revealed) {
    return (
      <CharacterReveal
        me={me}
        targetName={target?.character_name || target?.name || null}
        onDone={() => {
          localStorage.setItem(`incident-revealed-${me.id}`, "1");
          setRevealed(true);
        }}
      />
    );
  }

  const showGathering =
    game.status === "dispersal" && gatheringDismissed !== game.status;
  const pendingClueCount = myClues.filter(
    (c) => c.clues?.released_at && !c.decision
  ).length;

  return (
    <div className="flex min-h-screen flex-col">
      <AnimatePresence>
        {showGathering && (
          <GatheringBanner onDismiss={() => setGatheringDismissed(game.status!)} />
        )}
      </AnimatePresence>

      <main className="mx-auto w-full max-w-md flex-1 px-5 py-5 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {tab === "you" && <YouTab me={me} target={target} />}
            {tab === "events" && (
              <EventsTab gameId={game.id} me={me} players={players} events={events} />
            )}
            {tab === "trust" && (
              <TrustTab gameId={game.id} me={me} players={players} trust={trust} />
            )}
            {tab === "intel" && (
              <IntelTab gameId={game.id} revelations={revelations} myClues={myClues} />
            )}
            {tab === "tips" && (
              <TipsTab gameId={game.id} me={me} players={players} tips={tips} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <TabBar active={tab} onChange={setTab} intelBadge={pendingClueCount} />

      <VoteModal
        open={!!game.vote_open}
        gameId={game.id}
        phase={game.current_phase ?? 1}
        me={me}
        players={players}
        existingVote={myVote}
      />
    </div>
  );
}
