import { getShopId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CreateInvoiceForm } from "@/components/invoices/create-invoice-form";

export default async function NewInvoicePage() {
  const supabase = await createClient();
  const shopId = await getShopId();
  const [servicesRes, inventoryRes, shopRes, customersRes] = await Promise.all([
    supabase.from("services").select("*").eq("shop_id", shopId).order("name"),
    supabase.from("inventory_items").select("*").eq("shop_id", shopId).order("name"),
    supabase.from("shops").select("tax_rate, show_tax").eq("id", shopId).single(),
    supabase.from("customers").select("id, name, phone, bikes(id, name, registration_number)").eq("shop_id", shopId).order("name"),
  ]);
  const services = servicesRes.data;
  const inventory = inventoryRes.data;
  const shop = shopRes.data;

  return (
    <CreateInvoiceForm
      services={services ?? []}
      inventory={inventory ?? []}
      customers={customersRes.data ?? []}
      shopTax={Number(shop?.tax_rate ?? 0)}
      showTax={shop?.show_tax ?? false}
    />
  );
}
