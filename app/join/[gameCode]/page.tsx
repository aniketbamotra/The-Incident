import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JoinClient } from "@/components/JoinClient";

export default async function JoinPage({
  params,
  searchParams,
}: {
  params: Promise<{ gameCode: string }>;
  searchParams: Promise<{ pid?: string }>;
}) {
  const { gameCode } = await params;
  const { pid } = await searchParams;
  const code = gameCode.toUpperCase();

  const supabase = await createClient();
  const { data: game } = await supabase
    .from("games")
    .select("id, name, code, status")
    .eq("code", code)
    .maybeSingle();
  if (!game) notFound();

  // If a seat is pre-assigned via QR, surface its character name as a hint.
  let seatHint: string | null = null;
  if (pid) {
    const { data: seat } = await supabase
      .from("players")
      .select("character_name")
      .eq("id", pid)
      .maybeSingle();
    seatHint = seat?.character_name ?? null;
  }

  return (
    <JoinClient
      gameName={game.name}
      code={game.code}
      pid={pid ?? null}
      seatHint={seatHint}
    />
  );
}
