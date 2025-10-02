import { addons } from 'storybook/manager-api'
import { themes } from './themes'
import type { ThemeMode } from './themes'

// Function to update both manager and docs themes
const updateAllThemes = (selectedTheme: ThemeMode) => {
  const newTheme = themes[selectedTheme]

  if (newTheme) {
    console.log('Updating both manager and docs themes to:', { selectedTheme, newTheme })
    // Update manager theme
    addons.setConfig({
      theme: newTheme,
    })
  }
}

// Configure Storybook's manager (the UI shell) to use our custom theme
// addons.setConfig({
//   theme: darkTheme, // Start with dark theme as default
//   panelPosition: 'right',
//   selectedPanel: 'storybook/controls/panel',
//   sidebar: {
//     showRoots: true,
//     collapsedRoots: [],
//   },
// })

// Listen for theme changes in the toolbar and update manager theme accordingly
addons.register('vg-theme-sync', (api) => {
  const channel = addons.getChannel()
  channel.on('THEME_CHANGED', (props) => updateAllThemes(props.theme))
})