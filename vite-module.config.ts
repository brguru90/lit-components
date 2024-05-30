import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path'
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    dts({ insertTypesEntry: true }),
  ],
  define: {
    global: 'window'
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'window'
      }
    }
  },
  build: {
    manifest: true,
    reportCompressedSize: true,
    lib: {
      name: "vg",
      entry: 'src/components/index.ts',
      // entry: resolve(__dirname, 'src/components/index.ts'),
      formats: ['es', 'cjs'],
      fileName: 'index',
    },
    minify: true,
    sourcemap: true,
    outDir: 'dist',
    rollupOptions: {
      context: 'window'
      //   // make sure to externalize deps that shouldn't be bundled
      //   // into your library
      //   external: ['lit'],
      // output: {
      //   // Provide global variables to use in the UMD build
      //   // for externalized deps
      //   globals: {
      //     lit: 'lit',
      //   },
      // },
    },
  }
});

// Application build
// export default defineConfig({});
