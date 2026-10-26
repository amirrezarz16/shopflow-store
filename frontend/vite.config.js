
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(currentDirectory, "..");

export default defineConfig({
  plugins: [react()],
  test: {
  environment: "jsdom",
  clearMocks: true,
  restoreMocks: true,
  },
  server: {
    fs: {
      allow: [repositoryRoot],
    },
  },
});
