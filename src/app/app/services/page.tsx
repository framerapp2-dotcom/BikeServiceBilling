import { getShopId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ServicesClient } from "@/components/services/services-client";

export default async function ServicesPage() {
  const supabase = await createClient();
  const shopId = await getShopId();
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("shop_id", shopId)
    .order("name");
  return <ServicesClient services={services ?? []} />;
}
