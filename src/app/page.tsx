import { BikeScene, SpinningMark } from "@/components/landing/bike-scene";
import { Button } from "@/components/ui/button";
import { SHOP_ADDRESS, SHOP_EMAIL, SHOP_NAME, SHOP_PHONE, SHOP_WHATSAPP } from "@/lib/shop";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock3,
  Disc3,
  Droplets,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import Link from "next/link";

const phoneDigits = SHOP_PHONE.replace(/\D/g, "");
const whatsappDigits = SHOP_WHATSAPP.replace(/\D/g, "");
const mapUrl = "https://maps.app.goo.gl/ErVTASUBrmiz8TPC8";
const whatsappUrl = `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
  `Hello ${SHOP_NAME}, I would like to enquire about bike service.`,
)}`;

const services = [
  {
    number: "01",
    icon: Wrench,
    title: "General servicing",
    description: "Routine checks and maintenance to keep your motorcycle ready for every ride.",
  },
  {
    number: "02",
    icon: Droplets,
    title: "Oil change",
    description: "Engine oil replacement and essential fluid checks for smoother running.",
  },
  {
    number: "03",
    icon: Disc3,
    title: "Brake & chain care",
    description: "Brake inspection, chain cleaning, lubrication and adjustment.",
  },
  {
    number: "04",
    icon: ShieldCheck,
    title: "Repairs & check-ups",
    description: "Practical diagnostics and repair support for common workshop needs.",
  },
];

const highlights = ["Friendly local workshop", "Clear service invoices", "Easy WhatsApp enquiries"];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f7f4] text-slate-950">
      <header className="border-b border-slate-200/80 bg-[#f7f7f4]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <a href="#" className="flex min-w-0 items-center gap-3" aria-label={`${SHOP_NAME} home`}>
            <SpinningMark />
            <span className="max-w-52 text-xs font-bold leading-tight sm:max-w-none sm:text-sm">
              {SHOP_NAME}
            </span>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a className="transition hover:text-slate-950" href="#services">Services</a>
            <a className="transition hover:text-slate-950" href="#about">About</a>
            <a className="transition hover:text-slate-950" href="#contact">Contact</a>
          </nav>
          <Link
            href="/login"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold transition hover:border-slate-950 hover:bg-slate-950 hover:text-white"
          >
            Staff login <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <section className="relative">
        <div className="pointer-events-none absolute -right-40 -top-36 h-[34rem] w-[34rem] rounded-full bg-orange-200/50 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-orange-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {SHOP_NAME} · Padur
            </div>
            <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Your next ride
              <br />
              <span className="text-orange-600">starts with</span>
              <br />
              good service.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Trusted motorcycle servicing and repairs at {SHOP_NAME}, Padur. Get in touch
              with our workshop and let us help get your bike road-ready.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-orange-600 px-6 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition hover:-translate-y-0.5 hover:bg-orange-700"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Enquire on WhatsApp
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={`tel:+${phoneDigits}`}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 text-sm font-bold transition hover:border-slate-950"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                Call {SHOP_PHONE}
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-600">
              {highlights.map((highlight) => (
                <span key={highlight} className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                  {highlight}
                </span>
              ))}
            </div>
            <a
              href="#services"
              className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
            >
              Explore workshop services
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rotate-2 rounded-[2rem] bg-orange-200/60" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/10">
              <BikeScene />
            </div>
            <div className="absolute -bottom-5 left-5 right-5 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:left-10 sm:right-10">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Find our workshop</p>
                  <p className="mt-0.5 text-sm font-semibold">Padur Roundana, OMR</p>
                </div>
              </div>
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white transition hover:bg-orange-600"
                aria-label="Get directions to the workshop"
              >
                <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="scroll-mt-8 bg-slate-950 px-5 py-20 text-white sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">Workshop services</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                The care your bike needs.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-400">
              From regular maintenance to common repairs, talk to our team about what your
              motorcycle needs.
            </p>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <article key={service.number} className="bg-slate-950 p-6 transition hover:bg-slate-900 sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                    <service.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-xs text-slate-500">{service.number}</span>
                </div>
                <h3 className="mt-8 text-lg font-semibold">{service.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{service.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="scroll-mt-8 px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700">Made for local riders</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Straightforward service. Clear communication.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <Clock3 className="h-6 w-6 text-orange-600" aria-hidden="true" />
              <h3 className="mt-4 font-semibold">Easy to reach</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Call or message us to discuss your bike and plan a workshop visit.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <Wrench className="h-6 w-6 text-orange-600" aria-hidden="true" />
              <h3 className="mt-4 font-semibold">Clear service records</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                We provide an itemized invoice for the work and parts recorded for your service.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-8 px-5 pb-20 sm:px-8 sm:pb-24">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 rounded-[2rem] bg-orange-600 p-7 text-white sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:p-12">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-100">Visit or get in touch</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Let&apos;s get you back on the road.</h2>
            <p className="mt-4 flex gap-2 text-sm leading-6 text-orange-50">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              {SHOP_ADDRESS}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
            <a
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-slate-950 transition hover:bg-orange-50"
            >
              Get directions <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/50 px-6 text-sm font-bold text-white transition hover:bg-white/10"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              WhatsApp us
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold">{SHOP_NAME}</p>
            <a className="mt-1 inline-block text-sm text-slate-600 hover:text-orange-700" href={`mailto:${SHOP_EMAIL}`}>
              {SHOP_EMAIL}
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold hover:border-slate-950" href={`tel:+${phoneDigits}`}>
              <Phone className="h-4 w-4" aria-hidden="true" /> Call us
            </a>
            <Link href="/login">
              <Button variant="outline" className="rounded-full">
                Staff login <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-7xl text-xs text-slate-500">
          © {new Date().getFullYear()} {SHOP_NAME}
        </p>
      </footer>
    </main>
  );
}
