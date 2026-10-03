"use client";

import { SpinningMark } from "@/components/landing/bike-scene";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Receipt,
  Users,
  Boxes,
  Wrench,
  Wallet,
  UsersRound,
  BarChart3,
  Settings,
  X,
} from "lucide-react";

const nav = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/invoices", label: "Invoices", icon: Receipt },
  { href: "/app/customers", label: "Customers", icon: Users },
  { href: "/app/inventory", label: "Inventory", icon: Boxes },
  { href: "/app/services", label: "Services", icon: Wrench },
  { href: "/app/expenses", label: "Expenses", icon: Wallet },
  { href: "/app/employees", label: "Employees", icon: UsersRound },
  { href: "/app/reports", label: "Reports", icon: BarChart3 },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  shopName,
  open,
  onClose,
}: {
  shopName: string;
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-label="Close menu"
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-slate-200 bg-white text-slate-800 shadow-sm transition-transform duration-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-4 dark:border-slate-700">
          <Link href="/app/dashboard" className="flex min-w-0 items-center gap-2">
            <SpinningMark />
            <div className="min-w-0">
              <p className="line-clamp-2 text-[11px] font-semibold leading-tight">{shopName}</p>
              <p className="text-[10px] text-slate-500">Management</p>
            </div>
          </Link>
          <button
            type="button"
            className="rounded-lg p-1 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/app/dashboard" &&
                pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-white"
                    : "text-slate-700 hover:bg-blue-50 hover:text-primary"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
