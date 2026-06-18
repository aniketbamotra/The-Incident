import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureAnonUser } from "@/lib/supabase/auth";
import { FinaleClient } from "@/components/finale/FinaleClient";
import type { ClueWithAssignments } from "@/components/host/SetupClient";

export type FinaleEvent = {
  id: string;
  event_time: string | null;
  title: string;
  description: string | null;
  created_by: string | null;
  story_event_players: { player_id: string }[];
};

export default async function FinalePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  await ensureAnonUser();
  const supabase = await createClient();

  const { data: game } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .maybeSingle();
  if (!game) notFound();

  const [
    { data: players },
    { data: clues },
    { data: events },
    { data: votes },
    { data: trust },
    { data: interactions },
  ] = await Promise.all([
    supabase.from("players").select("*").eq("game_id", gameId),
    supabase
      .from("clues")
      .select("*, clue_assignments(*)")
      .eq("game_id", gameId)
      .order("phase", { ascending: true }),
    supabase
      .from("story_events")
      .select("id, event_time, title, description, created_by, story_event_players(player_id)")
      .eq("game_id", gameId)
      .order("created_at", { ascending: true }),
    supabase.from("votes").select("*").eq("game_id", gameId),
    supabase.from("trust_ratings").select("*").eq("game_id", gameId),
    supabase.from("interactions").select("*").eq("game_id", gameId),
  ]);

  return (
    <FinaleClient
      game={game}
      players={players ?? []}
      clues={(clues ?? []) as unknown as ClueWithAssignments[]}
      events={(events ?? []) as unknown as FinaleEvent[]}
      votes={votes ?? []}
      trust={trust ?? []}
      interactions={interactions ?? []}
    />
  );
}
