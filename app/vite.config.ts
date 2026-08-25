import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import compression from "vite-plugin-compression2";

const cdnUrl = process.env.VITE_CDN_URL;

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
  },
  ...(cdnUrl
    ? {
        experimental: {
          renderBuiltUrl: (filename: string) => `${cdnUrl}${filename}`,
        },
      }
    : {}),
  plugins: [compression(), react(), tanstackRouter(), tailwindcss()],
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("src", import.meta.url)),
    },
  },
  server: {
    cors: {
      origin: [
        "https://www.intern.dev.nav.no",
        "https://arbeidsgiver.ekstern.dev.nav.no",
        "http://localhost:9300",
      ],
    },
    origin: "http://localhost:5173",
  },
});
