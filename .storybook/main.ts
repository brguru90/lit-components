import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-docs",
    "@chromatic-com/storybook",
    "./addons/lighthouse/register.tsx"
  ],
  framework: {
    name: "@storybook/web-components-vite",
    options: {}
  },
  docs: {},
  typescript: {
    check: false,
  },
};

export default config;