import { html } from 'lit'
import type { Decorator } from '@storybook/web-components'
import { addons } from 'storybook/preview-api'
import { themes } from './themes'
import type { ThemeMode } from './themes'

// Theme decorator that wraps all stories with ThemeProvider and manages docs theme
export const withThemeProvider: Decorator = (story, context) => {
  const theme = context.globals.theme || 'dark'
  return html`
    <vg-theme-provider mode="${theme}">
      ${story()}
    </vg-theme-provider>
  `
}// Global types configuration for the theme toolbar
export const globalTypes = {
  theme: {
    description: 'Global theme for components',
    defaultValue: 'dark',
    toolbar: {
      title: 'Theme',
      icon: 'paintbrush',
      items: [
        { value: 'dark', title: 'Dark', icon: 'moon' },
        { value: 'light', title: 'Light', icon: 'sun' },
        { value: 'glass', title: 'Glass', icon: 'crystal' },
        { value: 'cartoon', title: 'Cartoon', icon: 'smiley' },
      ],
      dynamicTitle: true,
    },
  },
}