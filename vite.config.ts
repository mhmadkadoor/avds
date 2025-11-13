import {defineConfig} from 'vite';

export default defineConfig({
    base: "/avds/",
    server: {
        proxy: {
            // Proxy local Ollama during dev to avoid CORS
            '/ollama': {
                target: 'http://localhost:11434',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/ollama/, ''),
            },
            // Also proxy /api directly to handle code or examples calling /api/chat
            '/api': {
                target: 'http://localhost:11434',
                changeOrigin: true,
            }
        },
    },
});