import type { Shop } from "@/lib/types";

export function buildInvoiceNumber(
  shop: Pick<Shop, "invoice_prefix" | "invoice_next_number">
): string {
  const seq = Math.max(1, Number(shop.invoice_next_number) || 1);
  return String(seq);
}

export function calcLineAmount(
  quantity: number,
  rate: number,
  discount: number
): number {
  return Math.max(0, quantity * rate - discount);
}

export function calcInvoiceTotals(
  items: { quantity: number; rate: number; discount: number }[],
  taxRate: number,
  showTax: boolean
) {
  const subtotal = items.reduce(
    (s, i) => s + calcLineAmount(i.quantity, i.rate, i.discount),
    0
  );
  const discountTotal = items.reduce((s, i) => s + i.discount, 0);
  const taxAmount = showTax ? (subtotal * taxRate) / 100 : 0;
  const total = subtotal + taxAmount;
  return { subtotal, discountTotal, taxAmount, total };
}

export function buildWhatsAppMessage(params: {
  customerName: string;
  shopName: string;
  invoiceNumber: string;
  bikeName?: string | null;
  bikeRegistration?: string | null;
  totalAmount: number;
  reportUrl?: string;
}): string {
  const lines = [
    `Hello ${params.customerName},`,
    "",
    `Thank you for visiting ${params.shopName}.`,
    "",
    "Your service invoice:",
  ];
  if (params.bikeName) lines.push(`Bike: ${params.bikeName}`);
  if (params.bikeRegistration) lines.push(`Bike No: ${params.bikeRegistration}`);
  lines.push(
    "",
    `Bill Number: ${params.invoiceNumber}`,
    `Total Amount: ₹${params.totalAmount.toLocaleString("en-IN")}`,
    "",
    ...(params.reportUrl
      ? ["Please find the invoice report link:", params.reportUrl]
      : ["Please find the invoice report."]),
    "",
    `Thank you for choosing ${params.shopName}.`,
    "Ride Safe! 🏍️",
  );
  return lines.join("\n");
}

export function whatsAppDeepLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
}
