
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // The crucial change is below:
  optimizeDeps: {
    include: [
      // Required by other features
      "xlsx",
      "jspdf-autotable",
    ],
    exclude: [
      "xlsx",
      "jspdf",
      "jspdf-autotable"
    ],
  },
  build: {
    rollupOptions: {
      external: [
        "xlsx",
        "jspdf",
        "jspdf-autotable",
      ],
    },
  },
}));
