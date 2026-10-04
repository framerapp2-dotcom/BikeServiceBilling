import { getShopId } from "@/lib/auth";
import { getDashboardStats, getRevenueSnapshot } from "@/lib/data/dashboard";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Dashboard | OMR'S GREAT SERVICE POINT" };

export default async function DashboardPage() {
  const shopId = await getShopId();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const [stats, revenue] = await Promise.all([
    getDashboardStats(shopId),
    getRevenueSnapshot(shopId, today),
  ]);
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-900/10 sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Workshop overview
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Your business, at a glance.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Review revenue, keep an eye on payments, and manage today&apos;s workshop activity.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/app/invoices/new">
              <Button className="bg-orange-600 text-white hover:bg-orange-700">
                <Plus className="h-4 w-4" />
                New invoice
              </Button>
            </Link>
            <Link href="/app/invoices">
              <Button variant="outline" className="border-white/25 bg-white/5 text-white hover:bg-white/10 dark:border-white/25 dark:text-white">
                All invoices
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <DashboardClient stats={stats} initialDate={today} initialRevenue={revenue} />
    </div>
  );
}
