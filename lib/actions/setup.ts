"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TablesUpdate } from "@/lib/supabase/types";

const SLOT_COUNT = 16;

// Ensures the game has exactly SLOT_COUNT player slots. Slots start unclaimed
// (user_id = null) and are filled in by the host during setup; a player claims
// one on join via the QR link.
export async function ensureSlots(gameId: string) {
  const supabase = await createClient();
  const { data: existing, error } = await supabase
    .from("players")
    .select("id")
    .eq("game_id", gameId);
  if (error) throw error;

  const have = existing?.length ?? 0;
  const missing = SLOT_COUNT - have;
  if (missing > 0) {
    // Stagger joined_at so seat order is stable — "next open seat" on join is
    // then deterministic (seat 1 first), not dependent on insert tie-breaks.
    const base = Date.now();
    const rows = Array.from({ length: missing }, (_, i) => ({
      game_id: gameId,
      name: `Seat ${have + i + 1}`,
      joined_at: new Date(base + (have + i) * 1000).toISOString(),
    }));
    const { error: insErr } = await supabase.from("players").insert(rows);
    if (insErr) throw insErr;
  }
}

export async function saveCharacter(
  gameId: string,
  playerId: string,
  fields: TablesUpdate<"players">
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("players")
    .update(fields)
    .eq("id", playerId);
  if (error) throw error;
  revalidatePath(`/host/${gameId}/setup`);
}

interface ClueInput {
  phase: number;
  publicAnnouncement: string;
  masterContent: string;
  playerAId: string;
  playerAContent: string;
  playerAImplicatesSelf: boolean;
  playerBId: string;
  playerBContent: string;
}

export async function createClue(gameId: string, input: ClueInput) {
  const supabase = await createClient();

  const { data: clue, error } = await supabase
    .from("clues")
    .insert({
      game_id: gameId,
      phase: input.phase,
      public_announcement: input.publicAnnouncement,
      master_content: input.masterContent,
    })
    .select("id")
    .single();
  if (error) throw error;

  const { error: aErr } = await supabase.from("clue_assignments").insert([
    {
      clue_id: clue.id,
      player_id: input.playerAId,
      version: "implicating",
      private_content: input.playerAContent,
      implicates_self: input.playerAImplicatesSelf,
    },
    {
      clue_id: clue.id,
      player_id: input.playerBId,
      version: "neutral",
      private_content: input.playerBContent,
      implicates_self: false,
    },
  ]);
  if (aErr) throw aErr;

  revalidatePath(`/host/${gameId}/setup`);
  return clue.id;
}

export async function deleteClue(gameId: string, clueId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("clues").delete().eq("id", clueId);
  if (error) throw error;
  revalidatePath(`/host/${gameId}/setup`);
}

export async function launchGame(gameId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("games")
    .update({ status: "active", current_phase: 1 })
    .eq("id", gameId);
  if (error) throw error;
  revalidatePath(`/host/${gameId}`);
}
