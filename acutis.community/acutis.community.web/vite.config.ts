import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({ plugins: [react()], optimizeDeps: { noDiscovery: true, include: ["react", "react-dom/client", "keycloak-js", "livekit-client", "lucide-react"] }, server: { port: 3020 }, preview: { port: 3020 } });
