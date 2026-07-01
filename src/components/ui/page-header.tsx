import { Plus } from "lucide-react";

export function PageHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-card-foreground">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {actionLabel && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 self-start rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-[var(--primary)]/30 transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
