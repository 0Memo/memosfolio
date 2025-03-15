// vite.config.js
export default {
    build: {
        rollupOptions: {
            output: {
            manualChunks: {
                three: ['three'], // Split out three.js into a separate chunk
                video: ['/textures/video/video.mp4'], // (Optional) Split large media files
            },
            },
        },
    },
};