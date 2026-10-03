"use client";

import { deleteInvoice } from "@/app/actions/invoices";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/providers/toast-provider";
import type { Invoice } from "@/lib/types";
import { formatDate, formatINR } from "@/lib/utils";
import { Eye, Plus, Receipt, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export function InvoicesListClient({
  initialInvoices,
}: {
  initialInvoices: Invoice[];
}) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [invoices, setInvoices] = useState(initialInvoices);

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      if (status !== "all" && inv.payment_status !== status) return false;
      const q = search.toLowerCase();
      if (!q) return true;
      return (
        inv.invoice_number.toLowerCase().includes(q) ||
        inv.customer_name.toLowerCase().includes(q) ||
        (inv.bike_registration?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [invoices, search, status]);

  const onDelete = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    const res = await deleteInvoice(id);
    if (res.error) toast(res.error, "error");
    else {
      setInvoices((list) => list.filter((i) => i.id !== id));
      toast("Invoice deleted");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Invoices</h2>
        <Link href="/app/invoices/new">
          <Button>
            <Plus className="h-4 w-4" />
            Create Invoice
          </Button>
        </Link>
      </div>
      <Card className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search invoice..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <select
          className="h-10 rounded-xl border border-border px-3 text-sm dark:border-slate-600 dark:bg-slate-800"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="partial">Partially Paid</option>
        </select>
      </Card>
      {filtered.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          description="Create your first invoice to start tracking your shop revenue."
          actionLabel="Create Invoice"
          onAction={() => (window.location.href = "/app/invoices/new")}
          icon={<Receipt className="h-8 w-8 text-primary" />}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-white dark:border-slate-700 dark:bg-card-dark">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr className="text-left text-foreground-muted">
                <th className="p-3 font-medium">Invoice #</th>
                <th className="p-3 font-medium">Customer</th>
                <th className="p-3 font-medium">Bike</th>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Amount</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id} className="border-t border-border dark:border-slate-700">
                  <td className="p-3 font-medium">{inv.invoice_number}</td>
                  <td className="p-3">{inv.customer_name}</td>
                  <td className="p-3">
                    <div>{inv.bike_name}</div>
                    <div className="text-xs text-foreground-muted">{inv.bike_registration}</div>
                  </td>
                  <td className="p-3">{formatDate(inv.invoice_date)}</td>
                  <td className="p-3 font-medium">{formatINR(Number(inv.total_amount))}</td>
                  <td className="p-3">
                    <Badge variant={inv.payment_status}>{inv.payment_status}</Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Link href={`/app/invoices/${inv.id}`}>
                        <Button variant="ghost" size="sm" aria-label="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(inv.id)}
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
