"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface LiveEvent {
  id: string;
  title: string;
  detail: string;
  time: string;
  tone: "primary" | "accent" | "success" | "warning" | "danger";
}

/**
 * Subscribes to the API's Socket.IO "activity" stream and keeps the most
 * recent events (newest first, capped). Returns connection state so the UI can
 * show a live indicator. Silently no-ops if the API is unreachable.
 */
export function useLiveActivity(max = 8) {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(API_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 3,
      timeout: 4000,
    });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => setConnected(false));
    socket.on("activity", (event: LiveEvent) => {
      setEvents((prev) => [event, ...prev].slice(0, max));
    });

    return () => {
      socket.off("activity");
      socket.disconnect();
    };
  }, [max]);

  return { events, connected };
}
