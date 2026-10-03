import { getProfile } from "@/lib/auth";
import { SHOP_NAME } from "@/lib/shop";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  const shop = profile?.shops as { name?: string } | null;
  const shopName =
    shop?.name ??
    process.env.NEXT_PUBLIC_DEFAULT_SHOP_NAME ??
    SHOP_NAME;

  return (
    <AppShell
      title=""
      shopName={shopName}
      userName={profile?.full_name ?? "Owner"}
      role={profile?.role ?? "owner"}
    >
      {children}
    </AppShell>
  );
}
