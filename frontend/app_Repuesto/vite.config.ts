import { defineConfig } from 'vite';

// Configuración de Vite para asegurar compatibilidad en producción
export default defineConfig({
  build: {
    target: 'es2022',
    minify: 'terser',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    // Forzamos que los assets se manejen con rutas relativas si es necesario
    assetsDir: 'assets',
  },
  server: {
    // Permitir hosts de ngrok y netlify
    allowedHosts: [
      '.ngrok-free.dev',
      '.netlify.app',
      'localhost'
    ]
  }
});
