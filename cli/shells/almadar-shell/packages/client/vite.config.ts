import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = env.VITE_API_URL || 'http://localhost:3030';
  const wsUrl = backendUrl.replace('http://', 'ws://').replace('https://', 'wss://');

  return {
    plugins: [react()],

    resolve: {
      alias: {
        '@design-system': path.resolve(__dirname, '../../../design-system'),
        '@': path.resolve(__dirname, './src'),
        '@generated': path.resolve(__dirname, './src/generated'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@app/shared': path.resolve(__dirname, '../shared/src'),
        '@shared': path.resolve(__dirname, '../shared/src'),
      },
    },

    server: {
      host: true,
      port: 5173,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
        },
        '/ws': {
          target: wsUrl,
          ws: true,
        },
      },
    },

    build: {
      outDir: 'dist',
      sourcemap: true,
    },

    test: {
      environment: 'jsdom',
      globals: true,
    },
  };
});
