require('dotenv').config();

module.exports = {
  apps: [
    {
      name: "xchat-admin",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 8082",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: process.env.NODE_ENV || "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
