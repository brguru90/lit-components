import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths';
import mkcert from 'vite-plugin-mkcert'

// https://vitejs.dev/config/

// Library build
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    mkcert(),
  ],
  server: {
    open: true,
    host: '0.0.0.0',
    strictPort: true,
    port: 8080, // required for local as it's used for login to okta
    https: true,
  },
  preview: {
    port: 8080,
  },
  build: {
    lib: {
      entry: 'src/my-element.ts',
      formats: ['es']
    },
    minify: false,
    rollupOptions: {
      external: /^lit/
    },
    sourcemap: true,
  }
});

// Application build
// export default defineConfig({});
