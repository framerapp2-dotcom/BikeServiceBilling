import { createClient } from "@/lib/supabase/server";
import { kolkataToday, monthBounds } from "@/lib/utils";
import type { DashboardStats } from "@/lib/types";

function shiftMonth(yearMonth: string, delta: number) {
  const [year, month] = yearMonth.split("-").map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export async function getDashboardStats(shopId: string, yearMonth = kolkataToday().slice(0, 7)): Promise<DashboardStats> {
  const supabase = await createClient();
  const thisMonth = monthBounds(yearMonth);
  const prevKey = shiftMonth(yearMonth, -1);
  const prevMonth = monthBounds(prevKey);
  const year = Number(yearMonth.slice(0, 4));
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;

  const [
    invoicesThisRes,
    invoicesPrevRes,
    expensesThisRes,
    expensesPrevRes,
    salariesThisRes,
    salariesPrevRes,
    invoiceCountRes,
    yearInvoicesRes,
    recentInvoicesRes,
    recentActivityRes,
  ] = await Promise.all([
    supabase
      .from("invoices")
      .select("total_amount, invoice_date")
      .eq("shop_id", shopId)
      .gte("invoice_date", thisMonth.start)
      .lte("invoice_date", thisMonth.end),
    supabase
      .from("invoices")
      .select("total_amount")
      .eq("shop_id", shopId)
      .gte("invoice_date", prevMonth.start)
      .lte("invoice_date", prevMonth.end),
    supabase
      .from("expenses")
      .select("amount")
      .eq("shop_id", shopId)
      .gte("expense_date", thisMonth.start)
      .lte("expense_date", thisMonth.end),
    supabase
      .from("expenses")
      .select("amount")
      .eq("shop_id", shopId)
      .gte("expense_date", prevMonth.start)
      .lte("expense_date", prevMonth.end),
    supabase
      .from("employee_salaries")
      .select("net_salary")
      .eq("shop_id", shopId)
      .eq("salary_month", thisMonth.start),
    supabase
      .from("employee_salaries")
      .select("net_salary")
      .eq("shop_id", shopId)
      .eq("salary_month", prevMonth.start),
    supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("shop_id", shopId),
    supabase
      .from("invoices")
      .select("total_amount, invoice_date")
      .eq("shop_id", shopId)
      .gte("invoice_date", yearStart)
      .lte("invoice_date", yearEnd),
    supabase
      .from("invoices")
      .select("*")
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("activity_logs")
      .select("*")
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const invoicesThis = invoicesThisRes.data;
  const invoicesPrev = invoicesPrevRes.data;
  const expensesThis = expensesThisRes.data;
  const expensesPrev = expensesPrevRes.data;
  const salariesThis = salariesThisRes.data;
  const salariesPrev = salariesPrevRes.data;
  const invoiceCount = invoiceCountRes.count;
  const yearInvoices = yearInvoicesRes.data;
  const recentInvoices = recentInvoicesRes.data;
  const recentActivity = recentActivityRes.data;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyRevenue = months.map((label, idx) => {
    const rev =
      yearInvoices?.filter((inv) => {
        const d = new Date(inv.invoice_date);
        return d.getMonth() === idx;
      }).reduce((s, inv) => s + Number(inv.total_amount), 0) ?? 0;
    return { month: label, revenue: rev };
  });

  const sum = (rows: { amount?: number; total_amount?: number; net_salary?: number }[], key: string) =>
    rows?.reduce((s, r) => s + Number((r as Record<string, number>)[key] ?? 0), 0) ?? 0;

  return {
    revenueThisMonth: sum(invoicesThis ?? [], "total_amount"),
    revenuePrevMonth: sum(invoicesPrev ?? [], "total_amount"),
    expensesThisMonth: sum(expensesThis ?? [], "amount"),
    expensesPrevMonth: sum(expensesPrev ?? [], "amount"),
    salaryThisMonth: sum(salariesThis ?? [], "net_salary"),
    salaryPrevMonth: sum(salariesPrev ?? [], "net_salary"),
    invoiceCount: invoiceCount ?? 0,
    monthlyRevenue,
    recentInvoices: (recentInvoices ?? []) as DashboardStats["recentInvoices"],
    recentActivity: (recentActivity ?? []) as DashboardStats["recentActivity"],
  };
}

export type RevenueSnapshot = {
  daily: number;
  weekly: number;
  monthly: number;
  week: { day: string; revenue: number }[];
  pie: { name: string; value: number }[];
};

export async function getRevenueSnapshot(shopId: string, date: string): Promise<RevenueSnapshot> {
  const supabase = await createClient();
  const selected = new Date(`${date}T00:00:00`);
  const dow = selected.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const start = new Date(selected);
  start.setDate(selected.getDate() + mondayOffset);
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
    return {
      iso,
      label: day.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit" }),
    };
  });

  const month = monthBounds(date.slice(0, 7));
  const from = days[0].iso < month.start ? days[0].iso : month.start;
  const to = days[6].iso > month.end ? days[6].iso : month.end;
  const { data } = await supabase
    .from("invoices")
    .select("invoice_date, total_amount, payment_method")
    .eq("shop_id", shopId)
    .gte("invoice_date", from)
    .lte("invoice_date", to);

  const rows = data ?? [];
  const monthRows = rows.filter((row) => row.invoice_date >= month.start && row.invoice_date <= month.end);
  const week = days.map((day) => ({
    day: day.label,
    revenue: rows
      .filter((row) => row.invoice_date === day.iso)
      .reduce((sum, row) => sum + Number(row.total_amount), 0),
  }));
  const dailyRows = rows.filter((row) => row.invoice_date === date);
  const cash = dailyRows
    .filter((row) => row.payment_method === "cash")
    .reduce((sum, row) => sum + Number(row.total_amount), 0);
  const upi = dailyRows
    .filter((row) => row.payment_method === "upi")
    .reduce((sum, row) => sum + Number(row.total_amount), 0);

  return {
    daily: dailyRows.reduce((sum, row) => sum + Number(row.total_amount), 0),
    weekly: week.reduce((sum, day) => sum + day.revenue, 0),
    monthly: monthRows.reduce((sum, row) => sum + Number(row.total_amount), 0),
    week,
    pie: [
      { name: "Cash", value: cash },
      { name: "UPI", value: upi },
    ].filter((slice) => slice.value > 0),
  };
}
