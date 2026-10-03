"use client";

import Link from "next/link";
import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

export function AppShell({
  children,
  title,
  shopName,
  userName,
  role,
}: {
  children: React.ReactNode;
  title: string;
  shopName: string;
  userName: string;
  role: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar
        shopName={shopName}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="lg:pl-64">
        <Header
          title={title}
          userName={userName}
          role={role}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="p-4 pb-24 lg:p-8">{children}</main>
      </div>
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-white dark:border-slate-700 dark:bg-card-dark lg:hidden"
        aria-label="Mobile navigation"
      >
        {[
          { href: "/app/dashboard", label: "Home" },
          { href: "/app/invoices", label: "Invoices" },
          { href: "/app/invoices/new", label: "New" },
          { href: "/app/customers", label: "Customers" },
          { href: "/app/settings", label: "More" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            prefetch
            className="flex flex-1 flex-col items-center py-2 text-xs text-foreground-muted hover:text-primary"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
