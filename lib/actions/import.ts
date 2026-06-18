"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensureSlots, createClue } from "@/lib/actions/setup";

// Shape of an accepted story file. Everything beyond `name` per character and
// the required clue fields is optional.
interface StoryCharacter {
  name?: unknown;
  role?: unknown;
  public_persona?: unknown;
  secret?: unknown;
  objective?: unknown;
  find?: unknown;
  find_question?: unknown;
  hide_description?: unknown;
  memories?: unknown;
}
interface StoryClueSide {
  character?: unknown;
  private_content?: unknown;
  implicates_self?: unknown;
}
interface StoryClue {
  phase?: unknown;
  public_announcement?: unknown;
  master_content?: unknown;
  implicating?: StoryClueSide;
  neutral?: StoryClueSide;
}
interface StoryFile {
  game?: { name?: unknown };
  characters?: unknown;
  clues?: unknown;
  phases?: unknown;
}

export interface ImportResult {
  ok: boolean;
  errors?: string[];
  phaseNotes?: Record<number, string>;
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

// Validates the payload fully and, if valid, returns a normalized view.
// Never throws on bad input — collects human-readable errors instead.
function validate(payload: unknown, maxSeats: number): {
  errors: string[];
  characters: { name: string; raw: StoryCharacter }[];
  clues: StoryClue[];
  names: Set<string>;
} {
  const errors: string[] = [];
  const characters: { name: string; raw: StoryCharacter }[] = [];
  const clues: StoryClue[] = [];
  const names = new Set<string>();

  if (!isObj(payload)) {
    errors.push("The file must be a JSON object.");
    return { errors, characters, clues, names };
  }
  const file = payload as StoryFile;

  // Characters
  if (!Array.isArray(file.characters) || file.characters.length === 0) {
    errors.push("`characters` must be a non-empty array.");
  } else {
    if (file.characters.length > maxSeats) {
      errors.push(
        `Too many characters (${file.characters.length}); this game has ${maxSeats} seats.`
      );
    }
    file.characters.forEach((c, i) => {
      const name = str((c as StoryCharacter)?.name);
      if (!name) {
        errors.push(`Character #${i + 1} is missing a "name".`);
        return;
      }
      if (names.has(name.toLowerCase())) {
        errors.push(`Duplicate character name "${name}".`);
        return;
      }
      names.add(name.toLowerCase());
      characters.push({ name, raw: c as StoryCharacter });
    });
  }

  const hasName = (v: unknown) => names.has(str(v).toLowerCase());

  // find references
  characters.forEach((c) => {
    const find = str(c.raw.find);
    if (find && !hasName(find)) {
      errors.push(`"${c.name}" wants to find "${find}", who isn't a character.`);
    }
  });

  // Clues
  if (file.clues !== undefined) {
    if (!Array.isArray(file.clues)) {
      errors.push("`clues` must be an array.");
    } else {
      file.clues.forEach((raw, i) => {
        const c = raw as StoryClue;
        const tag = `Clue #${i + 1}`;
        const phase = Number(c.phase);
        if (!Number.isInteger(phase) || phase < 1 || phase > 5)
          errors.push(`${tag}: "phase" must be an integer 1–5.`);
        if (!str(c.public_announcement))
          errors.push(`${tag}: "public_announcement" is required.`);
        if (!str(c.master_content))
          errors.push(`${tag}: "master_content" is required.`);
        const imp = c.implicating;
        const neu = c.neutral;
        if (!isObj(imp) || !str(imp.character) || !str(imp.private_content))
          errors.push(`${tag}: "implicating" needs a character and private_content.`);
        else if (!hasName(imp.character))
          errors.push(`${tag}: implicating character "${str(imp.character)}" isn't a character.`);
        if (!isObj(neu) || !str(neu.character) || !str(neu.private_content))
          errors.push(`${tag}: "neutral" needs a character and private_content.`);
        else if (!hasName(neu.character))
          errors.push(`${tag}: neutral character "${str(neu.character)}" isn't a character.`);
        if (isObj(imp) && isObj(neu) && str(imp.character) && str(imp.character).toLowerCase() === str(neu.character).toLowerCase())
          errors.push(`${tag}: implicating and neutral must be different characters.`);
        clues.push(c);
      });
    }
  }

  return { errors, characters, clues, names };
}

export async function importStory(
  gameId: string,
  payload: unknown
): Promise<ImportResult> {
  const supabase = await createClient();

  const { data: game } = await supabase
    .from("games")
    .select("seat_count")
    .eq("id", gameId)
    .single();
  const maxSeats = game?.seat_count ?? 16;

  const { errors, characters, clues } = validate(payload, maxSeats);
  if (errors.length) return { ok: false, errors };

  await ensureSlots(gameId);

  const { data: seats, error: seatErr } = await supabase
    .from("players")
    .select("id")
    .eq("game_id", gameId)
    .order("joined_at", { ascending: true });
  if (seatErr) return { ok: false, errors: [seatErr.message] };
  if (!seats || seats.length < characters.length)
    return { ok: false, errors: ["Not enough seats to import these characters."] };

  // Map each character (in order) to a seat, keyed by lowercased name.
  const nameToSeat = new Map<string, string>();
  characters.forEach((c, i) => nameToSeat.set(c.name.toLowerCase(), seats[i].id));

  // Replace: remove existing clues (cascade clears clue_assignments).
  await supabase.from("clues").delete().eq("game_id", gameId);

  // Reset every seat's character config (preserve user_id / name / joined_at).
  const blank = {
    character_name: null,
    role: null,
    public_persona: null,
    secret: null,
    objective: null,
    find_player_id: null,
    find_question: null,
    hide_description: null,
    memory_1: null,
    memory_2: null,
    memory_3: null,
    memory_1_strength: 100,
    memory_2_strength: 100,
    memory_3_strength: 100,
  };
  await supabase.from("players").update(blank).eq("game_id", gameId);

  // Write each character onto its seat, resolving find -> find_player_id.
  for (const c of characters) {
    const memories = Array.isArray(c.raw.memories)
      ? (c.raw.memories as unknown[]).map(str)
      : [];
    const findName = str(c.raw.find).toLowerCase();
    const fields = {
      character_name: c.name,
      role: str(c.raw.role) || null,
      public_persona: str(c.raw.public_persona) || null,
      secret: str(c.raw.secret) || null,
      objective: str(c.raw.objective) || null,
      find_player_id: findName ? nameToSeat.get(findName) ?? null : null,
      find_question: str(c.raw.find_question) || null,
      hide_description: str(c.raw.hide_description) || null,
      memory_1: memories[0] || null,
      memory_2: memories[1] || null,
      memory_3: memories[2] || null,
    };
    const { error } = await supabase
      .from("players")
      .update(fields)
      .eq("id", nameToSeat.get(c.name.toLowerCase())!);
    if (error) return { ok: false, errors: [error.message] };
  }

  // Create clues via the shared helper.
  for (const c of clues) {
    const imp = c.implicating!;
    const neu = c.neutral!;
    await createClue(gameId, {
      phase: Number(c.phase),
      publicAnnouncement: str(c.public_announcement),
      masterContent: str(c.master_content),
      playerAId: nameToSeat.get(str(imp.character).toLowerCase())!,
      playerAContent: str(imp.private_content),
      playerAImplicatesSelf: imp.implicates_self === true,
      playerBId: nameToSeat.get(str(neu.character).toLowerCase())!,
      playerBContent: str(neu.private_content),
    });
  }

  // Optional game name.
  const file = payload as StoryFile;
  const gameName = str(file.game?.name);
  if (gameName) {
    await supabase.from("games").update({ name: gameName }).eq("id", gameId);
  }

  // Phase notes are client-side (localStorage) — return them for the modal.
  const phaseNotes: Record<number, string> = {};
  if (Array.isArray(file.phases)) {
    file.phases.forEach((p) => {
      const ph = p as { phase?: unknown; notes?: unknown };
      const n = Number(ph?.phase);
      const notes = str(ph?.notes);
      if (Number.isInteger(n) && notes) phaseNotes[n] = notes;
    });
  }

  revalidatePath(`/host/${gameId}/setup`);
  return { ok: true, phaseNotes };
}
