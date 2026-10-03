"use server";

import { getShopId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createService(data: {
  name: string;
  description?: string;
  default_price: number;
  estimated_minutes?: number;
  status?: string;
}) {
  if (!data.name.trim()) return { error: "Service name is required" };
  const supabase = await createClient();
  const shopId = await getShopId();
  const { error } = await supabase.from("services").insert({
    shop_id: shopId,
    status: data.status ?? "active",
    ...data,
  });
  if (error) return { error: "Unable to save service" };
  revalidatePath("/app/services");
  return { success: true };
}

export async function updateService(
  id: string,
  data: { name: string; default_price: number }
) {
  if (!data.name.trim()) return { error: "Service name is required" };
  const supabase = await createClient();
  const shopId = await getShopId();
  const { error } = await supabase
    .from("services")
    .update({
      name: data.name.trim(),
      default_price: Number(data.default_price) || 0,
    })
    .eq("id", id)
    .eq("shop_id", shopId);
  if (error) return { error: "Unable to update service" };
  revalidatePath("/app/services");
  return { success: true };
}

export async function deleteService(id: string) {
  const supabase = await createClient();
  const shopId = await getShopId();
  await supabase.from("services").delete().eq("id", id).eq("shop_id", shopId);
  revalidatePath("/app/services");
  return { success: true };
}
