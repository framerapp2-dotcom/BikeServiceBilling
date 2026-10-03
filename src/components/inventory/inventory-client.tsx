"use client";

import { adjustStock, createInventoryItem, deleteInventoryItem } from "@/app/actions/inventory";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/providers/toast-provider";
import { formatINR } from "@/lib/utils";
import { useMemo, useState } from "react";

function stockStatus(qty: number, threshold: number) {
  if (qty <= 0) return "out_of_stock";
  if (qty <= threshold) return "low_stock";
  return "in_stock";
}

export function InventoryClient({
  items,
}: {
  items: {
    id: string;
    name: string;
    item_type: string;
    quantity: number;
    selling_price: number;
    low_stock_threshold: number;
  }[];
}) {
  const { toast } = useToast();
  const [tab, setTab] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    item_type: "spare_part",
    quantity: "",
    selling_price: "",
    low_stock_threshold: 5,
  });

  const stats = useMemo(() => {
    let low = 0;
    let out = 0;
    let value = 0;
    items.forEach((i) => {
      const q = Number(i.quantity);
      const st = stockStatus(q, Number(i.low_stock_threshold));
      if (st === "low_stock") low++;
      if (st === "out_of_stock") out++;
      value += q * Number(i.selling_price);
    });
    return { total: items.length, low, out, value };
  }, [items]);

  const filtered = items.filter((i) => tab === "all" || i.item_type === tab);

  const save = async () => {
    const res = await createInventoryItem({
      ...form,
      quantity: Number(form.quantity) || 0,
      selling_price: Number(form.selling_price) || 0,
    });
    if (res.error) toast(res.error, "error");
    else {
      toast("Item saved");
      setOpen(false);
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Inventory</h2>
        <Button onClick={() => setOpen(true)}>Add Item</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <Card><p className="text-sm text-foreground-muted">Total Items</p><p className="text-2xl font-bold">{stats.total}</p></Card>
        <Card><p className="text-sm text-foreground-muted">Low Stock</p><p className="text-2xl font-bold text-warning">{stats.low}</p></Card>
        <Card><p className="text-sm text-foreground-muted">Out of Stock</p><p className="text-2xl font-bold text-danger">{stats.out}</p></Card>
        <Card><p className="text-sm text-foreground-muted">Inventory Value</p><p className="text-2xl font-bold">{formatINR(stats.value)}</p></Card>
      </div>
      <div className="flex gap-2 flex-wrap">
        {["all", "spare_part", "tool", "other"].map((t) => (
          <Button key={t} variant={tab === t ? "primary" : "outline"} size="sm" onClick={() => setTab(t)}>
            {t.replace("_", " ")}
          </Button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border bg-white dark:border-slate-700 dark:bg-card-dark">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="p-3 text-left">Item</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Qty</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => {
              const st = stockStatus(Number(i.quantity), Number(i.low_stock_threshold));
              return (
                <tr key={i.id} className="border-t border-border dark:border-slate-700">
                  <td className="p-3">{i.name}</td>
                  <td className="p-3 capitalize">{i.item_type.replace("_", " ")}</td>
                  <td className="p-3">{i.quantity}</td>
                  <td className="p-3">{formatINR(Number(i.selling_price))}</td>
                  <td className="p-3"><Badge variant={st}>{st.replace("_", " ")}</Badge></td>
                  <td className="p-3 flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => adjustStock(i.id, 1).then(() => window.location.reload())}>+1</Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteInventoryItem(i.id).then(() => window.location.reload())}>Delete</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Add Inventory Item">
        <div className="space-y-3">
          <Input label="Item Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className="w-full h-10 rounded-xl border px-3" value={form.item_type} onChange={(e) => setForm({ ...form, item_type: e.target.value })}>
            <option value="spare_part">Spare Part</option>
            <option value="tool">Tool</option>
            <option value="other">Other</option>
          </select>
          <Input label="Quantity" inputMode="decimal" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value.replace(/[^\d.]/g, "") })} />
          <Input label="Selling Price" inputMode="decimal" value={form.selling_price} onChange={(e) => setForm({ ...form, selling_price: e.target.value.replace(/[^\d.]/g, "") })} />
          <Button className="w-full" onClick={save}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}
