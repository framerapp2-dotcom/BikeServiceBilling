import { getShopId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CustomersClient } from "@/components/customers/customers-client";

export default async function CustomersPage() {
  const supabase = await createClient();
  const shopId = await getShopId();
  const { data: customers } = await supabase
    .from("customers")
    .select("*, bikes(*)")
    .eq("shop_id", shopId)
    .order("created_at", { ascending: false });
  return <CustomersClient customers={customers ?? []} />;
}
