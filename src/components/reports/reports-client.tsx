"use client";

import { loadReport } from "@/app/actions/revenue";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { MonthlyReport } from "@/lib/data/reports";
import { formatINR } from "@/lib/utils";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Download, Printer } from "lucide-react";
import { useState } from "react";

export function ReportsClient({ initial }: { initial: MonthlyReport }) {
  const [report, setReport] = useState(initial);
  const {
    revenue,
    invoiceCount,
    expenseTotal,
    salaryTotal,
    profit,
    expenseByCategory,
    paymentByMethod,
    month,
  } = report;
  const avg = invoiceCount ? revenue / invoiceCount : 0;
  const monthLabel = new Date(`${month}-01T00:00:00`).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const changeMonth = async (value: string) => {
    if (!value) return;
    setReport(await loadReport(value));
  };

  const exportCsv = () => {
    const rows = [
      ["Metric", "Value"],
      ["Revenue", revenue],
      ["Invoices", invoiceCount],
      ["Avg Invoice", avg],
      ["Expenses", expenseTotal],
      ["Salaries", salaryTotal],
      ["Profit", profit],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "riders-garage-report.csv";
    a.click();
  };

  return (
    <div className="space-y-6 print:space-y-4" id="report-root">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold dark:text-slate-100">Reports — {monthLabel}</h2>
          <p className="text-sm text-foreground-muted">A new month starts at zero. Pick an older month to see those salaries and totals.</p>
        </div>
        <label className="text-sm print:hidden">
          Month
          <input
            type="month"
            value={month}
            onChange={(e) => changeMonth(e.target.value)}
            className="ml-2 h-10 rounded-xl border border-border bg-white px-3 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button variant="outline" onClick={exportCsv}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><p className="text-sm text-foreground-muted">Total Revenue</p><p className="text-2xl font-bold text-primary">{formatINR(revenue)}</p></Card>
        <Card><p className="text-sm text-foreground-muted">Invoices</p><p className="text-2xl font-bold">{invoiceCount}</p><p className="text-xs text-foreground-muted">Avg {formatINR(avg)}</p></Card>
        <Card><p className="text-sm text-foreground-muted">Expenses</p><p className="text-2xl font-bold text-warning">{formatINR(expenseTotal)}</p></Card>
        <Card><p className="text-sm text-foreground-muted">Profit</p><p className="text-2xl font-bold text-secondary">{formatINR(profit)}</p></Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-semibold">Expense Categories</h3>
          {expenseByCategory.some((item) => item.value > 0) ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseByCategory.filter((item) => item.value > 0)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={82}
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {expenseByCategory
                      .filter((item) => item.value > 0)
                      .map((item, index) => (
                        <Cell
                          key={item.name}
                          fill={["#ea580c", "#f59e0b", "#16a34a", "#2563eb", "#9333ea"][index % 5]}
                        />
                      ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatINR(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-foreground-muted">
              No expenses recorded for this month.
            </p>
          )}
        </Card>
        <Card>
          <h3 className="mb-4 font-semibold">Payments by Type</h3>
          {paymentByMethod.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentByMethod}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={82}
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {paymentByMethod.map((item) => (
                      <Cell
                        key={item.name}
                        fill={item.name === "Cash" ? "#16a34a" : "#2563eb"}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatINR(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-foreground-muted">
              No Cash or UPI payments recorded for this month.
            </p>
          )}
        </Card>
      </div>
      <Card>
        <p className="text-sm text-foreground-muted">Employee salaries ({monthLabel})</p>
        <p className="text-xl font-bold text-accent">{formatINR(salaryTotal)}</p>
      </Card>
    </div>
  );
}
