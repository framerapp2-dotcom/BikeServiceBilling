import { getShopId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { InventoryClient } from "@/components/inventory/inventory-client";

export default async function InventoryPage() {
  const supabase = await createClient();
  const shopId = await getShopId();
  const { data: items } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("shop_id", shopId)
    .order("name");
  return <InventoryClient items={items ?? []} />;
}
