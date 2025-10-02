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
  
  // Auto-start Lighthouse API server when Storybook starts
  async viteFinal(config, { configType }) {
    if (configType === 'DEVELOPMENT') {
      // Import and start the Lighthouse server
      const { startLighthouseServer } = await import('./addons/lighthouse/server.mjs');
      await startLighthouseServer();
    }
    return config;
  },
};

export default config;