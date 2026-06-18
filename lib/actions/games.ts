"use server";

import { redirect } from "next/navigation";
import { ensureAnonUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import {
  generateGameCode,
  MIN_SEATS,
  MAX_SEATS,
  DEFAULT_SEATS,
} from "@/lib/utils";

export async function createGame(formData: FormData) {
  const name = String(formData.get("name") || "").trim() || "The Incident";
  const rawSeats = Number(formData.get("seat_count"));
  const seatCount = Number.isFinite(rawSeats)
    ? Math.min(MAX_SEATS, Math.max(MIN_SEATS, Math.round(rawSeats)))
    : DEFAULT_SEATS;
  const { supabase, user } = await ensureAnonUser();

  // Retry a few times in case of a code collision (unlikely with 32^6 space).
  let gameId: string | null = null;
  for (let attempt = 0; attempt < 5 && !gameId; attempt++) {
    const code = generateGameCode();
    const { data, error } = await supabase
      .from("games")
      .insert({ name, code, host_id: user.id, status: "lobby", seat_count: seatCount })
      .select("id")
      .single();
    if (!error && data) gameId = data.id;
    else if (error && !error.message.includes("duplicate")) throw error;
  }

  if (!gameId) throw new Error("Could not create a game. Please try again.");
  redirect(`/host/${gameId}/setup`);
}

export async function joinByCode(formData: FormData) {
  const code = String(formData.get("code") || "")
    .trim()
    .toUpperCase();
  if (!code) return { error: "Enter a game code." };

  // Make sure the joiner has a session before they hit the join page.
  await ensureAnonUser();
  const supabase = await createClient();

  const { data: game } = await supabase
    .from("games")
    .select("id, code")
    .eq("code", code)
    .maybeSingle();

  if (!game) return { error: "No game found with that code." };
  redirect(`/join/${game.code}`);
}
