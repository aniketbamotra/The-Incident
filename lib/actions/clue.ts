"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Records a player's reveal/hide decision and runs the group-facing release
// logic per the spec:
//   - reveal  → the player's content is published to the group immediately
//   - both hide → the neutral version is auto-released with no attribution
export async function decideClue(input: {
  gameId: string;
  assignmentId: string;
  decision: "revealed" | "hidden";
}) {
  const supabase = await createClient();

  // Load my assignment to know the clue and my content.
  const { data: mine, error: mineErr } = await supabase
    .from("clue_assignments")
    .select("id, clue_id, private_content, version")
    .eq("id", input.assignmentId)
    .single();
  if (mineErr) throw mineErr;

  const { data: clue } = await supabase
    .from("clues")
    .select("id, phase")
    .eq("id", mine.clue_id!)
    .single();

  const revealedContent =
    input.decision === "revealed" ? mine.private_content : null;

  const { error: updErr } = await supabase
    .from("clue_assignments")
    .update({
      decision: input.decision,
      revealed_content: revealedContent,
      decided_at: new Date().toISOString(),
    })
    .eq("id", input.assignmentId);
  if (updErr) throw updErr;

  // Revealing publishes the shared content to the group right away.
  if (input.decision === "revealed" && clue) {
    await supabase.from("revelations").insert({
      game_id: input.gameId,
      phase: clue.phase,
      content: mine.private_content,
      type: "public",
      released: true,
      released_at: new Date().toISOString(),
    });
  }

  // If both players have now decided and BOTH hid, auto-release the neutral
  // version with no attribution.
  const { data: siblings } = await supabase
    .from("clue_assignments")
    .select("decision, version, private_content")
    .eq("clue_id", mine.clue_id!);

  if (siblings && siblings.length === 2) {
    const allDecided = siblings.every((s) => s.decision);
    const allHidden = siblings.every((s) => s.decision === "hidden");
    if (allDecided && allHidden && clue) {
      const neutral = siblings.find((s) => s.version === "neutral");
      await supabase.from("revelations").insert({
        game_id: input.gameId,
        phase: clue.phase,
        content: neutral?.private_content ?? "",
        type: "public",
        released: true,
        released_at: new Date().toISOString(),
      });
      await supabase
        .from("clues")
        .update({ auto_released: true })
        .eq("id", clue.id);
    }
  }

  revalidatePath(`/play/${input.gameId}`);
}
