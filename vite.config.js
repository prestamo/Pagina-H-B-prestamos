import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'B&H Préstamos',
        short_name: 'B&H',
        description: 'B&H Préstamos en General - Tu mejor opción financiera',
        theme_color: '#0a2540',
        icons: [
          {
            src: 'assets/img/logob&H.jpeg',
            sizes: '192x192',
            type: 'image/jpeg',
            purpose: 'any'
          },
          {
            src: 'assets/img/logob&H.jpeg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any'
          }
        ]
      }
    })
  ]
});
