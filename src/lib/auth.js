import { supabase } from "./supabase";

export async function getCurrentUserRole() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.log(profileError);
    return null;
  }

  return profile?.role ?? null;
}
