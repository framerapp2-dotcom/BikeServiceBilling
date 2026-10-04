"use client";

import { useEffect, useRef, useState } from "react";

const BAYS = [
  "Engine oil change",
  "Chain lubrication",
  "Brake service",
  "General service",
  "Water wash",
  "Puncture repair",
];

function Wheel({
  cx,
  cy,
  wheelRef,
}: {
  cx: number;
  cy: number;
  wheelRef: React.RefObject<SVGGElement | null>;
}) {
  const spokes = Array.from({ length: 10 }, (_, i) => i * 36);
  return (
    <g ref={wheelRef}>
      <circle cx={cx} cy={cy} r="38" fill="#111827" />
      <circle cx={cx} cy={cy} r="30" fill="#e5e7eb" />
      <circle cx={cx} cy={cy} r="22" fill="#f8fafc" />
      {spokes.map((deg) => (
        <line
          key={deg}
          x1={cx}
          y1={cy}
          x2={cx}
          y2={cy - 20}
          stroke="#64748b"
          strokeWidth="1.6"
          transform={`rotate(${deg} ${cx} ${cy})`}
        />
      ))}
      <circle cx={cx} cy={cy} r="7" fill="#f59e0b" stroke="#1e293b" strokeWidth="2" />
    </g>
  );
}

function ServiceBike({
  rearRef,
  frontRef,
}: {
  rearRef: React.RefObject<SVGGElement | null>;
  frontRef: React.RefObject<SVGGElement | null>;
}) {
  return (
    <svg viewBox="0 0 340 200" className="h-48 w-[320px] drop-shadow-md" aria-hidden>
      <ellipse cx="168" cy="186" rx="110" ry="8" fill="#94a3b8" opacity="0.45" />
      <path
        d="M118 142 C90 154 62 150 48 140"
        fill="none"
        stroke="#94a3b8"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path d="M86 150 L132 108 L196 104 L248 150" fill="none" stroke="#1e293b" strokeWidth="6" strokeLinejoin="round" />
      <path d="M132 108 L160 150" stroke="#1e293b" strokeWidth="5" />
      <rect x="136" y="116" width="54" height="30" rx="6" fill="#334155" />
      <rect x="146" y="124" width="18" height="14" rx="2" fill="#64748b" />
      <circle cx="176" cy="131" r="7" fill="#94a3b8" />
      <path d="M150 108 C172 78 214 76 226 108 L198 118 L146 116 Z" fill="#ea580c" />
      <path d="M168 88 C188 80 206 86 214 100" fill="none" stroke="#fdba74" strokeWidth="3" strokeLinecap="round" />
      <path d="M104 112 C128 94 162 96 178 112 L170 120 L108 122 Z" fill="#0f172a" />
      <path d="M46 132 C58 100 104 98 118 116" fill="none" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
      <path d="M208 104 L248 118" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
      <path d="M226 108 L242 150" stroke="#475569" strokeWidth="5" />
      <path d="M236 106 L252 150" stroke="#475569" strokeWidth="5" />
      <path d="M208 104 L230 74" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
      <path d="M222 80 L252 70" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
      <circle cx="246" cy="92" r="9" fill="#fef3c7" stroke="#1e293b" strokeWidth="2" />
      <path d="M214 124 C232 104 274 112 284 136" fill="none" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
      <Wheel cx={78} cy={152} wheelRef={rearRef} />
      <Wheel cx={250} cy={152} wheelRef={frontRef} />
    </svg>
  );
}

export function BikeScene() {
  const rearRef = useRef<SVGGElement>(null);
  const frontRef = useRef<SVGGElement>(null);
  const bikeRef = useRef<HTMLDivElement>(null);
  const dashRef = useRef<HTMLDivElement>(null);
  const needleRef = useRef<HTMLDivElement>(null);
  const [bay, setBay] = useState(0);
  const [km, setKm] = useState(12840);

  useEffect(() => {
    let frame = 0;
    let raf = 0;
    const tick = () => {
      frame += 1;
      const spin = frame * 7;
      const bob = Math.sin(frame / 8) * 3;
      const travel = (frame * 0.35) % 100;
      const ride = ((frame * 0.55) % 140) - 30;
      if (rearRef.current) {
        rearRef.current.setAttribute("transform", `rotate(${spin} 78 152)`);
      }
      if (frontRef.current) {
        frontRef.current.setAttribute("transform", `rotate(${spin} 250 152)`);
      }
      if (bikeRef.current) {
        bikeRef.current.style.transform = `translateX(${ride}%) translateY(${bob}px)`;
      }
      if (dashRef.current) {
        dashRef.current.style.backgroundPosition = `${-travel * 8}px 0`;
      }
      if (needleRef.current) {
        const sweep = 28 + Math.sin(frame / 40) * 42;
        needleRef.current.style.transform = `rotate(${sweep}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setBay((current) => (current + 1) % BAYS.length);
      setKm((current) => current + 1);
    }, 2400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
      <div className="flex items-center justify-between px-5 pt-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-primary">Live bay</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{BAYS[bay]}</p>
        </div>
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-slate-300" />
          <div className="absolute inset-2 rounded-full border border-slate-200" />
          <div
            ref={needleRef}
            className="absolute left-1/2 top-1/2 h-6 w-0.5 origin-bottom bg-amber-400"
            style={{ transform: "translateX(-50%) rotate(20deg)" }}
          />
          <span className="absolute bottom-1 left-0 right-0 text-center text-[9px] text-slate-500">
            km/h
          </span>
        </div>
      </div>

      <div className="relative mt-2 h-72 overflow-hidden bg-gradient-to-b from-sky-100 to-sky-50">
        <div className="absolute left-8 top-6 h-10 w-24 rounded-full bg-white/80" />
        <div className="absolute right-16 top-10 h-8 w-16 rounded-full bg-white/70" />
        <div className="absolute inset-x-0 bottom-0 z-0 h-16 bg-slate-300">
          <div
            ref={dashRef}
            className="absolute left-0 right-0 top-7 h-1.5"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, #1e293b 0 28px, transparent 28px 56px)",
            }}
          />
        </div>
        <div ref={bikeRef} className="absolute bottom-4 left-0 z-10">
          <ServiceBike rearRef={rearRef} frontRef={frontRef} />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm text-slate-600">
        <span>Workshop odometer</span>
        <span className="font-mono text-base font-semibold text-primary">{km.toLocaleString("en-IN")} km</span>
      </div>
    </div>
  );
}

export function SpinningMark({ variant = "default" }: { variant?: "default" | "workshop" }) {
  const wheelRef = useRef<SVGGElement>(null);

  useEffect(() => {
    let frame = 0;
    let raf = 0;
    const tick = () => {
      frame += 1;
      if (wheelRef.current) {
        wheelRef.current.setAttribute("transform", `rotate(${frame * 4} 20 20)`);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <svg viewBox="0 0 40 40" className="h-10 w-10" aria-hidden>
      <rect width="40" height="40" rx="12" fill={variant === "workshop" ? "#ea580c" : "#2563EB"} />
      <g ref={wheelRef}>
        <circle cx="20" cy="20" r="11" fill="none" stroke="white" strokeWidth="2.5" />
        <circle cx="20" cy="20" r="2.5" fill="#fbbf24" />
        {Array.from({ length: 6 }, (_, i) => (
          <line
            key={i}
            x1="20"
            y1="20"
            x2="20"
            y2="10"
            stroke="white"
            strokeWidth="1.5"
            transform={`rotate(${i * 60} 20 20)`}
          />
        ))}
      </g>
    </svg>
  );
}
