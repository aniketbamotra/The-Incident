"use server";

import { createClient } from "@/lib/supabase/server";

// Records (or bumps) an interaction edge between two players. Order-independent
// so a pair always maps to one row. Silent — players never see this until finale.
async function bumpInteraction(
  supabase: Awaited<ReturnType<typeof createClient>>,
  gameId: string,
  a: string,
  b: string
) {
  if (a === b) return;
  const [player_a, player_b] = [a, b].sort();
  const { data: existing } = await supabase
    .from("interactions")
    .select("id, count")
    .eq("game_id", gameId)
    .eq("player_a", player_a)
    .eq("player_b", player_b)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("interactions")
      .update({
        count: (existing.count ?? 1) + 1,
        last_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("interactions")
      .insert({ game_id: gameId, player_a, player_b });
  }
}

export async function addStoryEvent(input: {
  gameId: string;
  authorId: string;
  eventTime: string;
  title: string;
  description: string;
  attachedPlayerIds: string[];
}) {
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("story_events")
    .insert({
      game_id: input.gameId,
      created_by: input.authorId,
      event_time: input.eventTime || null,
      title: input.title,
      description: input.description || null,
    })
    .select("id")
    .single();
  if (error) throw error;

  const attached = input.attachedPlayerIds.filter(Boolean);
  if (attached.length) {
    await supabase.from("story_event_players").insert(
      attached.map((pid) => ({ event_id: event.id, player_id: pid }))
    );
    // Tagging someone is a social interaction.
    for (const pid of attached) {
      await bumpInteraction(supabase, input.gameId, input.authorId, pid);
    }
  }
  return event.id;
}

export async function setTrustRating(input: {
  gameId: string;
  raterId: string;
  ratedId: string;
  score: number;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("trust_ratings").upsert(
    {
      game_id: input.gameId,
      rater_id: input.raterId,
      rated_id: input.ratedId,
      score: input.score,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "rater_id,rated_id" }
  );
  if (error) throw error;
  await bumpInteraction(supabase, input.gameId, input.raterId, input.ratedId);
}

export async function sendTip(input: {
  gameId: string;
  senderId: string;
  content: string;
  recipientId: string | null;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("tips").insert({
    game_id: input.gameId,
    sender_id: input.senderId,
    content: input.content,
    recipient_id: input.recipientId,
  });
  if (error) throw error;
  if (input.recipientId) {
    await bumpInteraction(
      supabase,
      input.gameId,
      input.senderId,
      input.recipientId
    );
  }
}

export async function castVote(input: {
  gameId: string;
  phase: number;
  voterId: string;
  suspectId: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("votes").upsert(
    {
      game_id: input.gameId,
      phase: input.phase,
      voter_id: input.voterId,
      suspect_id: input.suspectId,
    },
    { onConflict: "game_id,phase,voter_id" }
  );
  if (error) throw error;
}
