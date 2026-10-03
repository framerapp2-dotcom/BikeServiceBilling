"use server";

import { getShopId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCustomer(data: {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  bikeName?: string;
  bikeNumber?: string;
}) {
  if (!data.name.trim()) return { error: "Customer name is required" };
  if (!/^[6-9]\d{9}$/.test(data.phone.replace(/\s/g, ""))) {
    return { error: "Enter a valid 10-digit phone number" };
  }
  const supabase = await createClient();
  const shopId = await getShopId();
  const { data: customer, error } = await supabase
    .from("customers")
    .insert({
      shop_id: shopId,
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || null,
      address: data.address?.trim() || null,
    })
    .select()
    .single();
  if (error) return { error: "Unable to save customer" };
  if (data.bikeName && data.bikeNumber) {
    await supabase.from("bikes").insert({
      customer_id: customer.id,
      name: data.bikeName.trim(),
      registration_number: data.bikeNumber.trim(),
    });
  }
  await supabase.from("activity_logs").insert({
    shop_id: shopId,
    message: "New customer added",
    entity_type: "customer",
    entity_id: customer.id,
  });
  revalidatePath("/app/customers");
  return { data: customer };
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient();
  const shopId = await getShopId();
  const { error } = await supabase.from("customers").delete().eq("id", id).eq("shop_id", shopId);
  if (error) return { error: "Unable to delete customer" };
  revalidatePath("/app/customers");
  return { success: true };
}

export async function addBike(customerId: string, name: string, registration: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("bikes").insert({
    customer_id: customerId,
    name: name.trim(),
    registration_number: registration.trim(),
  });
  if (error) return { error: "Unable to add bike" };
  revalidatePath(`/app/customers/${customerId}`);
  return { success: true };
}

export async function getCustomerDetails(customerId: string) {
  const supabase = await createClient();
  const shopId = await getShopId();
  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .eq("shop_id", shopId)
    .single();
  if (!customer) return null;
  const { data: bikes } = await supabase
    .from("bikes")
    .select("*")
    .eq("customer_id", customerId);
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("customer_id", customerId)
    .order("invoice_date", { ascending: false });
  const totalSpent =
    invoices?.reduce((s, i) => s + Number(i.total_amount), 0) ?? 0;
  const lastService = invoices?.[0]?.invoice_date ?? null;
  return {
    customer,
    bikes: bikes ?? [],
    invoices: invoices ?? [],
    stats: {
      visits: invoices?.length ?? 0,
      totalInvoices: invoices?.length ?? 0,
      totalSpent,
      lastService,
    },
  };
}
