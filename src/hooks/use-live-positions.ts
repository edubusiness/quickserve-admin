"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface LivePosition {
  id: string;
  type: "driver" | "provider" | "customer";
  lat: number;
  lng: number;
}

/**
 * Subscribes to the API's Socket.IO "positions" stream (live driver/provider/
 * customer locations). Returns the latest snapshot and connection state.
 * Silently no-ops if the API is unreachable.
 */
export function useLivePositions() {
  const [positions, setPositions] = useState<LivePosition[]>([]);
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
    socket.on("positions", (data: LivePosition[]) => {
      if (Array.isArray(data)) setPositions(data);
    });

    return () => {
      socket.off("positions");
      socket.disconnect();
    };
  }, []);

  return { positions, connected };
}
