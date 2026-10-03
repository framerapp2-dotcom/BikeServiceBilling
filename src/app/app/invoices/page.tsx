import { getShopId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { InvoicesListClient } from "@/components/invoices/invoices-list-client";

export const metadata = { title: "Invoices | OMR'S GREAT SERVICE POINT" };

export default async function InvoicesPage() {
  const supabase = await createClient();
  const shopId = await getShopId();
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("shop_id", shopId)
    .order("created_at", { ascending: false });

  return (
    <div>
      <InvoicesListClient initialInvoices={invoices ?? []} />
    </div>
  );
}
