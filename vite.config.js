import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate', // Actualización automática
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'], // Archivos estáticos
      manifest: {
        name: 'Fit Plus Ultra',
        short_name: 'GymApp',
        description: 'Aplicación de ejercicios con gamificación para gimnasios',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png', 
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png', 
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    })
  ],
})