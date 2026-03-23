import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

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
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        index_en: resolve(__dirname, 'index_english.html'),
        nosotros: resolve(__dirname, 'nosotros.html'),
        nosotros_en: resolve(__dirname, 'nosotros_english.html'),
        tipos: resolve(__dirname, 'tipos_prestamos.html'),
        tipos_en: resolve(__dirname, 'tipos_prestamos_english.html'),
        solicitud_es: resolve(__dirname, 'solicitud_español.html'),
        solicitud_en: resolve(__dirname, 'solicitud_english.html'),
        descubre: resolve(__dirname, 'descubre_mas.html'),
        adminLogin: resolve(__dirname, 'admin/login.html'),
        adminDashboard: resolve(__dirname, 'admin/index.html'),
        adminBanners: resolve(__dirname, 'admin/banners.html'),
        adminCarousel: resolve(__dirname, 'admin/carousel.html'),
        adminPromotions: resolve(__dirname, 'admin/promotions.html'),
        adminClientes: resolve(__dirname, 'admin/clientes.html'),
        adminCuotas: resolve(__dirname, 'admin/cuotas.html'),
        adminSolicitudes: resolve(__dirname, 'admin/solicitudes.html'),
        adminSolicitudesList: resolve(__dirname, 'admin/solicitudes_list.html'),
        adminFooter: resolve(__dirname, 'admin/footer.html')
      }
    }
  }
});
