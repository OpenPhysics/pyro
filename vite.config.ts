import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  optimizeDeps: {
    exclude: ["@astral-sh/ruff-wasm-web"],
  },
  server: {
    port: 8080,
    open: true,
  },
});
