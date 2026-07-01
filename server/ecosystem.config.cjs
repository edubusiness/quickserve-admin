// PM2 process configuration — `pm2 start ecosystem.config.cjs`
module.exports = {
  apps: [
    {
      name: "quickserve-api",
      script: "npm",
      args: "run start",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
    },
  ],
};
