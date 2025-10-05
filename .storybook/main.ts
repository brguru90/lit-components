import type { StorybookConfig } from '@storybook/web-components-vite';
import istanbul from 'vite-plugin-istanbul';

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-coverage",
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
  
  // Set environment variable to indicate development mode
  env: (config) => ({
    ...config,
    STORYBOOK_LIGHTHOUSE_ENABLED: process.env.NODE_ENV !== 'production' ? 'true' : 'false',
  }),
  
  // Auto-start Lighthouse API server when Storybook starts
  async viteFinal(config, { configType }) {
    if (configType === 'DEVELOPMENT') {
      // Import and start the Lighthouse server
      const { startLighthouseServer } = await import('./addons/lighthouse/server.mjs');
      await startLighthouseServer();
    }
    
    // Add istanbul plugin for code coverage instrumentation
    const mod = await import('vite-plugin-istanbul');
    const istanbul = (mod && (mod as any).default) || mod;
    
    config.plugins = [
      ...(config.plugins || []),
      istanbul({
        include: ['src/**/*'],
        exclude: ['node_modules', 'stories', 'test'],
        extension: ['.js', '.jsx', '.ts', '.tsx'],
        requireEnv: false,  // Don't require NYC_INSTRUMENT env variable
        cypress: false,
      }),
    ];
    
    return config;
  },
};

export default config;