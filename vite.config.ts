import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
      // Include .tsx files for Fast Refresh
      include: "**/*.{jsx,tsx}",
      // Exclude node_modules from Fast Refresh
      exclude: /node_modules/,
    })
  ],
  server: {
    // Enable HMR
    hmr: {
      overlay: true,
    },
    // Force optimization of Three.js and R3F dependencies
    force: true,
  },
  optimizeDeps: {
    // Pre-bundle these dependencies for better HMR performance
    include: [
      'react',
      'react-dom',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'leva'
    ],
  },
})
