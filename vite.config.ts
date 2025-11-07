import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Charger les variables d'environnement
  const env = loadEnv(mode, process.cwd(), '');

  // Log pour déboguer (sera visible dans les logs de build Railway)
  console.log('🔧 Vite build mode:', mode);
  console.log('🔑 VITE_GOOGLE_MAPS_API_KEY présente:', !!env.VITE_GOOGLE_MAPS_API_KEY);

  return {
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
    // Exposer explicitement les variables d'environnement
    define: {
      'import.meta.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(env.VITE_GOOGLE_MAPS_API_KEY || ''),
    },
    build: {
      // Optimisations pour Railway
      sourcemap: false, // Désactive les sourcemaps en prod (gain de temps)
      minify: 'esbuild', // esbuild est plus rapide que terser
      target: 'es2015', // Cible moderne pour moins de transpilation
      rollupOptions: {
        output: {
          manualChunks: {
            // Sépare les grosses dépendances pour un meilleur cache
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
            'map-vendor': ['mapbox-gl'],
          },
        },
      },
      chunkSizeWarningLimit: 1000, // Augmente la limite pour éviter les warnings
    },
  };
});
