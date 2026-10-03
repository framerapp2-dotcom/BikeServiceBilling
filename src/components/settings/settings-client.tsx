"use client";

import { updateShopProfile } from "@/app/actions/shop";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/providers/toast-provider";
import { SHOP_NAME } from "@/lib/shop";
import { onlyDigits } from "@/lib/utils";
import { useState } from "react";

export function SettingsClient({
  shop,
  userEmail,
}: {
  shop: Record<string, unknown> | null;
  userEmail: string;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: (shop?.name as string) ?? SHOP_NAME,
    tagline: (shop?.tagline as string) ?? "",
    phone: (shop?.phone as string) ?? "",
    email: (shop?.email as string) ?? "",
    address: (shop?.address as string) ?? "",
    invoice_footer: (shop?.invoice_footer as string) ?? "",
  });

  const save = async () => {
    const res = await updateShopProfile(form);
    if (res.error) toast(res.error, "error");
    else toast("Shop profile updated");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold dark:text-slate-100">Settings</h2>
      <Card>
        <h3 className="font-semibold mb-4">Account</h3>
        <p className="text-sm text-foreground-muted">Signed in as {userEmail}</p>
      </Card>
      <Card>
        <h3 className="font-semibold mb-4">Shop Profile</h3>
        <p className="text-xs text-foreground-muted mb-4">
          This information appears automatically on every invoice.
        </p>
        <div className="space-y-3">
          <Input label="Shop Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Tagline" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
          <Input label="Phone" type="tel" inputMode="numeric" value={form.phone} onChange={(e) => setForm({ ...form, phone: onlyDigits(e.target.value) })} />
          <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input label="Invoice Footer" value={form.invoice_footer} onChange={(e) => setForm({ ...form, invoice_footer: e.target.value })} />
          <Button onClick={save}>Save Shop Profile</Button>
        </div>
      </Card>
    </div>
  );
}
