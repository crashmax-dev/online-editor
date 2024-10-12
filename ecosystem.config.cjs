module.exports = {
  apps: [
    {
      name: "vite-build",
      watch: ["dist"],
      ignore_watch: ["node_modules", "src", "public"],
      script: "dist/index.js",
    },
  ],
};
