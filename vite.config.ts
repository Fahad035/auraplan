import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";

const analyze = process.env.ANALYZE === "true";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ...(analyze
      ? [
          visualizer({
            filename: "dist/bundle-analysis.html",
            template: "treemap",
            gzipSize: true,
            brotliSize: true,
            open: false,
          }),
        ]
      : []),
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      include: ["src/domain/**", "src/lib/**", "api/**"],
      reporter: ["text", "lcov"],
      thresholds: { lines: 80, functions: 80, statements: 80, branches: 70 },
    },
  },
});