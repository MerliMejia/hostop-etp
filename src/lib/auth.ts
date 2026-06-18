import { redirect } from "next/navigation";
import { createClient } from "./supabase-server";
import type { UserProfile } from "./types";

export async function getOptionalUserProfile() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { supabase, user: null, profile: null };
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("id, org_id, email, created_at")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    throw new Error(error?.message ?? "User profile was not found.");
  }

  return { supabase, user, profile: profile as UserProfile };
}

export async function getUserProfile() {
  const result = await getOptionalUserProfile();

  if (!result.user || !result.profile) {
    redirect("/login");
  }

  return result;
}
