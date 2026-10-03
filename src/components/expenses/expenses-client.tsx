"use client";

import { createExpense, deleteExpense } from "@/app/actions/expenses";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/providers/toast-provider";
import { formatDate, formatINR } from "@/lib/utils";
import { useState } from "react";

const categories = ["Rent", "Electricity", "Tools", "Spare Parts", "Maintenance", "Transport", "Other"];

export function ExpensesClient({
  expenses,
}: {
  expenses: {
    id: string;
    title: string;
    category: string;
    amount: number;
    expense_date: string;
    payment_method: string | null;
  }[];
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "Other",
    amount: "",
    expense_date: new Date().toISOString().slice(0, 10),
    payment_method: "cash",
    description: "",
  });

  const save = async () => {
    const res = await createExpense({ ...form, amount: Number(form.amount) || 0 });
    if (res.error) toast(res.error, "error");
    else {
      toast("Expense recorded");
      setOpen(false);
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Expenses</h2>
        <Button onClick={() => setOpen(true)}>Add Expense</Button>
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="text-left text-foreground-muted border-b">
              <th className="pb-2">Title</th>
              <th className="pb-2">Category</th>
              <th className="pb-2">Date</th>
              <th className="pb-2">Amount</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id} className="border-b border-border/50">
                <td className="py-3">{e.title}</td>
                <td className="py-3">{e.category}</td>
                <td className="py-3">{formatDate(e.expense_date)}</td>
                <td className="py-3 font-medium">{formatINR(Number(e.amount))}</td>
                <td className="py-3">
                  <Button size="sm" variant="ghost" onClick={() => deleteExpense(e.id).then(() => window.location.reload())}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Modal open={open} onClose={() => setOpen(false)} title="Add Expense">
        <div className="space-y-3">
          <Input label="Expense Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={categories.map((c) => ({ value: c, label: c }))} />
          <Input label="Amount" inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value.replace(/[^\d.]/g, "") })} />
          <Input type="date" label="Date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} />
          <Button className="w-full" onClick={save}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}
