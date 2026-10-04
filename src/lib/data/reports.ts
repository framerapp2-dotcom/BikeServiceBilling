import { createClient } from "@/lib/supabase/server";
import { monthBounds } from "@/lib/utils";

export type MonthlyReport = {
  month: string;
  revenue: number;
  invoiceCount: number;
  expenseTotal: number;
  salaryTotal: number;
  profit: number;
  expenseByCategory: { name: string; value: number }[];
  paymentByMethod: { name: string; value: number }[];
};

export async function getMonthlyReport(shopId: string, yearMonth: string): Promise<MonthlyReport> {
  const supabase = await createClient();
  const { start, end } = monthBounds(yearMonth);
  const [invoicesRes, expensesRes, salariesRes] = await Promise.all([
    supabase
      .from("invoices")
      .select("total_amount, amount_paid, payment_method")
      .eq("shop_id", shopId)
      .gte("invoice_date", start)
      .lte("invoice_date", end),
    supabase
      .from("expenses")
      .select("amount, category")
      .eq("shop_id", shopId)
      .gte("expense_date", start)
      .lte("expense_date", end),
    supabase
      .from("employee_salaries")
      .select("net_salary")
      .eq("shop_id", shopId)
      .eq("salary_month", start),
  ]);

  const invoices = invoicesRes.data ?? [];
  const expenses = expensesRes.data ?? [];
  const salaries = salariesRes.data ?? [];
  const revenue = invoices.reduce((sum, row) => sum + Number(row.total_amount), 0);
  const expenseTotal = expenses.reduce((sum, row) => sum + Number(row.amount), 0);
  const salaryTotal = salaries.reduce((sum, row) => sum + Number(row.net_salary), 0);
  const byCategory: Record<string, number> = {};
  expenses.forEach((row) => {
    const category = row.category?.trim() || "Uncategorized";
    byCategory[category] = (byCategory[category] ?? 0) + Number(row.amount);
  });
  const byPaymentMethod: Record<"Cash" | "UPI", number> = {
    Cash: 0,
    UPI: 0,
  };
  invoicesRes.data?.forEach((row) => {
    const method = row.payment_method?.toLowerCase();
    if (method === "cash") byPaymentMethod.Cash += Number(row.amount_paid ?? 0);
    if (method === "upi") byPaymentMethod.UPI += Number(row.amount_paid ?? 0);
  });

  return {
    month: yearMonth,
    revenue,
    invoiceCount: invoices.length,
    expenseTotal,
    salaryTotal,
    profit: revenue - expenseTotal - salaryTotal,
    expenseByCategory: Object.entries(byCategory).map(([name, value]) => ({ name, value })),
    paymentByMethod: Object.entries(byPaymentMethod)
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.value > 0),
  };
}
