import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths()
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: true,
    deps: {
      optimizer: {
        web: {
          enabled: true,
        },
      },
    },
  },
  resolve: {
    alias: {
      app: fileURLToPath(new URL("./src/app", import.meta.url)),
      components: fileURLToPath(new URL("./src/components", import.meta.url)),
    }
  }
});
