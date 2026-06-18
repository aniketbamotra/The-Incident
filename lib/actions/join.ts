"use server";

import { redirect } from "next/navigation";
import { ensureAnonUser } from "@/lib/supabase/auth";

// Claims a seat in a game for the current (anonymous) user and routes to play.
// If `pid` is given (from a QR link) it claims that specific seat; otherwise it
// takes the next unclaimed seat.
export async function claimSeat(formData: FormData) {
  const code = String(formData.get("code") || "")
    .trim()
    .toUpperCase();
  const pid = String(formData.get("pid") || "").trim() || null;
  const name = String(formData.get("name") || "").trim();

  if (!name) return { error: "Enter your name." };

  const { supabase, user } = await ensureAnonUser();

  const { data: game } = await supabase
    .from("games")
    .select("id")
    .eq("code", code)
    .maybeSingle();
  if (!game) return { error: "Game not found." };

  // Already in this game? Go straight to play.
  const { data: mine } = await supabase
    .from("players")
    .select("id")
    .eq("game_id", game.id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (mine) redirect(`/play/${game.id}`);

  // Resolve the seat to claim.
  let seatId = pid;
  if (seatId) {
    const { data: seat } = await supabase
      .from("players")
      .select("id, user_id")
      .eq("id", seatId)
      .maybeSingle();
    if (!seat) return { error: "That seat doesn't exist." };
    if (seat.user_id && seat.user_id !== user.id)
      return { error: "That seat is already taken." };
  } else {
    const { data: open } = await supabase
      .from("players")
      .select("id")
      .eq("game_id", game.id)
      .is("user_id", null)
      .order("joined_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!open) return { error: "This game is full." };
    seatId = open.id;
  }

  const { error } = await supabase
    .from("players")
    .update({ user_id: user.id, name, joined_at: new Date().toISOString() })
    .eq("id", seatId);
  if (error) return { error: error.message };

  redirect(`/play/${game.id}`);
}
