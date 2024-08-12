module.exports = {
  apps: [
    {
      name: "xchat-api",
      script: "server/www.js", // Ensure this path is correct
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
