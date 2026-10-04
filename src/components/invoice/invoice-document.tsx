"use client";

import type { Invoice, InvoiceItem, Shop } from "@/lib/types";
import { SHOP_ADDRESS, SHOP_EMAIL, SHOP_NAME, SHOP_PHONE, SHOP_WHATSAPP } from "@/lib/shop";
import { formatDate, formatINRDecimal } from "@/lib/utils";

export function InvoiceDocument({
  shop,
  invoice,
  items,
}: {
  shop: Shop;
  invoice: Invoice;
  items: InvoiceItem[];
}) {
  return (
    <div
      id="invoice-print-root"
      className="mx-auto max-w-3xl bg-white text-slate-900 p-8 print:p-6 print:shadow-none rounded-2xl shadow-card border border-border print:border-0"
    >
      <header className="border-b border-slate-200 pb-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold uppercase tracking-tight">{shop.name || SHOP_NAME}</h1>
          <div className="mt-2 text-sm leading-5 text-slate-700">
            <p className="text-center">
              {shop.address || SHOP_ADDRESS}
            </p>
            <p className="mt-1 text-center">
              {shop.phone || SHOP_PHONE}
              <span className="mx-2">|</span>
              WhatsApp: {SHOP_WHATSAPP}
            </p>
            <p className="mt-1 text-center">
              {shop.email || SHOP_EMAIL}
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 items-center text-sm">
          <p className="flex items-baseline gap-2">
            <span className="shrink-0 font-semibold">Bill Number</span>
            <span className="text-lg font-bold tabular-nums">{invoice.invoice_number}</span>
          </p>
          <p className="text-right">
            <span className="font-semibold">Date</span> {formatDate(invoice.invoice_date)}
          </p>
        </div>
      </header>

      <section className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-xs font-semibold uppercase text-slate-500">Customer</h2>
          <p className="font-medium">{invoice.customer_name}</p>
          <p className="text-sm text-slate-600">{invoice.customer_phone}</p>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase text-slate-500">Bike</h2>
          <p className="font-medium">{invoice.bike_name}</p>
          <p className="text-sm text-slate-600">{invoice.bike_registration}</p>
        </div>
      </section>

      <table className="mt-8 w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="py-2 text-left font-semibold">S.No</th>
            <th className="py-2 text-left font-semibold">Service / Item</th>
            <th className="py-2 text-right font-semibold">Qty</th>
            <th className="py-2 text-right font-semibold">Rate</th>
            <th className="py-2 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={item.id ?? idx} className="border-b border-slate-100">
              <td className="py-2.5">{idx + 1}</td>
              <td className="py-2.5">
                {item.item_name}
                <span className="ml-1 text-xs text-slate-500 capitalize">
                  ({item.item_type.replace("_", " ")})
                </span>
              </td>
              <td className="py-2.5 text-right">{item.quantity}</td>
              <td className="py-2.5 text-right">{formatINRDecimal(Number(item.rate))}</td>
              <td className="py-2.5 text-right font-medium">
                {formatINRDecimal(Number(item.amount))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Subtotal</span>
            <span>{formatINRDecimal(Number(invoice.subtotal))}</span>
          </div>
          {shop.show_discount && Number(invoice.discount_total) > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-600">Discount</span>
              <span>-{formatINRDecimal(Number(invoice.discount_total))}</span>
            </div>
          )}
          {shop.show_tax && Number(invoice.tax_amount) > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-600">Tax</span>
              <span>{formatINRDecimal(Number(invoice.tax_amount))}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold">
            <span>Total</span>
            <span className="text-primary">
              {formatINRDecimal(Number(invoice.total_amount))}
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Payment ({invoice.payment_method})</span>
            <span>Paid: {formatINRDecimal(Number(invoice.amount_paid))}</span>
          </div>
          {Number(invoice.balance_due) > 0 && (
            <div className="flex justify-between font-medium text-danger">
              <span>Balance Due</span>
              <span>{formatINRDecimal(Number(invoice.balance_due))}</span>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-10 border-t border-slate-200 pt-6 text-center text-sm text-slate-600">
        <p>Thank you for choosing {shop.name || SHOP_NAME}.</p>
        <p className="mt-2 text-center font-medium text-slate-800">
          Ride Safe!
        </p>
      </footer>
    </div>
  );
}
