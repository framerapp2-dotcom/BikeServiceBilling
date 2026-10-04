import { cn, formatINR, percentChange } from "@/lib/utils";
import { Card } from "./card";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  title,
  value,
  previousValue,
  icon: Icon,
  format = "currency",
  accent = "primary",
}: {
  title: string;
  value: number;
  previousValue?: number;
  icon: LucideIcon;
  format?: "currency" | "number";
  accent?: "primary" | "secondary" | "accent" | "warning";
}) {
  const change =
    previousValue !== undefined ? percentChange(value, previousValue) : null;
  const accentBg = {
    primary: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent",
    warning: "bg-warning/10 text-warning",
  }[accent];

  return (
    <Card hover className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-foreground-muted dark:text-slate-400">
            {title}
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground dark:text-slate-50">
            {format === "currency" ? formatINR(value) : value.toLocaleString("en-IN")}
          </p>
        </div>
        <div className={cn("rounded-xl p-3", accentBg)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {change !== null && (
        <div className="flex items-center gap-1 text-xs">
          {change >= 0 ? (
            <TrendingUp className="h-3.5 w-3.5 text-success" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-danger" />
          )}
          <span
            className={cn(
              "font-medium",
              change >= 0 ? "text-success" : "text-danger"
            )}
          >
            {change >= 0 ? "+" : ""}
            {change}%
          </span>
          <span className="text-foreground-muted">vs last month</span>
        </div>
      )}
    </Card>
  );
}
