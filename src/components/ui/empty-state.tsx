import { Button } from "./button";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && (
        <div className="mb-4 rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground dark:text-slate-100">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-foreground-muted dark:text-slate-400">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button className="mt-6" onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
