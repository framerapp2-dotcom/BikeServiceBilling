import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cache } from "react";

export const getSessionUser = cache(async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export const getProfile = cache(async function getProfile() {
  const supabase = await createClient();
  const user = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, shops(*)")
    .eq("id", user.id)
    .single();
  return profile;
});

export async function getShopId(): Promise<string> {
  const profile = await getProfile();
  if (!profile?.shop_id) {
    throw new Error("Shop not configured for this user");
  }
  return profile.shop_id as string;
}
