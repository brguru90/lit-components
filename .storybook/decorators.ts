import { html } from 'lit'
import type { Decorator } from '@storybook/web-components'
import { addons } from 'storybook/manager-api'
import { themes } from './themes'
import type { ThemeMode } from './themes'


// Theme decorator that wraps all stories with ThemeProvider and manages docs theme
export const withThemeProvider: Decorator = (story, context) => {

  const theme: ThemeMode = context.globals.theme || 'dark'
  const newTheme = themes[theme]
  console.log("theme decorator =>", { theme, newTheme })
  // addons.setConfig({
  //   theme: newTheme,
  // })

  // Update docs theme by emitting an event that preview can listen to
  const channel = addons.getChannel()
  channel.emit('FORCE_RE_RENDER');
  channel.emit('UPDATE_DOCS_THEME', { theme: newTheme, themeName: theme })

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
        { value: 'glass', title: 'Glass', icon: 'crystal' },
        { value: 'cartoon', title: 'Cartoon', icon: 'smiley' },
      ],
      dynamicTitle: true,
    },
  },
}

