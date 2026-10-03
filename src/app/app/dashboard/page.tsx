import { getShopId } from "@/lib/auth";
import { getDashboardStats, getRevenueSnapshot } from "@/lib/data/dashboard";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const metadata = { title: "Dashboard | OMR'S GREAT SERVICE POINT" };

export default async function DashboardPage() {
  const shopId = await getShopId();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const [stats, revenue] = await Promise.all([
    getDashboardStats(shopId),
    getRevenueSnapshot(shopId, today),
  ]);
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold dark:text-slate-100">Dashboard</h2>
      <DashboardClient stats={stats} initialDate={today} initialRevenue={revenue} />
    </div>
  );
}
