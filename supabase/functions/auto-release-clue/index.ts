// Auto-release fallback for clue decisions.
// The reveal/hide flow already releases content inline (see lib/actions/clue.ts),
// but this function can be invoked to reconcile any clue whose two assignments
// are both decided yet never produced a group revelation — e.g. if a client
// dropped mid-decision.
//
// Deploy:  supabase functions deploy auto-release-clue
// Invoke:  POST { clue_id }

import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const { clue_id } = await req.json().catch(() => ({ clue_id: null }));
  if (!clue_id) return new Response("clue_id required", { status: 400 });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: clue } = await supabase
    .from("clues")
    .select("id, game_id, phase, auto_released")
    .eq("id", clue_id)
    .single();
  if (!clue || clue.auto_released)
    return new Response(JSON.stringify({ skipped: true }), {
      headers: { "Content-Type": "application/json" },
    });

  const { data: assignments } = await supabase
    .from("clue_assignments")
    .select("decision, version, private_content")
    .eq("clue_id", clue_id);

  if (!assignments || assignments.length !== 2 || assignments.some((a) => !a.decision))
    return new Response(JSON.stringify({ skipped: true }), {
      headers: { "Content-Type": "application/json" },
    });

  // Both hid → release the neutral version with no attribution.
  if (assignments.every((a) => a.decision === "hidden")) {
    const neutral = assignments.find((a) => a.version === "neutral");
    await supabase.from("revelations").insert({
      game_id: clue.game_id,
      phase: clue.phase,
      content: neutral?.private_content ?? "",
      type: "public",
      released: true,
      released_at: new Date().toISOString(),
    });
    await supabase.from("clues").update({ auto_released: true }).eq("id", clue_id);
  }

  return new Response(JSON.stringify({ released: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
