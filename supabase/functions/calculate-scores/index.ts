// Score calculation — invoke when the host triggers the finale.
// Mirrors lib/scoring.ts and writes a final figure back to players.trust_score
// (reused as the stored final-score column, since the schema has no dedicated
// score field). The finale screen also computes scores live; this persists them.
//
// Deploy:  supabase functions deploy calculate-scores
// Invoke:  POST { game_id }

import { createClient } from "jsr:@supabase/supabase-js@2";

type Assignment = {
  player_id: string | null;
  decision: string | null;
  implicates_self: boolean | null;
};

function honestyRate(playerId: string, assignments: Assignment[]): number {
  const mine = assignments.filter((a) => a.player_id === playerId && a.decision);
  if (mine.length === 0) return 1;
  return mine.filter((a) => a.decision === "revealed").length / mine.length;
}

Deno.serve(async (req) => {
  const { game_id } = await req.json().catch(() => ({ game_id: null }));
  if (!game_id) return new Response("game_id required", { status: 400 });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const [{ data: players }, { data: clues }, { data: votes }, { data: trust }] =
    await Promise.all([
      supabase.from("players").select("*").eq("game_id", game_id),
      supabase.from("clues").select("id, clue_assignments(*)").eq("game_id", game_id),
      supabase.from("votes").select("*").eq("game_id", game_id),
      supabase.from("trust_ratings").select("*").eq("game_id", game_id),
    ]);

  const assignments: Assignment[] = (clues ?? []).flatMap(
    (c: { clue_assignments: Assignment[] }) => c.clue_assignments
  );

  // Derive the culprit: most self-implicating clues received.
  const implicateCounts = new Map<string, number>();
  assignments
    .filter((a) => a.implicates_self && a.player_id)
    .forEach((a) =>
      implicateCounts.set(a.player_id!, (implicateCounts.get(a.player_id!) ?? 0) + 1)
    );
  let culpritId: string | null = null;
  let max = 0;
  implicateCounts.forEach((c, id) => {
    if (c > max) {
      max = c;
      culpritId = id;
    }
  });

  for (const p of players ?? []) {
    const mine = assignments.filter((a) => a.player_id === p.id && a.decision);
    const reveals = mine.filter((a) => a.decision === "revealed").length;
    const lies = mine.filter((a) => a.decision === "hidden").length;
    const myImplicating = mine.filter((a) => a.implicates_self);
    const objectiveMet =
      myImplicating.length > 0 && myImplicating.every((a) => a.decision === "revealed");
    const correctVotes = (votes ?? []).filter(
      (v) => v.voter_id === p.id && culpritId && v.suspect_id === culpritId
    ).length;

    const myRatings = (trust ?? []).filter((t) => t.rater_id === p.id);
    let trustAccuracy = 0;
    if (myRatings.length > 0) {
      const closeness =
        myRatings.reduce((sum, t) => {
          const real = honestyRate(t.rated_id ?? "", assignments);
          return sum + (1 - Math.abs(t.score / 100 - real));
        }, 0) / myRatings.length;
      trustAccuracy = Math.round(closeness * 150);
    }

    const score =
      (objectiveMet ? 300 : 0) +
      correctVotes * 50 +
      reveals * 100 +
      trustAccuracy -
      lies * 75;

    await supabase.from("players").update({ trust_score: score }).eq("id", p.id);
  }

  return new Response(JSON.stringify({ scored: (players ?? []).length }), {
    headers: { "Content-Type": "application/json" },
  });
});
