import { html } from 'lit'
import type { Decorator } from '@storybook/web-components'
import { addons } from 'storybook/preview-api';
import { themes } from './themes'
import type { ThemeMode } from './themes'
// import { FORCE_RE_RENDER,SET_CONFIG,SET_GLOBALS } from 'storybook/internal/core-events';


// Theme decorator that wraps all stories with ThemeProvider and manages docs theme
export const withThemeProvider: Decorator = (story, context) => {

  const theme: ThemeMode = context.globals.theme || 'dark'
  const newTheme = themes[theme]

  const channel = addons.getChannel()
  channel.emit('THEME_CHANGED', { theme: theme })
  // channel.emit('FORCE_RE_RENDER');

  if (typeof document !== 'undefined') {
    document.documentElement.style.backgroundColor = newTheme.appPreviewBg
  }

  return html`
    <vg-theme-provider mode="${theme}">
      ${story()}
    </vg-theme-provider>
  `
}

// Global types configuration for the theme toolbar
export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Global theme for components',
    defaultValue: 'dark',
    toolbar: {
      title: 'Theme',
      icon: 'paintbrush',
      items: [
        { value: 'dark', title: 'Dark', icon: 'moon' },
        { value: 'light', title: 'Light', icon: 'sun' },
        { value: 'glass', title: 'Glass', icon: 'beaker' },
        { value: 'cartoon', title: 'Cartoon', icon: 'star' },
      ],
      dynamicTitle: true,
    },
  },
  framework: {
    name: 'Framework',
    description: 'View code examples in different frameworks',
    defaultValue: 'html',
    toolbar: {
      title: 'Framework',
      icon: 'code',
      items: [
        { value: 'html', title: 'HTML', icon: 'markup' },
        { value: 'react', title: 'React', icon: 'graphql' },
        { value: 'vue', title: 'Vue', icon: 'component' },
        { value: 'angular', title: 'Angular', icon: 'admin' },
        { value: 'lit', title: 'Lit', icon: 'lightning' },
      ],
      dynamicTitle: true,
    },
  },
}

