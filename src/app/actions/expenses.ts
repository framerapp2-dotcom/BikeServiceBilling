"use server";

import { getShopId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createExpense(data: {
  title: string;
  category: string;
  amount: number;
  expense_date: string;
  payment_method?: string;
  description?: string;
}) {
  if (!data.title.trim()) return { error: "Title is required" };
  if (data.amount < 0) return { error: "Amount cannot be negative" };
  const supabase = await createClient();
  const shopId = await getShopId();
  const { error } = await supabase.from("expenses").insert({
    shop_id: shopId,
    ...data,
  });
  if (error) return { error: "Unable to save expense" };
  revalidatePath("/app/expenses");
  revalidatePath("/app/dashboard");
  return { success: true };
}

export async function deleteExpense(id: string) {
  const supabase = await createClient();
  const shopId = await getShopId();
  await supabase.from("expenses").delete().eq("id", id).eq("shop_id", shopId);
  revalidatePath("/app/expenses");
  return { success: true };
}
