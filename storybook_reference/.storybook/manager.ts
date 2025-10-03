import { addons } from '@storybook/manager-api';
import { create } from '@storybook/theming/create';

const theme = create({
  base: 'dark',
  brandTitle: 'eSentire Design Systems',
  brandUrl: 'https://www.esentire.com',
  brandImage: 'esentire-logo.svg',
})

addons.setConfig({
  theme,
  sidebar: {
    filters: {
      patterns: (item) => {
        // stories with DocOnly will not show in sidebar
        return !item.tags?.includes('DocOnly');
      }
    }
  }
});

