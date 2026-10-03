import { getShopId } from "@/lib/auth";
import { getMonthlyReport } from "@/lib/data/reports";
import { kolkataToday } from "@/lib/utils";
import { ReportsClient } from "@/components/reports/reports-client";

export default async function ReportsPage() {
  const shopId = await getShopId();
  const month = kolkataToday().slice(0, 7);
  const report = await getMonthlyReport(shopId, month);
  return <ReportsClient initial={report} />;
}
