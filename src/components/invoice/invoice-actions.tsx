"use client";

import { Button } from "@/components/ui/button";
import {
  buildWhatsAppMessage,
  whatsAppDeepLink,
} from "@/lib/invoice-utils";
import type { Invoice, InvoiceItem, Shop } from "@/lib/types";
import { Download, MessageCircle, Printer } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useState } from "react";

export function InvoiceActions({
  shop,
  invoice,
}: {
  shop: Shop;
  invoice: Invoice;
  items: InvoiceItem[];
}) {
  const [sharing, setSharing] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const buildPdf = async () => {
    const el = document.getElementById("invoice-print-root");
    if (!el) return null;
    const canvas = await html2canvas(el, { scale: 2, useCORS: true });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;
    pdf.addImage(img, "PNG", 0, 0, w, h);
    return pdf;
  };

  const handlePdf = async () => {
    const pdf = await buildPdf();
    if (!pdf) return;
    const slug = shop.name.replace(/\s+/g, "-");
    pdf.save(`Bill-${invoice.invoice_number}-${slug}.pdf`);
  };

  const handleWhatsApp = async () => {
    const pdf = await buildPdf();
    if (!pdf) return;
    setSharing(true);
    let reportUrl = "";
    try {
      const body = new FormData();
      body.append("file", pdf.output("blob"), `Bill-${invoice.invoice_number}.pdf`);
      body.append("invoiceId", invoice.id);
      const res = await fetch("/api/invoices/share-pdf", { method: "POST", body });
      const data = await res.json();
      if (res.ok && data.url) reportUrl = data.url;
    } catch {
      reportUrl = "";
    }
    setSharing(false);
    const message = buildWhatsAppMessage({
      customerName: invoice.customer_name,
      shopName: shop.name,
      invoiceNumber: invoice.invoice_number,
      bikeName: invoice.bike_name,
      bikeRegistration: invoice.bike_registration,
      totalAmount: Number(invoice.total_amount),
      reportUrl,
    });
    window.open(whatsAppDeepLink(invoice.customer_phone, message), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="print:hidden flex flex-wrap gap-3 mb-6">
      <Button onClick={handlePrint} variant="outline">
        <Printer className="h-4 w-4" />
        Print Invoice
      </Button>
      <Button onClick={handlePdf} variant="outline">
        <Download className="h-4 w-4" />
        Download PDF
      </Button>
      <Button onClick={handleWhatsApp} variant="secondary" loading={sharing}>
        <MessageCircle className="h-4 w-4" />
        Share on WhatsApp
      </Button>
      <p className="w-full text-xs text-foreground-muted">
        Opens that customer&apos;s WhatsApp chat with the bill message and the invoice report link.
      </p>
    </div>
  );
}
