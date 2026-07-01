// PM2 process manager config for a non-container deploy.
//   Build first:  npm run build  &&  (cd server && npm run build)
//   Then:         pm2 start ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "quickserve-api",
      cwd: "./server",
      script: "dist/index.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: "4000",
        MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/quickserve",
        CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "http://localhost:3000",
        JWT_SECRET: process.env.JWT_SECRET || "change-me-to-a-long-random-string",
        JWT_EXPIRES_IN: "7d",
      },
    },
    {
      name: "quickserve-web",
      // Uses the Next.js standalone server produced by `next build`.
      script: ".next/standalone/server.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
        API_URL: process.env.API_URL || "http://localhost:4000",
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "change-me-to-a-long-random-string",
      },
    },
  ],
};
