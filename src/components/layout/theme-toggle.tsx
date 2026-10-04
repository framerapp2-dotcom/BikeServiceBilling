"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={() => {
        const nextTheme = isLight ? "dark" : "light";
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(nextTheme);
        localStorage.setItem("rg-theme", nextTheme);
        setTheme(nextTheme);
      }}
      className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
      aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
    >
      {isLight ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5 text-amber-400" />}
    </button>
  );
}
