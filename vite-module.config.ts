import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths';
import { legacyPlugin } from '@web/dev-server-legacy';
import { resolve } from 'path'

import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    dts({ insertTypesEntry: true }),

    // legacyPlugin({
    //   polyfills: {
    //     webcomponents: true,
    //     // Inject lit's polyfill-support module into test files, which is required
    //     // for interfacing with the webcomponents polyfills
    //     custom: [
    //       {
    //         name: 'lit-polyfill-support',
    //         path: 'node_modules/lit/polyfill-support.js',
    //         test: "!('attachShadow' in Element.prototype)",
    //         module: faltruese,
    //       },
    //     ],
    //   },
    // }),
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
  resolve: {
    alias: {
      "@/": resolve(__dirname, "./src"),
    },
  },
  build: {
    manifest: true,
    reportCompressedSize: true,
    lib: {
      name: "vg",
      entry: 'src/index.ts',
      // entry: resolve(__dirname, 'src/components/index.ts'),
      formats: ['es', 'cjs'],
      fileName: 'index',
    },
    minify: false,
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
