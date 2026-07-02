import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV ?? "development";
const INSECURE_DEFAULT = "dev-insecure-secret-change-me";
const jwtSecret = process.env.JWT_SECRET ?? INSECURE_DEFAULT;

// Never boot production with the throwaway dev secret — that would let anyone
// forge a valid admin token. Fail loudly so it can't ship misconfigured.
if (nodeEnv === "production" && (!process.env.JWT_SECRET || jwtSecret === INSECURE_DEFAULT)) {
  throw new Error(
    "JWT_SECRET must be set to a strong, unique value in production. Refusing to start with the insecure default.",
  );
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv,
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  mongoUri: process.env.MONGODB_URI ?? "",
  /** When no Mongo URI is configured we run a zero-dependency in-memory store. */
  get useMemoryStore() {
    return !this.mongoUri;
  },
};
