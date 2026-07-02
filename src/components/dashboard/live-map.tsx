"use client";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mapMarkers } from "@/data/dashboard";
import { useModuleCollection } from "@/hooks/use-module-collection";
import { useLivePositions, type LivePosition } from "@/hooks/use-live-positions";
import { MAP_PROVIDERS_KEY, mapProviderSeed } from "@/components/settings/maps-section";

/**
 * Real Live Operations map. Uses Leaflet with the provider configured in
 * Settings → Maps & Location (OpenStreetMap by default — no API key). Positions
 * stream in live over Socket.IO and are clustered as you zoom out.
 */

const CENTER: [number, number] = [12.9716, 77.5946];
const SPAN = 0.09;
const toLatLng = (x: number, y: number): [number, number] => [
  CENTER[0] + (0.5 - y / 100) * SPAN,
  CENTER[1] + (x / 100 - 0.5) * SPAN,
];

const typeColor: Record<string, string> = {
  driver: "#10b981",
  provider: "#8b5cf6",
  customer: "#3b82f6",
};

const legend = [
  { label: "Drivers", color: typeColor.driver },
  { label: "Providers", color: typeColor.provider },
  { label: "Customers", color: typeColor.customer },
];

const dotIcon = (color: string) =>
  L.divIcon({
    className: "qs-live-dot",
    html: `<span style="display:block;width:14px;height:14px;border-radius:9999px;background:${color};border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.25)"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

/** Imperatively manages a Leaflet markercluster group and syncs it to props. */
function ClusterLayer({ points }: { points: LivePosition[] }) {
  const map = useMap();
  const groupRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    const group = L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 55, chunkedLoading: true });
    groupRef.current = group;
    map.addLayer(group);
    return () => {
      map.removeLayer(group);
      groupRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.clearLayers();
    const markers = points.map((p) =>
      L.marker([p.lat, p.lng], { icon: dotIcon(typeColor[p.type] ?? "#3b82f6") }).bindTooltip(
        `${p.type} · ${p.id}`,
        { direction: "top", offset: [0, -8] },
      ),
    );
    group.addLayers(markers);
  }, [points]);

  return null;
}

export function LiveMap() {
  const { data: providers = [] } = useModuleCollection(MAP_PROVIDERS_KEY, mapProviderSeed);
  const { positions, connected } = useLivePositions();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const active = (providers as any[]).find((p) => p.active) ?? mapProviderSeed[0];
  const tileUrl = String(active.tileUrl).replace("{key}", active.apiKey || "");
  const attribution = active.attribution ?? "© OpenStreetMap contributors";

  // Live stream when available; otherwise a static snapshot from seed markers.
  const points: LivePosition[] = positions.length
    ? positions
    : mapMarkers.map((m) => {
        const [lat, lng] = toLatLng(m.x, m.y);
        return { id: m.id, type: m.type as LivePosition["type"], lat, lng };
      });

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-card-foreground">Live Operations Map</h3>
          <Badge tone={connected ? "success" : "neutral"}>
            <span className={`mr-1 h-1.5 w-1.5 rounded-full ${connected ? "animate-pulse bg-emerald-400" : "bg-muted-foreground"}`} />
            {connected ? "Live" : "Connecting…"}
          </Badge>
          <span className="text-xs text-muted-foreground">{points.length} units · via {active.provider}</span>
        </div>
        <div className="flex items-center gap-3">
          {legend.map((l) => (
            <span key={l.label} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      <div className="h-[360px] w-full">
        <MapContainer center={CENTER} zoom={12} scrollWheelZoom className="h-full w-full" style={{ background: "var(--muted)" }}>
          <TileLayer url={tileUrl} attribution={attribution} />
          <ClusterLayer points={points} />
        </MapContainer>
      </div>
    </Card>
  );
}
