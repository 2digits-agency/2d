import type { StorybookConfig } from '@storybook/nextjs';

const config = {
  stories: ['../stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-styling'],
  framework: {
    name: '@storybook/nextjs',
    options: {
      nextConfigPath: '../../web/next.config.mjs',
    },
  },
  docs: {
    autodocs: true,
  },
  core: {
    disableTelemetry: true,
  },
} satisfies StorybookConfig;

export default config;
