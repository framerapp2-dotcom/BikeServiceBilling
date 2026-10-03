import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  paid: "bg-success/15 text-success",
  pending: "bg-warning/15 text-warning",
  partial: "bg-primary/15 text-primary",
  active: "bg-success/15 text-success",
  inactive: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  in_stock: "bg-success/15 text-success",
  low_stock: "bg-warning/15 text-warning",
  out_of_stock: "bg-danger/15 text-danger",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        variants[variant] ?? "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
        className
      )}
    >
      {children}
    </span>
  );
}
