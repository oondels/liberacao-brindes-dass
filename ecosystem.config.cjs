module.exports = {
  apps: [
    {
      name: "Liberacao-brindes",
      cwd: __dirname,
      script: "./dist/index.js",

      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: "10s",
      time: true,
      max_memory_restart: "1G"
    }
  ]
};
