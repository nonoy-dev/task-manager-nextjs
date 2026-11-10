import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    exclude: [...configDefaults.exclude, "**/integration/**", "**/e2e/**"],
  },
  resolve: {
    alias: {
      "@": import.meta.dirname,
    },
  },
});
