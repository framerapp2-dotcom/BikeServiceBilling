"use server";

import { getShopId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateShopProfile(data: {
  name?: string;
  tagline?: string;
  phone?: string;
  email?: string;
  address?: string;
  upi_id?: string;
  invoice_footer?: string;
  invoice_prefix?: string;
  show_tax?: boolean;
  tax_rate?: number;
  show_discount?: boolean;
}) {
  const supabase = await createClient();
  const shopId = await getShopId();
  const { error } = await supabase.from("shops").update(data).eq("id", shopId);
  if (error) return { error: "Unable to update shop profile" };
  revalidatePath("/app/settings");
  revalidatePath("/app/invoices");
  return { success: true };
}
