"use server";

import { getShopId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createInventoryItem(data: {
  name: string;
  item_type: string;
  description?: string;
  quantity: number;
  unit?: string;
  purchase_price?: number;
  selling_price: number;
  low_stock_threshold?: number;
  supplier?: string;
}) {
  if (!data.name.trim()) return { error: "Item name is required" };
  const supabase = await createClient();
  const shopId = await getShopId();
  const { error } = await supabase.from("inventory_items").insert({
    shop_id: shopId,
    unit: data.unit ?? "pcs",
    purchase_price: data.purchase_price ?? 0,
    low_stock_threshold: data.low_stock_threshold ?? 5,
    ...data,
  });
  if (error) return { error: "Unable to save item" };
  revalidatePath("/app/inventory");
  return { success: true };
}

export async function adjustStock(id: string, delta: number) {
  const supabase = await createClient();
  const shopId = await getShopId();
  const { data: item } = await supabase
    .from("inventory_items")
    .select("quantity")
    .eq("id", id)
    .eq("shop_id", shopId)
    .single();
  if (!item) return { error: "Item not found" };
  const qty = Math.max(0, Number(item.quantity) + delta);
  await supabase.from("inventory_items").update({ quantity: qty }).eq("id", id);
  await supabase.from("activity_logs").insert({
    shop_id: shopId,
    message: "Inventory item updated",
    entity_type: "inventory",
    entity_id: id,
  });
  revalidatePath("/app/inventory");
  return { success: true };
}

export async function deleteInventoryItem(id: string) {
  const supabase = await createClient();
  const shopId = await getShopId();
  await supabase.from("inventory_items").delete().eq("id", id).eq("shop_id", shopId);
  revalidatePath("/app/inventory");
  return { success: true };
}
