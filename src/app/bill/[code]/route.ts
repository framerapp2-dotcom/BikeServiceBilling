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
    .select("id, shop_id")
    .eq("share_code", code)
    .maybeSingle();

  if (!invoice) {
    return new NextResponse("Invoice not found", { status: 404 });
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(`${invoice.shop_id}/${invoice.id}.pdf`);
  return NextResponse.redirect(data.publicUrl);
}
