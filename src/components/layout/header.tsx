"use client";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Bell, LogOut, Menu, User } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export function Header({
  title,
  onMenuClick,
  userName,
  role,
}: {
  title: string;
  onMenuClick?: () => void;
  userName: string;
  role: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-900 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-foreground dark:text-slate-100 md:text-xl">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          type="button"
          className="rounded-xl p-2 text-foreground-muted hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"
            aria-label="User menu"
            aria-expanded={menuOpen}
          >
            <User className="h-5 w-5" />
          </button>
          {menuOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              />
              <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-border bg-white py-2 shadow-card-hover dark:border-slate-700 dark:bg-card-dark">
                <div className="border-b border-border px-4 py-2 dark:border-slate-700">
                  <p className="text-sm font-medium dark:text-slate-100">{userName}</p>
                  <p className="text-xs capitalize text-foreground-muted">{role}</p>
                </div>
                <Link
                  href="/app/settings"
                  className="block px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-200"
                  onClick={() => setMenuOpen(false)}
                >
                  Profile & Settings
                </Link>
              </div>
            </>
          )}
        </div>
        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className="flex h-10 w-10 items-center justify-center rounded-full text-danger hover:bg-red-50 dark:hover:bg-slate-800"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </form>
      </div>
    </header>
  );
}
