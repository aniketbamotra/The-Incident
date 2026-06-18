import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureAnonUser } from "@/lib/supabase/auth";
import { LiveDashboard } from "@/components/host/LiveDashboard";
import type { ClueWithAssignments } from "@/components/host/SetupClient";

export default async function HostDashboardPage({
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
    { data: votes },
    { data: events },
    { data: revelations },
    { data: tips },
    { data: interactions },
  ] = await Promise.all([
    supabase.from("players").select("*").eq("game_id", gameId),
    supabase
      .from("clues")
      .select("*, clue_assignments(*)")
      .eq("game_id", gameId)
      .order("phase", { ascending: true }),
    supabase.from("votes").select("*").eq("game_id", gameId),
    supabase
      .from("story_events")
      .select("id, title, event_time, created_by, created_at")
      .eq("game_id", gameId)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("revelations")
      .select("*")
      .eq("game_id", gameId)
      .order("released_at", { ascending: false })
      .limit(30),
    supabase
      .from("tips")
      .select("id, created_at, recipient_id")
      .eq("game_id", gameId)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase.from("interactions").select("*").eq("game_id", gameId),
  ]);

  return (
    <LiveDashboard
      game={game}
      players={players ?? []}
      clues={(clues ?? []) as unknown as ClueWithAssignments[]}
      votes={votes ?? []}
      events={events ?? []}
      revelations={revelations ?? []}
      tips={tips ?? []}
      interactions={interactions ?? []}
    />
  );
}
