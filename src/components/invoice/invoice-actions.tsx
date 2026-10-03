"use client";

import { Button } from "@/components/ui/button";
import {
  buildWhatsAppMessage,
  whatsAppDeepLink,
} from "@/lib/invoice-utils";
import { useToast } from "@/components/providers/toast-provider";
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
  const { toast } = useToast();

  const handlePrint = () => {
    window.print();
  };

  const buildPdf = async () => {
    const el = document.getElementById("invoice-print-root");
    if (!el) return null;
    const canvas = await html2canvas(el, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
    });
    const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4", compress: true });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageHeightPixels = Math.floor((canvas.width * pageHeight) / pageWidth);
    const pageCanvas = document.createElement("canvas");
    const pageContext = pageCanvas.getContext("2d");
    if (!pageContext) throw new Error("Unable to prepare the invoice PDF.");
    pageCanvas.width = canvas.width;

    for (let page = 0, offsetY = 0; offsetY < canvas.height; page += 1) {
      const sliceHeight = Math.min(pageHeightPixels, canvas.height - offsetY);
      pageCanvas.height = sliceHeight;
      pageContext.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
      pageContext.drawImage(
        canvas,
        0,
        offsetY,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight,
      );
      if (page > 0) pdf.addPage();
      pdf.addImage(
        pageCanvas.toDataURL("image/jpeg", 0.95),
        "JPEG",
        0,
        0,
        pageWidth,
        (sliceHeight * pageWidth) / canvas.width,
        undefined,
        "FAST",
      );
      offsetY += sliceHeight;
    }
    return pdf;
  };

  const handlePdf = async () => {
    const pdf = await buildPdf();
    if (!pdf) return;
    const slug = shop.name.replace(/\s+/g, "-");
    pdf.save(`Bill-${invoice.invoice_number}-${slug}.pdf`);
  };

  const handleWhatsApp = async () => {
    const whatsappWindow = window.open("about:blank", "_blank");
    if (!whatsappWindow) {
      toast("Allow pop-ups to open WhatsApp and share this invoice.", "error");
      return;
    }
    whatsappWindow.opener = null;
    setSharing(true);
    try {
      const pdf = await buildPdf();
      if (!pdf) throw new Error("Unable to generate the invoice PDF.");

      const body = new FormData();
      body.append("file", pdf.output("blob"), `Bill-${invoice.invoice_number}.pdf`);
      body.append("invoiceId", invoice.id);
      const res = await fetch("/api/invoices/share-pdf", { method: "POST", body });
      const data = await res.json().catch(() => null);
      if (!res.ok || typeof data?.url !== "string" || !data.url) {
        throw new Error(data?.error || "Unable to create an invoice download link.");
      }

      const message = buildWhatsAppMessage({
        customerName: invoice.customer_name,
        shopName: shop.name,
        invoiceNumber: invoice.invoice_number,
        bikeName: invoice.bike_name,
        bikeRegistration: invoice.bike_registration,
        totalAmount: Number(invoice.total_amount),
        reportUrl: data.url,
      });
      whatsappWindow.location.href = whatsAppDeepLink(invoice.customer_phone, message);
    } catch (error) {
      whatsappWindow.close();
      toast(
        error instanceof Error ? error.message : "Unable to share the invoice.",
        "error",
      );
    } finally {
      setSharing(false);
    }
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
