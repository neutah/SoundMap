import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: '/SoundMap/',
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./setupTests.ts"], 
    include: ["**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: { 
      "@": path.resolve(__dirname, "./") 
    },
  },
});
