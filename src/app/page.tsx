import { ThemeToggle } from "@/components/layout/theme-toggle";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BikeScene, SpinningMark } from "@/components/landing/bike-scene";
import { SHOP_ADDRESS, SHOP_EMAIL, SHOP_NAME } from "@/lib/shop";
import {
  BarChart3,
  Boxes,
  MessageCircle,
  Receipt,
} from "lucide-react";

const features = [
  {
    icon: Receipt,
    title: "Fast Billing",
    description: "Create professional invoices in seconds.",
  },
  {
    icon: Boxes,
    title: "Inventory Management",
    description: "Track services, tools and spare parts.",
  },
  {
    icon: BarChart3,
    title: "Sales & Reports",
    description: "Understand your shop's financial performance.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Sharing",
    description: "Share invoices with customers instantly.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <div className="flex items-center gap-3">
          <SpinningMark />
          <span className="text-xs font-semibold leading-tight sm:text-sm">{SHOP_NAME}</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" className="text-slate-700 hover:text-slate-900">
              Login
            </Button>
          </Link>
          <Link href="/login">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-amber-400/10" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Padur · OMR
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">
              {SHOP_NAME}
            </h1>
            <p className="mt-6 text-lg text-slate-600">
              Create invoices, manage services, track inventory, monitor revenue
              and share bills with customers — all from one simple application.
            </p>
            <p className="mt-4 text-sm text-slate-600">{SHOP_ADDRESS}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/login">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-slate-300 bg-white text-slate-800">
                  Login
                </Button>
              </Link>
            </div>
          </div>
          <BikeScene />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-center text-3xl font-bold">Everything you need</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">
          Built for the workshop floor — billing, stock, and customer bills in one place.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition hover:border-primary/40 hover:shadow-card-hover"
            >
              <div className="mb-4 inline-flex rounded-xl bg-primary/20 p-3 text-primary">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-600">
        <p className="font-medium text-slate-900">{SHOP_NAME}</p>
        <p className="mt-2">{SHOP_ADDRESS}</p>
        <p className="mt-1">
          <a className="text-primary hover:underline" href={`mailto:${SHOP_EMAIL}`}>
            {SHOP_EMAIL}
          </a>
        </p>
        <p className="mt-4">© {new Date().getFullYear()} Bike service billing made simple.</p>
      </footer>
    </div>
  );
}
