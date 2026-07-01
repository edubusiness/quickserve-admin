import { Card } from "@/components/ui/card";

/** Loading placeholder shown while a resource collection is being fetched. */
export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="skeleton h-9 w-64 rounded-lg" />
        <div className="flex gap-1.5">
          <div className="skeleton h-9 w-16 rounded-lg" />
          <div className="skeleton h-9 w-16 rounded-lg" />
          <div className="skeleton h-9 w-16 rounded-lg" />
        </div>
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5">
            <div className="skeleton h-9 w-9 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3 w-1/3 rounded" />
              <div className="skeleton h-2.5 w-1/4 rounded" />
            </div>
            <div className="skeleton h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card className="p-10 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Make sure the API server is running on <code className="text-[var(--accent)]">:4000</code>.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] px-4 py-2 text-sm font-medium text-white"
        >
          Retry
        </button>
      )}
    </Card>
  );
}
