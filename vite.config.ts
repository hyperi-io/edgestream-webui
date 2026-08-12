import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: false,
      filename: 'bundle-stats.html',
      gzipSize: true,
      brotliSize: true,
    }) as PluginOption,
  ],
  define: {
    global: 'window',
  },
  optimizeDeps: {
    include: ['google-protobuf', 'grpc-web'],
  },
  resolve: {
    tsconfigPaths: true,
    alias: {
      app: fileURLToPath(new URL('./src/app', import.meta.url)),
      theme: fileURLToPath(new URL('./src/theme', import.meta.url)),
      features: fileURLToPath(new URL('./src/features', import.meta.url)),
      common: fileURLToPath(new URL('./src/common', import.meta.url)),
      assets: fileURLToPath(new URL('./src/assets', import.meta.url)),
      generated: fileURLToPath(new URL('./src/generated', import.meta.url)),
      pages: fileURLToPath(new URL('./src/pages', import.meta.url)),
      service: fileURLToPath(new URL('./src/service', import.meta.url)),
      components: fileURLToPath(new URL('./src/components', import.meta.url)),
      global: fileURLToPath(new URL('./src/global', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'https://127.0.0.1',
        changeOrigin: true,
        secure: false,
      },
      '/grpc': {
        target: 'https://127.0.0.1',
        changeOrigin: true,
        secure: false,
        ws: true,
        timeout: 0,
        proxyTimeout: 0,
      },
    },
  },
});
