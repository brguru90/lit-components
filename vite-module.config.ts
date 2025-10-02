import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths';
import { legacyPlugin } from '@web/dev-server-legacy';
import { resolve } from 'path'
import VitePluginCustomElementsManifest from 'vite-plugin-cem';
import dts from 'vite-plugin-dts';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    dts({ insertTypesEntry: true }),
    vue({
      template: {
        compilerOptions: {
          // Treat all tags starting with 'vg-' as custom elements
          isCustomElement: (tag) => tag.startsWith('vg-')
        }
      }
    }),
    // vueJsx(),
    // VitePluginCustomElementsManifest({
    //   config: "custom-elements-manifest.config.mjs",
    // }),
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
    exclude: ['dist'],
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
      formats: ['es'],
      fileName: 'index',
    },
    minify: false,
    sourcemap: true,
    outDir: 'dist',
    cssCodeSplit: false,
    rollupOptions: {
      context: 'window',
      external: (id) => {
        return id.startsWith('demo') || id.startsWith('dist') || id.startsWith('types');
      },
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'index.css'
          }

          return 'assets/[name]-[hash][extname]'
        }
      }
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
