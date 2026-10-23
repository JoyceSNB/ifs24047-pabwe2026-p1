import { sveltekit } from "@sveltejs/kit/vite";
import adapterBun from "@sveltejs/adapter-bun";
import tailwindcss from "@tailwindcss/vite";
import { svelteTesting } from "@testing-library/svelte/vite";
import { defineConfig, loadEnv } from "vite";
import process from "process";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(process.env.APP_PORT || env.APP_PORT) || 3000;
  const apiBase = (process.env.VITE_API_BASEURL || env.VITE_API_BASEURL || "http://localhost:8000").replace(/\/$/, "");

  return {
    plugins: [
      sveltekit({
        inlineStyleThreshold: 100000,
        adapter: adapterBun({ envPrefix: "APP_", serverOptions: { port } }),
      }),
      tailwindcss(),
      svelteTesting(),
    ],
    server: { port },
    preview: { port },
    build: { chunkSizeWarningLimit: 1500 },
    define: {
      // Base URL backend Express (tanpa akhiran /api).
      API_URL: JSON.stringify(apiBase),
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.ts",
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html", "lcov"],
        include: ["src/**/*.{js,ts,svelte}"],
        exclude: [
          "src/app.d.ts",
          "src/env.d.ts",
          "src/setupTests.ts",
          "src/test-utils.ts",
          "**/*.test.{js,ts}",
          "node_modules/**",
          ".svelte-kit/**",
        ],
        thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
      },
    },
  };
});
