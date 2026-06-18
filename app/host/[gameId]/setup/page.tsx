import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureSlots } from "@/lib/actions/setup";
import { SetupClient, type ClueWithAssignments } from "@/components/host/SetupClient";

export default async function SetupPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const supabase = await createClient();

  const { data: game } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .maybeSingle();
  if (!game) notFound();

  await ensureSlots(gameId);

  const [{ data: players }, { data: clues }] = await Promise.all([
    supabase
      .from("players")
      .select("*")
      .eq("game_id", gameId)
      .order("joined_at", { ascending: true }),
    supabase
      .from("clues")
      .select("*, clue_assignments(*)")
      .eq("game_id", gameId)
      .order("phase", { ascending: true }),
  ]);

  return (
    <SetupClient
      game={game}
      players={players ?? []}
      clues={(clues ?? []) as unknown as ClueWithAssignments[]}
    />
  );
}
