import { getShopId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ExpensesClient } from "@/components/expenses/expenses-client";

export default async function ExpensesPage() {
  const supabase = await createClient();
  const shopId = await getShopId();
  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .eq("shop_id", shopId)
    .order("expense_date", { ascending: false });
  return <ExpensesClient expenses={expenses ?? []} />;
}
