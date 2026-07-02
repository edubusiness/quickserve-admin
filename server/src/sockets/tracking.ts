import type { Server } from "socket.io";

/** Bengaluru operating region bounding box. */
const BBOX = { minLat: 12.90, maxLat: 13.05, minLng: 77.52, maxLng: 77.68 };
const rand = (min: number, max: number) => min + Math.random() * (max - min);
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

interface Unit {
  id: string;
  type: "driver" | "provider" | "customer";
  lat: number;
  lng: number;
  vLat: number;
  vLng: number;
}

function seedUnits(): Unit[] {
  const units: Unit[] = [];
  const make = (id: string, type: Unit["type"], moving: boolean) => ({
    id,
    type,
    lat: rand(BBOX.minLat, BBOX.maxLat),
    lng: rand(BBOX.minLng, BBOX.maxLng),
    vLat: moving ? rand(-0.0009, 0.0009) : 0,
    vLng: moving ? rand(-0.0009, 0.0009) : 0,
  });
  for (let i = 0; i < 45; i++) units.push(make(`DRV-${5001 + i}`, "driver", true));
  for (let i = 0; i < 20; i++) units.push(make(`PRV-${8001 + i}`, "provider", Math.random() > 0.5));
  for (let i = 0; i < 15; i++) units.push(make(`CUS-${9001 + i}`, "customer", false));
  return units;
}

/**
 * Emits live driver/provider/customer positions every ~2s so the Live Tracking
 * map animates in real time. Drivers drift with a small velocity and bounce off
 * the city bounds; a share of them re-route each tick. Swap for real GPS pings
 * from partner apps in production.
 */
export function startTrackingStream(io: Server) {
  const units = seedUnits();

  const tick = () => {
    for (const u of units) {
      if (u.vLat === 0 && u.vLng === 0) continue;
      // Occasionally change heading so movement looks organic.
      if (Math.random() < 0.15) {
        u.vLat = rand(-0.0009, 0.0009);
        u.vLng = rand(-0.0009, 0.0009);
      }
      u.lat = clamp(u.lat + u.vLat, BBOX.minLat, BBOX.maxLat);
      u.lng = clamp(u.lng + u.vLng, BBOX.minLng, BBOX.maxLng);
      if (u.lat === BBOX.minLat || u.lat === BBOX.maxLat) u.vLat *= -1;
      if (u.lng === BBOX.minLng || u.lng === BBOX.maxLng) u.vLng *= -1;
    }
    io.emit(
      "positions",
      units.map((u) => ({ id: u.id, type: u.type, lat: Number(u.lat.toFixed(5)), lng: Number(u.lng.toFixed(5)) })),
    );
  };

  const timer = setInterval(tick, 2000);

  // Send the current snapshot immediately to any newly-connected client.
  io.on("connection", (socket) => {
    socket.emit(
      "positions",
      units.map((u) => ({ id: u.id, type: u.type, lat: Number(u.lat.toFixed(5)), lng: Number(u.lng.toFixed(5)) })),
    );
  });

  return () => clearInterval(timer);
}
