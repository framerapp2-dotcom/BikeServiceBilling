import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

const BUCKET = "invoice-pdfs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const admin = createAdminClient();
  const { data: invoice } = await admin
    .from("invoices")
    .select("id, shop_id, invoice_number")
    .eq("share_code", code)
    .maybeSingle();

  if (!invoice) {
    return new NextResponse("Invoice not found", { status: 404 });
  }

  const { data: pdf, error } = await admin.storage
    .from(BUCKET)
    .download(`${invoice.shop_id}/${invoice.id}.pdf`);
  if (error || !pdf) {
    return new NextResponse("Invoice PDF not found", { status: 404 });
  }

  const invoiceNumber = String(invoice.invoice_number).replace(/[^a-zA-Z0-9_-]/g, "");
  const filename = `Bill-${invoiceNumber || invoice.id}.pdf`;
  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "private, no-store",
    },
  });
}
