import type { Server } from "socket.io";
import { store } from "../db/store.js";

const events = [
  { title: "New booking received", tone: "primary" },
  { title: "Provider accepted", tone: "success" },
  { title: "Driver on the way", tone: "accent" },
  { title: "Service in progress", tone: "warning" },
  { title: "Payment received", tone: "success" },
];

/**
 * Emits a synthetic live-activity event every few seconds so the dashboard
 * feed and KPIs update in real time. Replace with change streams / domain
 * events when wired to MongoDB.
 */
export function startActivityStream(io: Server) {
  setInterval(() => {
    const booking = store.bookings[Math.floor(Math.random() * store.bookings.length)];
    const event = events[Math.floor(Math.random() * events.length)];
    io.emit("activity", {
      id: `EVT-${Date.now()}`,
      title: event.title,
      tone: event.tone,
      detail: `${booking.service} · ${booking.customer}`,
      time: new Date().toISOString(),
    });
  }, 5000);

  io.on("connection", (socket) => {
    console.log(`🔌 client connected: ${socket.id}`);
    socket.emit("welcome", { message: "Connected to QuickServe live feed" });
    socket.on("disconnect", () => console.log(`🔌 client disconnected: ${socket.id}`));
  });
}
