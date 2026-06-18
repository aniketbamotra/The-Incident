import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureAnonUser } from "@/lib/supabase/auth";
import { PlayClient } from "@/components/play/PlayClient";
import type { ClueAssignment, Clue } from "@/lib/supabase/types";

export type StoryEventWithPlayers = {
  id: string;
  event_time: string | null;
  title: string;
  description: string | null;
  created_by: string | null;
  created_at: string | null;
  story_event_players: { player_id: string }[];
};

export type MyClue = ClueAssignment & { clues: Clue | null };

export default async function PlayPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const { user } = await ensureAnonUser();
  const supabase = await createClient();

  const { data: game } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .maybeSingle();
  if (!game) notFound();

  const { data: me } = await supabase
    .from("players")
    .select("*")
    .eq("game_id", gameId)
    .eq("user_id", user.id)
    .maybeSingle();
  // Not in this game yet — send them through the join flow.
  if (!me) redirect(`/join/${game.code}`);

  const [
    { data: players },
    { data: events },
    { data: revelations },
    { data: tips },
    { data: trust },
    { data: myClues },
    { data: myVote },
  ] = await Promise.all([
    supabase.from("players").select("*").eq("game_id", gameId),
    supabase
      .from("story_events")
      .select("id, event_time, title, description, created_by, created_at, story_event_players(player_id)")
      .eq("game_id", gameId)
      .order("created_at", { ascending: true }),
    supabase
      .from("revelations")
      .select("*")
      .eq("game_id", gameId)
      .eq("released", true)
      .order("released_at", { ascending: false }),
    supabase
      .from("tips")
      .select("id, content, recipient_id, created_at")
      .eq("game_id", gameId)
      .order("created_at", { ascending: false }),
    supabase.from("trust_ratings").select("*").eq("game_id", gameId),
    supabase
      .from("clue_assignments")
      .select("*, clues(*)")
      .eq("player_id", me.id),
    supabase
      .from("votes")
      .select("*")
      .eq("game_id", gameId)
      .eq("voter_id", me.id)
      .eq("phase", game.current_phase ?? 1)
      .maybeSingle(),
  ]);

  return (
    <PlayClient
      game={game}
      me={me}
      players={players ?? []}
      events={(events ?? []) as unknown as StoryEventWithPlayers[]}
      revelations={revelations ?? []}
      tips={tips ?? []}
      trust={trust ?? []}
      myClues={(myClues ?? []) as unknown as MyClue[]}
      myVote={myVote ?? null}
    />
  );
}
