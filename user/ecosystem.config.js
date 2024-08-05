module.exports = {
    apps: [
      {
        name: "xchat-front-office",
        script: "node_modules/next/dist/bin/next",
        args: "start -p 5000",
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
  