"use client";

import { createCustomer, deleteCustomer } from "@/app/actions/customers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/providers/toast-provider";
import { formatDate } from "@/lib/utils";
import { Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function CustomersClient({
  customers,
}: {
  customers: {
    id: string;
    name: string;
    phone: string;
    created_at: string;
    bikes?: { name: string; registration_number: string }[];
  }[];
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    bikeName: "",
    bikeNumber: "",
  });

  const submit = async () => {
    const res = await createCustomer(form);
    if (res.error) toast(res.error, "error");
    else {
      toast("Customer added");
      setOpen(false);
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-slate-100">Customers</h2>
        <Button onClick={() => setOpen(true)}>Add Customer</Button>
      </div>
      {customers.length === 0 ? (
        <EmptyState
          title="No customers found"
          description="Add your first customer."
          actionLabel="Add Customer"
          onAction={() => setOpen(true)}
          icon={<Users className="h-8 w-8 text-primary" />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {customers.map((c) => (
            <Card key={c.id} hover className="h-full">
              <Link href={`/app/customers/${c.id}`}>
                <h3 className="font-semibold dark:text-slate-100">{c.name}</h3>
                <p className="text-sm text-foreground-muted">{c.phone}</p>
                <p className="mt-1 text-xs text-foreground-muted">Visited {formatDate(c.created_at)}</p>
                {c.bikes?.[0] && (
                  <p className="mt-2 text-xs text-foreground-muted">
                    {c.bikes[0].name} · {c.bikes[0].registration_number}
                  </p>
                )}
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 text-danger"
                onClick={async () => {
                  if (!confirm(`Delete ${c.name}?`)) return;
                  const res = await deleteCustomer(c.id);
                  if (res.error) toast(res.error, "error");
                  else window.location.reload();
                }}
              >
                Delete
              </Button>
            </Card>
          ))}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Customer">
        <div className="space-y-3">
          <Input label="Customer Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Bike Name" value={form.bikeName} onChange={(e) => setForm({ ...form, bikeName: e.target.value })} />
          <Input label="Bike Number" value={form.bikeNumber} onChange={(e) => setForm({ ...form, bikeNumber: e.target.value })} />
          <Button className="w-full" onClick={submit}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}
