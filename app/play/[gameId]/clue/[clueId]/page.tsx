import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureAnonUser } from "@/lib/supabase/auth";
import { ClueScreen } from "@/components/clue/ClueScreen";
import type { Clue } from "@/lib/supabase/types";

// Note: [clueId] in the URL is the clue_assignment id (this player's row).
export default async function CluePage({
  params,
}: {
  params: Promise<{ gameId: string; clueId: string }>;
}) {
  const { gameId, clueId } = await params;
  await ensureAnonUser();
  const supabase = await createClient();

  const { data: assignment } = await supabase
    .from("clue_assignments")
    .select("*, clues(*)")
    .eq("id", clueId)
    .maybeSingle();

  const clue = (assignment as unknown as { clues: Clue | null })?.clues ?? null;
  if (!assignment || !clue) notFound();

  // The clue must have actually dropped before it can be acted on.
  if (!clue.released_at) redirect(`/play/${gameId}`);

  const { data: partnerName } = await supabase.rpc("clue_partner_name", {
    assignment_id: clueId,
  });

  return (
    <ClueScreen
      gameId={gameId}
      assignment={assignment}
      clue={clue}
      partnerName={(partnerName as string | null) ?? null}
    />
  );
}
