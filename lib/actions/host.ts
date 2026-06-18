"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function advancePhase(gameId: string, current: number) {
  const supabase = await createClient();
  await supabase
    .from("games")
    .update({ current_phase: current + 1, vote_open: false })
    .eq("id", gameId);
  revalidatePath(`/host/${gameId}`);
}

export async function setGatheringStatus(
  gameId: string,
  status: "active" | "dispersal"
) {
  const supabase = await createClient();
  await supabase.from("games").update({ status }).eq("id", gameId);
  revalidatePath(`/host/${gameId}`);
}

export async function toggleVote(gameId: string, open: boolean) {
  const supabase = await createClient();
  await supabase.from("games").update({ vote_open: open }).eq("id", gameId);
  revalidatePath(`/host/${gameId}`);
}

export async function releaseClue(gameId: string, clueId: string) {
  const supabase = await createClient();
  const { data: clue } = await supabase
    .from("clues")
    .select("id, phase, public_announcement, released_at")
    .eq("id", clueId)
    .single();
  if (!clue || clue.released_at) return;

  await supabase
    .from("clues")
    .update({ released_at: new Date().toISOString() })
    .eq("id", clueId);

  // Announce the drop to the whole group.
  await supabase.from("revelations").insert({
    game_id: gameId,
    phase: clue.phase,
    content: clue.public_announcement,
    type: "public",
    released: true,
    released_at: new Date().toISOString(),
  });
  revalidatePath(`/host/${gameId}`);
}

export async function sendAnnouncement(gameId: string, content: string) {
  if (!content.trim()) return;
  const supabase = await createClient();
  const { data: game } = await supabase
    .from("games")
    .select("current_phase")
    .eq("id", gameId)
    .single();
  await supabase.from("revelations").insert({
    game_id: gameId,
    phase: game?.current_phase ?? 0,
    content: content.trim(),
    type: "public",
    released: true,
    released_at: new Date().toISOString(),
  });
  revalidatePath(`/host/${gameId}`);
}

export async function skipToFinale(gameId: string) {
  const supabase = await createClient();
  await supabase
    .from("games")
    .update({ status: "finale", vote_open: false })
    .eq("id", gameId);
  revalidatePath(`/host/${gameId}`);
}

// Full re-arm — wipes every trace of a demo/explanation run so the real game
// starts clean, while PRESERVING the host's setup: character sheets, clue
// definitions, and which seats are claimed. Memory decay resumes from 100 on
// the next cron tick because the game is set back to active.
export async function rearmGame(gameId: string) {
  const supabase = await createClient();

  // Clear clue decisions and un-drop clues.
  const { data: clues } = await supabase
    .from("clues")
    .select("id")
    .eq("game_id", gameId);
  const clueIds = (clues ?? []).map((c) => c.id);
  if (clueIds.length) {
    await supabase
      .from("clue_assignments")
      .update({ decision: null, revealed_content: null, decided_at: null })
      .in("clue_id", clueIds);
  }
  await supabase
    .from("clues")
    .update({ released_at: null, auto_released: false })
    .eq("game_id", gameId);

  // Delete play-generated data (cascade handles story_event_players).
  await Promise.all([
    supabase.from("revelations").delete().eq("game_id", gameId),
    supabase.from("votes").delete().eq("game_id", gameId),
    supabase.from("story_events").delete().eq("game_id", gameId),
    supabase.from("trust_ratings").delete().eq("game_id", gameId),
    supabase.from("tips").delete().eq("game_id", gameId),
    supabase.from("interactions").delete().eq("game_id", gameId),
  ]);

  // Re-arm memories and stored scores; restart the clock at phase 1.
  await supabase
    .from("players")
    .update({
      memory_1_strength: 100,
      memory_2_strength: 100,
      memory_3_strength: 100,
      trust_score: 100,
    })
    .eq("game_id", gameId);

  await supabase
    .from("games")
    .update({ status: "active", current_phase: 1, vote_open: false })
    .eq("id", gameId);

  revalidatePath(`/host/${gameId}`);
}
