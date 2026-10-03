"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { loadDashboardMonth, loadRevenue } from "@/app/actions/revenue";
import type { RevenueSnapshot } from "@/lib/data/dashboard";
import type { DashboardStats } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useState } from "react";
import {
  IndianRupee,
  Wallet,
  UsersRound,
  Receipt,
  Eye,
} from "lucide-react";
import Link from "next/link";

const PIE_COLORS = ["#2563EB", "#10B981"];

export function DashboardClient({
  stats,
  initialDate,
  initialRevenue,
}: {
  stats: DashboardStats;
  initialDate: string;
  initialRevenue: RevenueSnapshot;
}) {
  const [date, setDate] = useState(initialDate);
  const [month, setMonth] = useState(initialDate.slice(0, 7));
  const [revenue, setRevenue] = useState(initialRevenue);
  const [cards, setCards] = useState(stats);

  const changeDate = async (value: string) => {
    setDate(value);
    const yearMonth = value.slice(0, 7);
    setMonth(yearMonth);
    const [nextRevenue, nextCards] = await Promise.all([
      loadRevenue(value),
      loadDashboardMonth(yearMonth),
    ]);
    setRevenue(nextRevenue);
    setCards((current) => ({ ...current, ...nextCards }));
  };

  const changeMonth = async (yearMonth: string) => {
    if (!yearMonth) return;
    const nextDate = initialDate.startsWith(yearMonth) ? initialDate : `${yearMonth}-01`;
    await changeDate(nextDate);
  };

  const monthLabel = new Date(`${month}-01T00:00:00`).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={`Total Revenue — ${monthLabel}`}
          value={cards.revenueThisMonth}
          previousValue={cards.revenuePrevMonth}
          icon={IndianRupee}
          accent="primary"
        />
        <StatCard
          title={`Total Expenses — ${monthLabel}`}
          value={cards.expensesThisMonth}
          previousValue={cards.expensesPrevMonth}
          icon={Wallet}
          accent="warning"
        />
        <StatCard
          title={`Employee Salary — ${monthLabel}`}
          value={cards.salaryThisMonth}
          previousValue={cards.salaryPrevMonth}
          icon={UsersRound}
          accent="accent"
        />
        <StatCard
          title="Total Invoices"
          value={stats.invoiceCount}
          icon={Receipt}
          format="number"
          accent="secondary"
        />
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Daily and weekly revenue</h2>
            <p className="text-sm text-foreground-muted">
              Daily is the selected date. Weekly is that Monday to Sunday. A new month starts at zero until bills are saved. Pick the month to see an older one.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="text-sm">
              Month
              <input
                type="month"
                value={month}
                onChange={(e) => changeMonth(e.target.value)}
                className="ml-2 h-10 rounded-xl border border-border bg-white px-3 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>
            <label className="text-sm">
              Date
              <input
                type="date"
                value={date}
                onChange={(e) => changeDate(e.target.value)}
                className="ml-2 h-10 rounded-xl border border-border bg-white px-3 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>
          </div>
        </div>
        <div className="mb-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-blue-50 p-4 dark:bg-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-300">Daily revenue</p>
            <p className="text-2xl font-bold text-primary">{formatINR(revenue.daily)}</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-4 dark:bg-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-300">Weekly revenue</p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{formatINR(revenue.weekly)}</p>
          </div>
          <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-300">{monthLabel} revenue</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{formatINR(revenue.monthly)}</p>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-64 lg:col-span-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue.week}>
                <CartesianGrid strokeDasharray="3 3" stroke="#64748b" strokeOpacity={0.35} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <Tooltip
                  formatter={(v: number) => formatINR(v)}
                  contentStyle={{ background: "#1e293b", border: "none", borderRadius: 12, color: "#f8fafc" }}
                />
                <Bar dataKey="revenue" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="h-64">
            {revenue.pie.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={revenue.pie} dataKey="value" nameKey="name" outerRadius={80} label>
                    {revenue.pie.map((slice, index) => (
                      <Cell key={slice.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatINR(v)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="pt-16 text-center text-sm text-foreground-muted">No payments on this date</p>
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-6">
        <Card className="overflow-hidden">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold dark:text-slate-100">Recent Invoices</h2>
            <Link href="/app/invoices">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-foreground-muted dark:border-slate-700">
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Bike No.</th>
                  <th className="pb-2 font-medium">Invoice</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border/50 dark:border-slate-800">
                    <td className="py-3">{inv.customer_name}</td>
                    <td className="py-3">{inv.bike_registration}</td>
                    <td className="py-3">{inv.invoice_number}</td>
                    <td className="py-3 font-medium">{formatINR(Number(inv.total_amount))}</td>
                    <td className="py-3">
                      <Badge variant={inv.payment_status}>{inv.payment_status}</Badge>
                    </td>
                    <td className="py-3">
                      <Link href={`/app/invoices/${inv.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {!stats.recentInvoices.length && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-foreground-muted">
                      No invoices yet. Create your first invoice.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
