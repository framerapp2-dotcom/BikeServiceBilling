"use server";

import { getShopId } from "@/lib/auth";
import { getDashboardStats, getRevenueSnapshot, type RevenueSnapshot } from "@/lib/data/dashboard";
import { getMonthlyReport, type MonthlyReport } from "@/lib/data/reports";

export async function loadRevenue(date: string): Promise<RevenueSnapshot> {
  const shopId = await getShopId();
  return getRevenueSnapshot(shopId, date);
}

export async function loadDashboardMonth(yearMonth: string) {
  const shopId = await getShopId();
  const stats = await getDashboardStats(shopId, yearMonth);
  return {
    revenueThisMonth: stats.revenueThisMonth,
    revenuePrevMonth: stats.revenuePrevMonth,
    expensesThisMonth: stats.expensesThisMonth,
    expensesPrevMonth: stats.expensesPrevMonth,
    salaryThisMonth: stats.salaryThisMonth,
    salaryPrevMonth: stats.salaryPrevMonth,
  };
}

export async function loadReport(yearMonth: string): Promise<MonthlyReport> {
  const shopId = await getShopId();
  return getMonthlyReport(shopId, yearMonth);
}
