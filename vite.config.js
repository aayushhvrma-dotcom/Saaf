import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            // In dev, proxy /api/* to the Vercel dev server or a local equivalent
            // Run `vercel dev` alongside `vite dev` OR configure a local express proxy
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
            },
        },
    },
});
