import { getCustomerDetails } from "@/app/actions/customers";
import { Card } from "@/components/ui/card";
import { formatDate, formatINR } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getCustomerDetails(id);
  if (!data) notFound();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold dark:text-slate-100">{data.customer.name}</h2>
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <p className="text-sm text-foreground-muted">Total visits</p>
          <p className="text-2xl font-bold">{data.stats.visits}</p>
        </Card>
        <Card>
          <p className="text-sm text-foreground-muted">Total spent</p>
          <p className="text-2xl font-bold">{formatINR(data.stats.totalSpent)}</p>
        </Card>
        <Card>
          <p className="text-sm text-foreground-muted">Invoices</p>
          <p className="text-2xl font-bold">{data.stats.totalInvoices}</p>
        </Card>
        <Card>
          <p className="text-sm text-foreground-muted">Last service</p>
          <p className="text-lg font-bold">
            {data.stats.lastService ? formatDate(data.stats.lastService) : "—"}
          </p>
        </Card>
      </div>
      <Card>
        <h3 className="font-semibold mb-2">Contact</h3>
        <p>{data.customer.phone}</p>
        {data.customer.email && <p>{data.customer.email}</p>}
        {data.customer.address && <p className="text-sm text-foreground-muted">{data.customer.address}</p>}
      </Card>
      <Card>
        <h3 className="font-semibold mb-3">Bikes</h3>
        <ul className="space-y-2">
          {data.bikes.map((b) => (
            <li key={b.id} className="text-sm">
              {b.name} — {b.registration_number}
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <h3 className="font-semibold mb-3">Invoice history</h3>
        <ul className="space-y-2">
          {data.invoices.map((inv) => (
            <li key={inv.id}>
              <Link href={`/app/invoices/${inv.id}`} className="text-primary hover:underline">
                {inv.invoice_number}
              </Link>
              <span className="text-foreground-muted text-sm ml-2">
                {formatDate(inv.invoice_date)} · {formatINR(Number(inv.total_amount))}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
