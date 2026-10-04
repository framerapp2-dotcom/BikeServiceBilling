"use server";

import { getShopId } from "@/lib/auth";
import {
  buildInvoiceNumber,
  calcInvoiceTotals,
  calcLineAmount,
} from "@/lib/invoice-utils";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createInvoice(input: {
  customerName: string;
  customerPhone: string;
  customerId?: string;
  bikeName: string;
  bikeRegistration: string;
  bikeId?: string;
  items: {
    item_name: string;
    item_type: string;
    quantity: number;
    rate: number;
    discount: number;
    service_id?: string;
    inventory_item_id?: string;
  }[];
  payment_method: string;
  payment_status: string;
  amount_paid: number;
  invoice_date?: string;
}) {
  if (!input.customerName.trim()) {
    return { error: "Customer name is required" };
  }
  if (!input.items.length) {
    return { error: "Add at least one service or item" };
  }
  for (const item of input.items) {
    if (item.quantity <= 0) return { error: "Quantity must be greater than zero" };
    if (item.rate < 0) return { error: "Price cannot be negative" };
  }

  const supabase = await createClient();
  const shopId = await getShopId();

  const { data: shop, error: shopErr } = await supabase
    .from("shops")
    .select("*")
    .eq("id", shopId)
    .single();
  if (shopErr || !shop) return { error: "Unable to load shop settings" };

  const stockRequirements = new Map<string, number>();
  for (const item of input.items) {
    if (item.inventory_item_id && item.item_type !== "service") {
      stockRequirements.set(
        item.inventory_item_id,
        (stockRequirements.get(item.inventory_item_id) ?? 0) + item.quantity,
      );
    }
  }

  const stockChanges: {
    id: string;
    name: string;
    quantity: number;
    originalQuantity: number;
    requiredQuantity: number;
  }[] = [];
  for (const [id, requiredQuantity] of stockRequirements) {
    const { data: item, error } = await supabase
      .from("inventory_items")
      .select("id, name, quantity")
      .eq("id", id)
      .eq("shop_id", shopId)
      .maybeSingle();
    if (error || !item) {
      return { error: "An inventory item on this invoice could not be found" };
    }

    const quantity = Number(item.quantity);
    if (quantity < requiredQuantity) {
      return {
        error: `Not enough stock for ${item.name}. Available: ${quantity}; needed: ${requiredQuantity}.`,
      };
    }
    stockChanges.push({
      id,
      name: item.name,
      quantity,
      originalQuantity: quantity,
      requiredQuantity,
    });
  }

  const invoiceDate = input.invoice_date ?? new Date().toISOString().slice(0, 10);
  const invoiceNumber = buildInvoiceNumber(shop);
  const { subtotal, discountTotal, taxAmount, total } = calcInvoiceTotals(
    input.items,
    Number(shop.tax_rate),
    shop.show_tax
  );

  let amountPaid = input.amount_paid;
  if (input.payment_status === "paid") amountPaid = total;
  if (input.payment_status === "pending") amountPaid = 0;
  const balance = Math.max(0, total - amountPaid);

  let customerId = input.customerId;
  let bikeId = input.bikeId;

  if (!customerId) {
    const { data: customer, error: cErr } = await supabase
      .from("customers")
      .insert({
        shop_id: shopId,
        name: input.customerName.trim(),
        phone: input.customerPhone.trim(),
      })
      .select()
      .single();
    if (cErr) return { error: "Unable to save customer" };
    customerId = customer.id;
  }

  if (!bikeId && customerId && input.bikeRegistration.trim()) {
    const { data: existing } = await supabase
      .from("bikes")
      .select("id")
      .eq("customer_id", customerId)
      .eq("registration_number", input.bikeRegistration.trim())
      .maybeSingle();
    if (existing) {
      bikeId = existing.id;
    } else {
      const { data: bike } = await supabase
        .from("bikes")
        .insert({
          customer_id: customerId,
          name: input.bikeName.trim(),
          registration_number: input.bikeRegistration.trim(),
        })
        .select()
        .single();
      bikeId = bike?.id;
    }
  }

  const { data: invoice, error: invErr } = await supabase
    .from("invoices")
    .insert({
      shop_id: shopId,
      invoice_number: invoiceNumber,
      customer_id: customerId,
      bike_id: bikeId,
      customer_name: input.customerName.trim(),
      customer_phone: input.customerPhone.trim(),
      bike_name: input.bikeName.trim(),
      bike_registration: input.bikeRegistration.trim(),
      invoice_date: invoiceDate,
      subtotal,
      discount_total: discountTotal,
      tax_amount: taxAmount,
      total_amount: total,
      payment_method: input.payment_method,
      payment_status: input.payment_status,
      amount_paid: amountPaid,
      balance_due: balance,
    })
    .select()
    .single();

  if (invErr || !invoice) return { error: "Unable to create invoice" };

  const lineItems = input.items.map((item) => ({
    invoice_id: invoice.id,
    item_name: item.item_name,
    item_type: item.item_type,
    quantity: item.quantity,
    rate: item.rate,
    discount: item.discount,
    amount: calcLineAmount(item.quantity, item.rate, item.discount),
    service_id: item.service_id ?? null,
    inventory_item_id: item.inventory_item_id ?? null,
  }));

  const { error: itemsErr } = await supabase.from("invoice_items").insert(lineItems);
  if (itemsErr) return { error: "Unable to save invoice items" };

  const deducted: typeof stockChanges = [];
  for (const item of stockChanges) {
    const remaining = item.originalQuantity - item.requiredQuantity;
    const { data: updated, error } = await supabase
      .from("inventory_items")
      .update({ quantity: remaining })
      .eq("id", item.id)
      .eq("shop_id", shopId)
      .eq("quantity", item.originalQuantity)
      .select("id")
      .maybeSingle();

    if (error || !updated) {
      for (const previous of deducted.reverse()) {
        const { error: restoreError } = await supabase
          .from("inventory_items")
          .update({ quantity: previous.originalQuantity })
          .eq("id", previous.id)
          .eq("shop_id", shopId)
          .eq("quantity", previous.originalQuantity - previous.requiredQuantity);
        if (restoreError) {
          console.error(`Unable to restore stock for ${previous.name}:`, restoreError.message);
        }
      }

      const { error: rollbackError } = await supabase
        .from("invoices")
        .delete()
        .eq("id", invoice.id)
        .eq("shop_id", shopId);
      if (rollbackError) {
        console.error("Unable to remove invoice after stock deduction failed:", rollbackError.message);
      }
      return {
        error: rollbackError
          ? "Stock changed while saving and the invoice could not be rolled back. Please contact support before retrying."
          : "Stock changed while saving the invoice. No stock was deducted; please retry.",
      };
    }
    deducted.push(item);
  }

  await supabase
    .from("shops")
    .update({ invoice_next_number: shop.invoice_next_number + 1 })
    .eq("id", shopId);

  await supabase.from("activity_logs").insert({
    shop_id: shopId,
    message: `Invoice #${invoiceNumber} created`,
    entity_type: "invoice",
    entity_id: invoice.id,
  });

  revalidatePath("/app/dashboard");
  revalidatePath("/app/invoices");
  if (stockChanges.length > 0) revalidatePath("/app/inventory");
  return { data: invoice };
}

export async function deleteInvoice(id: string) {
  const supabase = await createClient();
  const shopId = await getShopId();
  const { error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", id)
    .eq("shop_id", shopId);
  if (error) return { error: "Unable to delete invoice" };
  revalidatePath("/app/invoices");
  return { success: true };
}

export async function getInvoiceWithItems(id: string) {
  const supabase = await createClient();
  const shopId = await getShopId();
  const { data: invoice } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .eq("shop_id", shopId)
    .single();
  if (!invoice) return null;
  const { data: items } = await supabase
    .from("invoice_items")
    .select("*")
    .eq("invoice_id", id)
    .order("created_at");
  const { data: shop } = await supabase
    .from("shops")
    .select("*")
    .eq("id", shopId)
    .single();
  return { invoice, items: items ?? [], shop };
}
