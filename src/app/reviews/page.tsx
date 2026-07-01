"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Star, Flag, MessageSquare, Search } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { StatCards } from "@/components/ui/stat-cards";
import { reviews, reviewSummary } from "@/data/reviews";
import { cn } from "@/lib/utils";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            "h-3.5 w-3.5",
            s <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30",
          )}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [query, setQuery] = useState("");
  const [minRating, setMinRating] = useState(0);

  const filtered = useMemo(
    () =>
      reviews.filter(
        (r) =>
          r.rating >= minRating &&
          (query === "" ||
            [r.customer, r.service, r.provider, r.comment]
              .join(" ")
              .toLowerCase()
              .includes(query.toLowerCase())),
      ),
    [query, minRating],
  );

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader
        title="Reviews & Ratings"
        subtitle="Moderate feedback, respond to customers and track service quality."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StatCards
            stats={[
              { label: "Total Reviews", value: reviewSummary.total, tone: "primary", icon: MessageSquare },
              { label: "Average Rating", value: reviewSummary.average, display: reviewSummary.average.toFixed(1), tone: "warning", icon: Star },
              { label: "5-Star", value: reviewSummary.fiveStar, tone: "success", icon: Star },
              { label: "Flagged", value: reviewSummary.flagged, tone: "danger", icon: Flag },
            ]}
          />
        </div>
        <Card className="p-4">
          <CardHeader title="Rating Distribution" />
          <ul className="mt-3 space-y-2">
            {reviewSummary.distribution.map((d) => {
              const pct = (d.count / reviewSummary.total) * 100;
              return (
                <li key={d.star} className="flex items-center gap-2 text-xs">
                  <span className="flex w-8 items-center gap-0.5 text-muted-foreground">
                    {d.star} <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-amber-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7 }}
                    />
                  </div>
                  <span className="w-6 text-right text-muted-foreground">{d.count}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reviews..."
            className="h-9 w-full rounded-lg border border-border bg-muted/40 pl-9 pr-3 text-sm text-card-foreground placeholder:text-muted-foreground/70 focus:border-[var(--primary)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
          />
        </div>
        <div className="flex gap-1.5">
          {[0, 5, 4, 3].map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(r)}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                minRating === r
                  ? "bg-[var(--primary)] text-primary-foreground"
                  : "border border-border text-muted-foreground hover:text-card-foreground",
              )}
            >
              {r === 0 ? "All" : `${r}+`}
              {r !== 0 && <Star className="h-3 w-3 fill-current" />}
            </button>
          ))}
        </div>
      </div>

      {/* Review grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i % 9) * 0.05 }}
          >
            <Card className="flex h-full flex-col p-4" hover>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <img src={r.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{r.customer}</p>
                    <p className="text-xs text-muted-foreground">{r.service}</p>
                  </div>
                </div>
                {r.flagged && (
                  <Badge tone="danger">
                    <Flag className="h-3 w-3" /> Flagged
                  </Badge>
                )}
              </div>
              <div className="mt-3">
                <Stars rating={r.rating} />
              </div>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">&ldquo;{r.comment}&rdquo;</p>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                <span>{r.provider}</span>
                <span>
                  {new Date(r.date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
