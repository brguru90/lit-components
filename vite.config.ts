import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths';
import mkcert from 'vite-plugin-mkcert'
import { resolve } from 'path'


export default defineConfig({
  plugins: [
    tsconfigPaths(),
    // mkcert(), // Commented out to avoid sudo requirement
  ],
  server: {
    open: true,
    host: '0.0.0.0', 
    strictPort: true,
    port: 8080,
    // https: true, // Disabled HTTPS for development to avoid sudo
  },
  preview: {
    port: 8080,
  },
  build: {
    manifest: true,
    outDir: 'build',
    lib: {
      entry: resolve(__dirname, 'src/my-element.ts'),
      formats: ['es']
    },
    minify: false,
    rollupOptions: {
    },
    sourcemap: true,
  }
});
