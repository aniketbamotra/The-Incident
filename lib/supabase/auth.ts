import { createClient } from "./server";

// Returns the current user, signing in anonymously if there is no session yet.
// Requires "Anonymous sign-ins" to be enabled in the Supabase Auth settings.
export async function ensureAnonUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) return { supabase, user };

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;

  return { supabase, user: data.user! };
}
