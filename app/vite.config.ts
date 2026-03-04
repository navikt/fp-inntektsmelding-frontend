import { fileURLToPath, URL } from "node:url";

import { sentryVitePlugin } from "@sentry/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import compression from "vite-plugin-compression2";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    compression(),
    react(),
    tanstackRouter(),
    tailwindcss(),
    // Put the Sentry vite plugin after all other plugins
    sentryVitePlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN, // Kommer fra Github organization secrets
      disable: !process.env.SENTRY_AUTH_TOKEN, // Ikke last opp source maps hvis token ikke er satt. Token er bare satt når det bygges fra master branch
      org: "nav",
      project: "fp-inntektsmelding-frontend",
      url: "https://sentry.gc.nav.no",
      release: {
        name: process.env.VITE_SENTRY_RELEASE, // Lages av "generate-build-version" i build workflow
      },
    }),
  ],
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("src", import.meta.url)),
    },
  },
  server: {
    cors: {
      origin: [new RegExp("dev.nav.no$"), "http://localhost:9300"],
    },
    origin: "http://localhost:5173",
  },
});
