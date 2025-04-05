// vite.config.js
export default {
    server: {
        host: true, // Allow access from your local network
        port: 5173, // Make sure it matches your firewall rule
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules/three')) {
                      return 'three'; // Moves three.js to its own chunk
                    }
                    if (id.includes('node_modules')) {
                      return 'vendor'; // Moves other dependencies to a "vendor" chunk
                    }
                },
            },
        },
        chunkSizeWarningLimit: 1000,
    },
    assetsInclude: ['**/*.mp4', '**/*.glb', '**/*.gltf'],
    publicDir: 'public',
};