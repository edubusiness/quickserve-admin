import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
  jwtSecret: process.env.JWT_SECRET ?? "dev-insecure-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  mongoUri: process.env.MONGODB_URI ?? "",
  /** When no Mongo URI is configured we run a zero-dependency in-memory store. */
  get useMemoryStore() {
    return !this.mongoUri;
  },
};
