import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// proxying /api to the Express server during dev so we don't have to deal
// with CORS or hardcode a port in every fetch call
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:4000",
      "/guidance-docs": "http://localhost:4000",
    },
  },
});
