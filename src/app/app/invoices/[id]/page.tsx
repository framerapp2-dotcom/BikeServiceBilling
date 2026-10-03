import { getInvoiceWithItems } from "@/app/actions/invoices";
import { InvoiceActions } from "@/components/invoice/invoice-actions";
import { InvoiceDocument } from "@/components/invoice/invoice-document";
import { notFound } from "next/navigation";
import type { Invoice, InvoiceItem, Shop } from "@/lib/types";

export default async function InvoicePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getInvoiceWithItems(id);
  if (!data) notFound();

  return (
    <div className="print:bg-white">
      <InvoiceActions
        shop={data.shop as Shop}
        invoice={data.invoice as Invoice}
        items={data.items as InvoiceItem[]}
      />
      <InvoiceDocument
        shop={data.shop as Shop}
        invoice={data.invoice as Invoice}
        items={data.items as InvoiceItem[]}
      />
    </div>
  );
}
