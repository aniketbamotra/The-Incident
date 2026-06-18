import type { Player, Vote, TrustRating, Interaction } from "@/lib/supabase/types";

// The schema doesn't store a designated culprit, objective-completion flag, or a
// per-clue "truth" verdict, so scoring is derived from observable behaviour with
// these documented proxies:
//   - honest reveal  = a clue decision of "revealed"        (+100 each)
//   - lie / withhold = a clue decision of "hidden"          (−75 each)
//   - culprit        = the player who received the most self-implicating clues
//   - correct vote   = voting for that derived culprit       (+50 each)
//   - trust accuracy = how closely your ratings tracked each
//                      player's actual honesty rate          (up to +150)
//   - objective met  = +300 if the player honestly revealed
//                      every implicating clue they received  (proxy)

export type ClueAssignmentLite = {
  player_id: string | null;
  decision: string | null;
  implicates_self: boolean | null;
};

export type PlayerScore = {
  player: Player;
  score: number;
  reveals: number;
  lies: number;
  correctVotes: number;
  trustAccuracy: number;
  objectiveMet: boolean;
  interactions: number;
  honesty: number; // 0..1
  keyLine: string;
};

export function honestyRate(
  playerId: string,
  assignments: ClueAssignmentLite[]
): number {
  const mine = assignments.filter((a) => a.player_id === playerId && a.decision);
  if (mine.length === 0) return 1;
  const revealed = mine.filter((a) => a.decision === "revealed").length;
  return revealed / mine.length;
}

export function deriveCulpritId(
  assignments: ClueAssignmentLite[]
): string | null {
  const counts = new Map<string, number>();
  assignments
    .filter((a) => a.implicates_self && a.player_id)
    .forEach((a) => counts.set(a.player_id!, (counts.get(a.player_id!) ?? 0) + 1));
  let best: string | null = null;
  let max = 0;
  counts.forEach((c, id) => {
    if (c > max) {
      max = c;
      best = id;
    }
  });
  return best;
}

export function computeScores(input: {
  players: Player[];
  assignments: ClueAssignmentLite[];
  votes: Vote[];
  trust: TrustRating[];
  interactions: Interaction[];
}): PlayerScore[] {
  const { players, assignments, votes, trust, interactions } = input;
  const culpritId = deriveCulpritId(assignments);

  const scored = players
    .filter((p) => p.user_id || p.character_name?.trim())
    .map<PlayerScore>((p) => {
      const mine = assignments.filter((a) => a.player_id === p.id && a.decision);
      const reveals = mine.filter((a) => a.decision === "revealed").length;
      const lies = mine.filter((a) => a.decision === "hidden").length;
      const honesty = honestyRate(p.id, assignments);

      const myImplicating = mine.filter((a) => a.implicates_self);
      const objectiveMet =
        myImplicating.length > 0 &&
        myImplicating.every((a) => a.decision === "revealed");

      const correctVotes = votes.filter(
        (v) => v.voter_id === p.id && culpritId && v.suspect_id === culpritId
      ).length;

      // Trust accuracy: average closeness of my ratings to real honesty.
      const myRatings = trust.filter((t) => t.rater_id === p.id);
      let trustAccuracy = 0;
      if (myRatings.length > 0) {
        const closeness =
          myRatings.reduce((sum, t) => {
            const realHonesty = honestyRate(t.rated_id ?? "", assignments);
            return sum + (1 - Math.abs(t.score / 100 - realHonesty));
          }, 0) / myRatings.length;
        trustAccuracy = Math.round(closeness * 150);
      }

      const myInteractions = interactions
        .filter((it) => it.player_a === p.id || it.player_b === p.id)
        .reduce((sum, it) => sum + (it.count ?? 0), 0);

      const score =
        (objectiveMet ? 300 : 0) +
        correctVotes * 50 +
        reveals * 100 +
        trustAccuracy -
        lies * 75;

      const keyLine = objectiveMet
        ? "Met their objective"
        : lies > reveals
          ? `Withheld ${lies} clue${lies === 1 ? "" : "s"}`
          : reveals > 0
            ? `Came clean ${reveals} time${reveals === 1 ? "" : "s"}`
            : "Kept to the shadows";

      return {
        player: p,
        score,
        reveals,
        lies,
        correctVotes,
        trustAccuracy,
        objectiveMet,
        interactions: myInteractions,
        honesty,
        keyLine,
      };
    });

  return scored.sort((a, b) => b.score - a.score);
}
