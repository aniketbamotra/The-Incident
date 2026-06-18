// Memory decay — run on a cron (~every 15 min during active games).
// Reduces each memory's strength by a random 8–12 points for players in games
// that are currently active. Clients subscribed to player rows re-render bars.
//
// Deploy:  supabase functions deploy memory-decay
// Schedule (SQL, via pg_cron + pg_net or the dashboard Schedules UI):
//   select cron.schedule('memory-decay','*/15 * * * *', $$ ... invoke ... $$);

import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Active games only.
  const { data: games } = await supabase
    .from("games")
    .select("id")
    .in("status", ["active", "dispersal"]);
  const gameIds = (games ?? []).map((g) => g.id);
  if (gameIds.length === 0) {
    return new Response(JSON.stringify({ updated: 0 }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: players } = await supabase
    .from("players")
    .select("id, memory_1_strength, memory_2_strength, memory_3_strength")
    .in("game_id", gameIds);

  const decay = () => 8 + Math.floor(Math.random() * 5); // 8..12
  const clamp = (n: number | null) => Math.max(0, (n ?? 100) - decay());

  let updated = 0;
  for (const p of players ?? []) {
    await supabase
      .from("players")
      .update({
        memory_1_strength: clamp(p.memory_1_strength),
        memory_2_strength: clamp(p.memory_2_strength),
        memory_3_strength: clamp(p.memory_3_strength),
      })
      .eq("id", p.id);
    updated++;
  }

  return new Response(JSON.stringify({ updated }), {
    headers: { "Content-Type": "application/json" },
  });
});
