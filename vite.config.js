// vite.config.js
export default {
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    three: ['three'], // Split out three.js into a separate chunk
                },
            },
        },
    },
    assetsInclude: ['**/*.mp4', '**/*.glb', '**/*.gltf'],
};