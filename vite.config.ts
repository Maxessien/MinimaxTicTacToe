import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import TailwindLegacyPlugin from 'vite-plugin-tailwind-legacy';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    TailwindLegacyPlugin({
      tailwindConfig: 'tailwind.config.legacy.js',
      assetsDir: 'assets',
      publicPath: '/assets/',
      injectInHTML: true,
    })
  ],
})
