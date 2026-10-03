"use client";

import { createService, deleteService, updateService } from "@/app/actions/services";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/providers/toast-provider";
import { formatINR } from "@/lib/utils";
import { useState } from "react";

export function ServicesClient({
  services,
}: {
  services: {
    id: string;
    name: string;
    description: string | null;
    default_price: number;
    estimated_minutes: number | null;
    status: string;
  }[];
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", price: "" });

  const openNew = () => {
    setEditingId(null);
    setForm({ name: "", price: "" });
    setOpen(true);
  };

  const openEdit = (service: { id: string; name: string; default_price: number }) => {
    setEditingId(service.id);
    setForm({
      name: service.name,
      price: Number(service.default_price) ? String(service.default_price) : "",
    });
    setOpen(true);
  };

  const save = async () => {
    const payload = { name: form.name, default_price: Number(form.price) || 0 };
    const res = editingId
      ? await updateService(editingId, payload)
      : await createService(payload);
    if (res.error) toast(res.error, "error");
    else {
      toast(editingId ? "Service updated" : "Service saved");
      setOpen(false);
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Services</h2>
        <Button onClick={openNew}>Add Service</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <Card key={s.id} hover>
            <h3 className="font-semibold">{s.name}</h3>
            <p className="text-primary font-bold mt-1">{formatINR(Number(s.default_price))}</p>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => openEdit(s)}>Edit</Button>
              <Button variant="ghost" size="sm" onClick={() => deleteService(s.id).then(() => window.location.reload())}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title={editingId ? "Edit Service" : "Add Service"}>
        <div className="space-y-3">
          <Input label="Service Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input
            label="Price"
            inputMode="decimal"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value.replace(/[^\d.]/g, "") })}
          />
          <Button className="w-full" onClick={save}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}
