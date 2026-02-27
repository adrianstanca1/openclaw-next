import { resolve } from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.VITE_GATEWAY_URL": JSON.stringify(process.env.VITE_GATEWAY_URL || "wss://localhost:18789"),
    "process.env.VITE_GATEWAY_TOKEN": JSON.stringify(process.env.VITE_GATEWAY_TOKEN || ""),
    "process.env.VITE_OLLAMA_ENDPOINT": JSON.stringify(process.env.VITE_OLLAMA_ENDPOINT || "http://localhost:11434"),
    "process.env.VITE_OLLAMA_MODEL": JSON.stringify(process.env.VITE_OLLAMA_MODEL || "llama3.2"),
    "process.env.VITE_OLLAMA_CLOUD_ENABLED": JSON.stringify(process.env.VITE_OLLAMA_CLOUD_ENABLED || "false"),
    "process.env.VITE_OLLAMA_CLOUD_API_KEY": JSON.stringify(process.env.VITE_OLLAMA_CLOUD_API_KEY || ""),
    "process.env.VITE_OPENAI_API_KEY": JSON.stringify(process.env.VITE_OPENAI_API_KEY || ""),
    "process.env.VITE_ANTHROPIC_API_KEY": JSON.stringify(process.env.VITE_ANTHROPIC_API_KEY || ""),
    "process.env.VITE_GROQ_API_KEY": JSON.stringify(process.env.VITE_GROQ_API_KEY || ""),
    "process.env.VITE_DEBUG": JSON.stringify(process.env.VITE_DEBUG || "false"),
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      child_process: resolve(__dirname, "src/ui/stubs/node-stubs.ts"),
      fs: resolve(__dirname, "src/ui/stubs/node-stubs.ts"),
      path: resolve(__dirname, "src/ui/stubs/node-stubs.ts"),
      events: resolve(__dirname, "src/ui/stubs/node-stubs.ts"),
      http: resolve(__dirname, "src/ui/stubs/node-stubs.ts"),
      "node:events": resolve(__dirname, "src/ui/stubs/node-stubs.ts"),
      "node:http": resolve(__dirname, "src/ui/stubs/node-stubs.ts"),
      "node:path": resolve(__dirname, "src/ui/stubs/node-stubs.ts"),
      "node:buffer": resolve(__dirname, "src/ui/stubs/node-stubs.ts"),
      "node:fs": resolve(__dirname, "src/ui/stubs/node-stubs.ts"),
      "node:zlib": resolve(__dirname, "src/ui/stubs/node-stubs.ts"),
      "node:querystring": resolve(__dirname, "src/ui/stubs/node-stubs.ts"),
      "node:net": resolve(__dirname, "src/ui/stubs/node-stubs.ts"),
      url: resolve(__dirname, "src/ui/stubs/node-stubs.ts"),
      stream: resolve(__dirname, "src/ui/stubs/node-stubs.ts"),
      util: resolve(__dirname, "src/ui/stubs/node-stubs.ts"),
      crypto: resolve(__dirname, "src/ui/stubs/node-stubs.ts"),
      async_hooks: resolve(__dirname, "src/ui/stubs/node-stubs.ts"),
    },
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["lit", "zod"],
          state: ["zustand", "immer"],
        },
      },
    },
  },
});
