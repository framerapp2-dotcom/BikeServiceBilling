import { getShopId } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const BUCKET = "invoice-pdfs";
const CODE_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";

function makeShareCode() {
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

function customerReportLink(code: string, pdfUrl: string) {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  let host = "";
  try {
    host = new URL(appUrl).hostname;
  } catch {
    host = "";
  }
  const isLocal = !host || host === "localhost" || host === "127.0.0.1";
  if (isLocal) return pdfUrl;
  return `${appUrl}/bill/${code}`;
}

export async function POST(request: Request) {
  try {
    const shopId = await getShopId();
    const form = await request.formData();
    const invoiceId = String(form.get("invoiceId") ?? "");
    const file = form.get("file");
    if (!invoiceId || !(file instanceof File)) {
      return NextResponse.json({ error: "Invoice PDF is missing" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: invoice } = await supabase
      .from("invoices")
      .select("id")
      .eq("id", invoiceId)
      .eq("shop_id", shopId)
      .maybeSingle();
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const admin = createAdminClient();
    const { data: buckets } = await admin.storage.listBuckets();
    if (!buckets?.some((bucket) => bucket.name === BUCKET)) {
      const { error: bucketError } = await admin.storage.createBucket(BUCKET, { public: true });
      if (bucketError && !bucketError.message.toLowerCase().includes("already")) {
        return NextResponse.json({ error: "Unable to store the invoice PDF" }, { status: 500 });
      }
    }

    const path = `${shopId}/${invoiceId}.pdf`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, bytes, {
      contentType: "application/pdf",
      upsert: true,
    });
    if (uploadError) {
      return NextResponse.json({ error: "Unable to store the invoice PDF" }, { status: 500 });
    }

    let shareCode = "";
    for (let attempt = 0; attempt < 5; attempt += 1) {
      shareCode = makeShareCode();
      const { error: codeError } = await admin
        .from("invoices")
        .update({ share_code: shareCode })
        .eq("id", invoiceId);
      if (!codeError) break;
      shareCode = "";
    }

    const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
    const url = shareCode ? customerReportLink(shareCode, data.publicUrl) : data.publicUrl;
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: "Unable to share the invoice" }, { status: 401 });
  }
}
