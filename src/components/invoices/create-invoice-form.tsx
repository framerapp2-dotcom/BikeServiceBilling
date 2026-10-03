"use client";

import { createInvoice } from "@/app/actions/invoices";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/providers/toast-provider";
import { calcInvoiceTotals, calcLineAmount } from "@/lib/invoice-utils";
import type { InventoryItem, Service } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type KnownCustomer = {
  id: string;
  name: string;
  phone: string;
  bikes?: { id: string; name: string; registration_number: string }[] | null;
};

type LineItem = {
  item_name: string;
  item_type: string;
  quantity: number;
  rate: number;
  discount: number;
  service_id?: string;
  inventory_item_id?: string;
};

function localToday() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function CreateInvoiceForm({
  services,
  inventory,
  customers,
  shopTax,
  showTax,
}: {
  services: Service[];
  inventory: InventoryItem[];
  customers: KnownCustomer[];
  shopTax: number;
  showTax: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [bikeId, setBikeId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [bikeName, setBikeName] = useState("");
  const [bikeReg, setBikeReg] = useState("");
  const [showRegList, setShowRegList] = useState(false);
  const [showNameList, setShowNameList] = useState(false);
  const [billDate] = useState(localToday);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentStatus, setPaymentStatus] = useState("paid");
  const [items, setItems] = useState<LineItem[]>([
    { item_name: "", item_type: "service", quantity: 1, rate: 0, discount: 0 },
  ]);
  const [search, setSearch] = useState("");

  const totals = useMemo(
    () => calcInvoiceTotals(items, shopTax, showTax),
    [items, shopTax, showTax]
  );

  const catalog = useMemo(() => {
    const q = search.toLowerCase();
    const svc = services
      .filter((s) => s.status === "active")
      .filter((s) => !q || s.name.toLowerCase().includes(q))
      .map((s) => ({
        id: s.id,
        name: s.name,
        type: "service",
        price: Number(s.default_price),
      }));
    const inv = inventory
      .filter((i) => !q || i.name.toLowerCase().includes(q))
      .map((i) => ({
        id: i.id,
        name: i.name,
        type: i.item_type === "spare_part" ? "spare_part" : i.item_type,
        price: Number(i.selling_price),
      }));
    return [...svc, ...inv].slice(0, 8);
  }, [services, inventory, search]);

  const addRow = () =>
    setItems((r) => [
      ...r,
      { item_name: "", item_type: "service", quantity: 1, rate: 0, discount: 0 },
    ]);

  const fillCustomer = (
    customer: KnownCustomer,
    bike?: { id: string; name: string; registration_number: string }
  ) => {
    const chosen = bike ?? customer.bikes?.[0];
    setCustomerId(customer.id);
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone);
    setBikeId(chosen?.id ?? "");
    setBikeName(chosen?.name ?? "");
    setBikeReg(chosen?.registration_number ?? "");
    setShowRegList(false);
    setShowNameList(false);
  };

  const nameMatches = customers
    .filter((c) => customerName && c.name.toLowerCase().includes(customerName.toLowerCase()))
    .slice(0, 6);
  const regMatches = customers.flatMap((customer) =>
    (customer.bikes ?? [])
      .filter((bike) => bikeReg && bike.registration_number.toLowerCase().includes(bikeReg.toLowerCase()))
      .map((bike) => ({ customer, bike }))
  ).slice(0, 6);

  const pickCatalog = (c: { id: string; name: string; type: string; price: number }) => {
    setItems((rows) => {
      const emptyIdx = rows.findIndex((r) => !r.item_name);
      const idx = emptyIdx >= 0 ? emptyIdx : rows.length;
      const next = [...rows];
      const row: LineItem = {
        item_name: c.name,
        item_type: c.type,
        quantity: 1,
        rate: c.price,
        discount: 0,
        service_id: c.type === "service" ? c.id : undefined,
        inventory_item_id: c.type !== "service" ? c.id : undefined,
      };
      if (emptyIdx >= 0) next[idx] = row;
      else next.push(row);
      return next;
    });
    setSearch("");
  };

  const submit = async () => {
    const validItems = items.filter((i) => i.item_name.trim());
    if (!customerName.trim()) {
      toast("Customer name is required", "error");
      return;
    }
    if (!validItems.length) {
      toast("Add at least one item", "error");
      return;
    }
    setLoading(true);
    const res = await createInvoice({
      customerName,
      customerPhone,
      customerId: customerId || undefined,
      bikeName,
      bikeRegistration: bikeReg,
      bikeId: bikeId || undefined,
      invoice_date: billDate,
      items: validItems,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      amount_paid: paymentStatus === "paid" ? totals.total : 0,
    });
    setLoading(false);
    if (res.error) {
      toast(res.error, "error");
      return;
    }
    toast(`Invoice ${res.data?.invoice_number} created successfully.`);
    router.push(`/app/invoices/${res.data?.id}`);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <h2 className="text-2xl font-bold dark:text-slate-100">Create Invoice</h2>
      <Card>
        <h3 className="mb-4 font-semibold">Customer and bike</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Input
              label="Bike Number"
              value={bikeReg}
              onChange={(e) => {
                setBikeReg(e.target.value);
                setBikeId("");
                setShowRegList(true);
              }}
            />
            {showRegList && regMatches.length > 0 && (
              <ul className="mt-1 overflow-hidden rounded-xl border border-border">
                {regMatches.map(({ customer, bike }) => (
                  <li key={bike.id}>
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                      onClick={() => fillCustomer(customer, bike)}
                    >
                      {bike.registration_number} · {customer.name} · {customer.phone}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <Input
              label="Customer Name"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                setCustomerId("");
                setShowNameList(true);
              }}
            />
            {showNameList && nameMatches.length > 0 && (
              <ul className="mt-1 overflow-hidden rounded-xl border border-border">
                {nameMatches.map((customer) => (
                  <li key={customer.id}>
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                      onClick={() => fillCustomer(customer)}
                    >
                      {customer.name} · {customer.phone}
                      {customer.bikes?.[0] ? ` · ${customer.bikes[0].registration_number}` : ""}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Input label="Customer Phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
          <Input label="Bike Name / Model" value={bikeName} onChange={(e) => setBikeName(e.target.value)} />
        </div>
      </Card>
      <Card>
        <h3 className="mb-4 font-semibold">Services / Items</h3>
        <Input
          placeholder="Search services or inventory..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3"
        />
        {search && catalog.length > 0 && (
          <ul className="mb-4 rounded-xl border border-border dark:border-slate-600 overflow-hidden">
            {catalog.map((c) => (
              <li key={`${c.type}-${c.id}`}>
                <button
                  type="button"
                  className="flex w-full justify-between px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                  onClick={() => pickCatalog(c)}
                >
                  <span>{c.name}</span>
                  <span className="text-foreground-muted">{formatINR(c.price)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="space-y-3">
          {items.map((row, idx) => (
            <div key={idx} className="grid gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50 sm:grid-cols-12">
              <Input
                className="sm:col-span-6"
                placeholder="Item name"
                value={row.item_name}
                onChange={(e) => {
                  const next = [...items];
                  next[idx].item_name = e.target.value;
                  setItems(next);
                }}
              />
              <select
                className="h-10 rounded-xl border border-border px-2 text-sm sm:col-span-2 dark:border-slate-600 dark:bg-slate-800"
                value={row.item_type}
                onChange={(e) => {
                  const next = [...items];
                  next[idx].item_type = e.target.value;
                  setItems(next);
                }}
              >
                <option value="service">Service</option>
                <option value="spare_part">Spare Part</option>
                <option value="other">Other</option>
              </select>
              <Input
                inputMode="decimal"
                className="sm:col-span-1"
                placeholder="Qty"
                value={row.quantity ? String(row.quantity) : ""}
                onChange={(e) => {
                  const next = [...items];
                  next[idx].quantity = Number(e.target.value.replace(/[^\d.]/g, "")) || 0;
                  setItems(next);
                }}
              />
              <Input
                inputMode="decimal"
                className="sm:col-span-2"
                placeholder="Price"
                value={row.rate ? String(row.rate) : ""}
                onChange={(e) => {
                  const next = [...items];
                  next[idx].rate = Number(e.target.value.replace(/[^\d.]/g, "")) || 0;
                  setItems(next);
                }}
              />
              <div className="flex items-center justify-between gap-2 sm:col-span-1">
                <span className="text-sm font-medium">
                  {formatINR(calcLineAmount(row.quantity, row.rate, row.discount))}
                </span>
                <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))}>
                  <Trash2 className="h-4 w-4 text-danger" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="mt-3" onClick={addRow}>
          <Plus className="h-4 w-4" /> Type service manually
        </Button>
        <div className="mt-6 flex justify-end text-sm">
          <div className="space-y-1 text-right">
            <p>Subtotal: {formatINR(totals.subtotal)}</p>
            {showTax && <p>Tax: {formatINR(totals.taxAmount)}</p>}
            <p className="text-lg font-bold text-primary">Total: {formatINR(totals.total)}</p>
          </div>
        </div>
      </Card>
      <Card>
        <h3 className="mb-4 font-semibold">Payment</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Payment Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            options={[
              { value: "cash", label: "Cash" },
              { value: "upi", label: "UPI" },
            ]}
          />
          <Select
            label="Payment Status"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            options={[
              { value: "paid", label: "Paid" },
              { value: "pending", label: "Pending" },
            ]}
          />
        </div>
      </Card>
      <Button size="lg" loading={loading} onClick={submit}>
        Generate Invoice
      </Button>
    </div>
  );
}
