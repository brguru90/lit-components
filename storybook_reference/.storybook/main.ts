import type { StorybookConfig } from '@storybook/vue3-vite'
import remarkGfm from 'remark-gfm'
import type { AddonOptionsVite } from '@storybook/addon-coverage'

const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    // essential addons
    '@storybook/addon-links',
    '@storybook/addon-viewport',
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm]
          }
        }
      }
    },
    '@storybook/addon-controls',
    '@storybook/addon-actions',
    '@storybook/addon-toolbars',
    '@storybook/addon-measure',
    '@storybook/addon-outline',
    // extra addons
    '@storybook/addon-interactions',
    '@storybook/addon-themes',
    '@storybook/addon-a11y',
    '@storybook/addon-designs',
    '@storybook/manager-api',
    {
      name: '@storybook/addon-coverage',
      options: {} as AddonOptionsVite
    }
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {
      docgen: {
        plugin: 'vue-component-meta',
        tsconfig: 'tsconfig.app.json'
      }
    }
  },
  core: {
    disableTelemetry: true // 👈 Disables telemetry
  },
  staticDirs: ['../public']
}
export default config
