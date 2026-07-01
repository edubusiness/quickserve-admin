"use client";

import { motion } from "framer-motion";
import { Car, Briefcase, Plus, Minus, Maximize2, Settings2, Navigation } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mapMarkers } from "@/data/dashboard";
import { toneVar, type Tone } from "@/lib/tones";

/**
 * Stylized live operations map. In production this mounts React-Leaflet /
 * Google Maps with marker clustering, traffic + heat layers and live sockets.
 * Here we render a performant, theme-aware visual stand-in with animated
 * markers, a route preview and zoom controls.
 */
export function LiveMap() {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-card-foreground">
            Live Operations Map
          </h3>
          <Badge tone="success">
            <span className="mr-1 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Live
          </Badge>
        </div>
        <button className="text-xs font-medium text-[var(--accent)] hover:underline">
          View Full Map
        </button>
      </div>

      <div className="relative h-[360px] w-full overflow-hidden">
        {/* Map base */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--primary) 22%, transparent), transparent 45%), radial-gradient(circle at 75% 70%, color-mix(in srgb, var(--accent) 20%, transparent), transparent 45%), var(--background)",
          }}
        />
        {/* Grid streets */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.18]" aria-hidden>
          <defs>
            <pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse">
              <path d="M 44 0 L 0 0 0 44" fill="none" stroke="var(--muted-foreground)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Animated route preview */}
        <svg className="absolute inset-0 h-full w-full" aria-hidden>
          <motion.path
            d="M 18% 75% Q 45% 50% 58% 40% T 80% 22%"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="6 8"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
          />
        </svg>

        {/* Markers */}
        {mapMarkers.map((m, i) => (
          <motion.div
            key={m.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${m.x}%`, top: `${m.y}%` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 * i, type: "spring", stiffness: 260 }}
          >
            <div className="relative">
              <span
                className="absolute inset-0 rounded-full"
                style={{
                  background: toneVar[m.tone as Tone],
                  animation: "var(--animate-pulse-ring)",
                }}
              />
              <div
                className="relative grid h-9 w-9 place-items-center rounded-full ring-2 ring-white/30 shadow-lg"
                style={{ background: toneVar[m.tone as Tone] }}
              >
                {m.avatar ? (
                  <img src={m.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
                ) : m.type === "driver" ? (
                  <Car className="h-4 w-4 text-white" />
                ) : (
                  <Briefcase className="h-4 w-4 text-white" />
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Route tooltip card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass absolute left-1/2 top-[44%] w-44 -translate-x-1/2 rounded-xl p-3 text-xs shadow-xl"
        >
          <p className="font-mono text-[11px] text-muted-foreground">#BK-12458</p>
          <p className="font-semibold text-card-foreground">Home Cleaning</p>
          <p className="mt-0.5 flex items-center gap-1 text-[var(--accent)]">
            <Navigation className="h-3 w-3" /> ETA: 18 min
          </p>
        </motion.div>

        {/* Zoom / controls */}
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          {[Plus, Minus, Maximize2, Settings2].map((Icon, i) => (
            <button
              key={i}
              className="glass grid h-9 w-9 place-items-center rounded-lg text-card-foreground transition-colors hover:bg-[var(--primary)]/20"
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="glass absolute bottom-3 left-3 flex items-center gap-3 rounded-lg px-3 py-2 text-[11px] text-card-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Drivers
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: "var(--accent)" }} /> Providers
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: "var(--primary)" }} /> Customers
          </span>
        </div>
      </div>
    </Card>
  );
}
