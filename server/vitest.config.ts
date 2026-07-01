import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    // The in-memory store is a module singleton; run test files sequentially
    // so they don't race on shared state (deterministic results).
    fileParallelism: false,
    // Force in-memory mode + a deterministic secret for hermetic tests.
    env: {
      NODE_ENV: "test",
      MONGODB_URI: "",
      JWT_SECRET: "test-secret",
    },
    include: ["src/**/*.test.ts"],
  },
});
