import { createServer } from "http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { connectDb } from "./db/connect.js";
import { seedUsers, seedDatabase } from "./seed/seed.js";
import { startActivityStream } from "./sockets/activity.js";
import { startTrackingStream } from "./sockets/tracking.js";
import { env } from "./config/env.js";

async function bootstrap() {
  await connectDb();
  await seedDatabase();
  await seedUsers();

  const app = createApp();
  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    cors: { origin: env.clientOrigin.split(","), credentials: true },
  });
  startActivityStream(io);
  startTrackingStream(io);

  httpServer.listen(env.port, () => {
    console.log(`\n🚀 QuickServe API running on http://localhost:${env.port}`);
    console.log(`   Health:  http://localhost:${env.port}/health`);
    console.log(`   Login:   POST /api/auth/login  (admin@quickserve.io / admin123)\n`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
