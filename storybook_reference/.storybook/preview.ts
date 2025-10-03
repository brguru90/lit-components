import { type Preview } from '@storybook/vue3'
import { setup } from '@storybook/vue3';

import { withThemeByDataAttribute } from '@storybook/addon-themes';
import { registerEsWebComponent } from '@esentire/fabric'

import '@esentire/fabric/scss/main.scss'
import './style.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    options: {
      storySort: {
        order: ['eSentire Design System', 'Docs', 'Fabric', 'Example']
      }
    },
    docs: {
    source: {
      transform: (code, storyContext) => {
        const origSrc=storyContext?.parameters?.docs?.source
.originalSource
         let onlyTemplate =origSrc?.match(/template\:\s+\`([\s|\S]+)\`/)?.[1]
        return onlyTemplate?`<template>${onlyTemplate}</template>`:code
      },
    },
  },
  },
  tags: ['autodocs']
}

setup(app => {
  // register component in storybook as custom element
  app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('esw-')
  // register all esentire web components to use inside storybook
  registerEsWebComponent(true)
  return app;
})

export const decorators = [
  withThemeByDataAttribute({
    themes: {
      light: 'light',
      dark: 'dark',
    },
    defaultTheme: 'dark',
    attributeName: 'data-bs-theme',
  })
];


export default preview
