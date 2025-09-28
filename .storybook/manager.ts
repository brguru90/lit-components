import { addons } from 'storybook/manager-api'
import { darkTheme, lightTheme, glassTheme, cartoonTheme, themes } from './themes'
import type { ThemeMode } from './themes'

// Function to update both manager and docs themes
const updateAllThemes = (selectedTheme: ThemeMode) => {
  const newTheme = themes[selectedTheme]
  
  if (newTheme) {
    console.log('Updating both manager and docs themes to:', selectedTheme)
    
    // Update manager theme
    addons.setConfig({
      theme: newTheme,
    })
    
    // Update docs theme by emitting an event that preview can listen to
    const channel = addons.getChannel()
    channel.emit('UPDATE_DOCS_THEME', { theme: newTheme, themeName: selectedTheme })
  }
}

// Configure Storybook's manager (the UI shell) to use our custom theme
addons.setConfig({
  theme: darkTheme, // Start with dark theme as default
  panelPosition: 'right',
  selectedPanel: 'storybook/controls/panel',
  sidebar: {
    showRoots: true,
    collapsedRoots: [],
  },
})

// Listen for theme changes in the toolbar and update manager theme accordingly
addons.register('vg-theme-sync', (api) => {
  const channel = addons.getChannel()
  
  // Function to handle theme updates
  const updateManagerTheme = (globals: any) => {
    console.log('Theme change detected:', globals?.theme)
    const selectedTheme = globals?.theme as ThemeMode || 'dark'
    
    // Use the new unified theme update function
    updateAllThemes(selectedTheme)
  }
  
  // Listen for various possible events (different Storybook versions use different events)
  channel.on('globalsUpdated', updateManagerTheme)
  channel.on('globals/updated', updateManagerTheme) 
  channel.on('setGlobals', updateManagerTheme)
  channel.on('updateGlobals', updateManagerTheme)
  channel.on('SET_GLOBALS', updateManagerTheme)
  channel.on('UPDATE_GLOBALS', updateManagerTheme)
  
  // Also listen for story changes and check globals then
  channel.on('storyChanged', ({ storyId, viewMode }) => {
    console.log('Story changed, checking globals...')
    // Try to get globals from the API
    try {
      const globals = api?.getGlobals?.()
      if (globals) {
        console.log('Got globals from API:', globals)
        updateManagerTheme(globals)
      }
    } catch (e) {
      console.log('Could not get globals from API:', e)
    }
  })
})