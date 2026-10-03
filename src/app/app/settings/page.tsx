import { getSessionUser, getShopId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "@/components/settings/settings-client";

export default async function SettingsPage() {
  const supabase = await createClient();
  const shopId = await getShopId();
  const [shopRes, user] = await Promise.all([
    supabase.from("shops").select("*").eq("id", shopId).single(),
    getSessionUser(),
  ]);
  return (
    <SettingsClient
      shop={shopRes.data}
      userEmail={user?.email ?? ""}
    />
  );
}
