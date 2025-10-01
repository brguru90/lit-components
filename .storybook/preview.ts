import type { Preview, StoryContext } from '@storybook/web-components-vite'
import { setCustomElementsManifest } from '@storybook/web-components'

// Import all components globally
import '../src/index.ts'

// Import custom elements manifest for automatic controls
import customElements from '../dist/custom-elements.json'

// Import theme configuration and decorators
import { withThemeProvider, globalTypes } from './decorators'
import { darkTheme, lightTheme, glassTheme, cartoonTheme, themes } from './themes'

customElements.modules.forEach((mod: any) => {
  mod.declarations.forEach((decl: any) => {
    // decl?.events?.forEach((event: any) => {
    //   if(event["x-originalName"]){
    //     event.name = event["x-originalName"]
    //   }
    // })
    decl.members = []
  })
})

// Set the custom elements manifest
setCustomElementsManifest(customElements)

const preview: Preview = {
  parameters: {
    docs: {
      // Apply theme to docs as well
      // theme: darkTheme,
      extractComponentDescription: (component: string) => {
        // Extract description from Custom Elements Manifest
        const module = customElements.modules.find((mod: any) =>
          mod.declarations.some((decl: any) => decl.tagName === component)
        )

        if (module) {
          const declaration = module.declarations.find(
            (decl: any) => decl.tagName === component
          )

          if (declaration && declaration.description) {
            return `> ####${component}:\n${declaration.description}`
          }
        }

        return undefined
      },
      // source: {
      //   excludeDecorators: true,
      //   type: 'dynamic',
      // },
      source: {
        type: 'dynamic',
        excludeDecorators: true,
        transform: (code: string, storyContext: StoryContext) => {
          if (storyContext.parameters?.docs?.source?.transformOverride && !storyContext.parameters?.docs?.source?.transform_executed) {
            storyContext.parameters.docs.source.transform_executed=true
            return storyContext.parameters.docs.source.transform(code, storyContext)
          }
          // Extract component name
          const componentName = typeof storyContext.component === 'string'
            ? storyContext.component
            : storyContext.componentId?.split('--')[0] ||
            (storyContext.title?.split('/').pop()?.toLowerCase() || 'component');


          console.log(storyContext.id, storyContext)
          
          let attrs = '';

          // Convert args to HTML attributes
          for (let [key, value] of Object.entries(storyContext.args || {})) {

            // if(key.startsWith('on')) continue; // Skip event handlers
            if (typeof value === 'object') {
              try {
                value = JSON.stringify(value);
              } catch (error) {

              }
            }
            if (typeof value === 'function') {
              value = `()=>{/* function */}`
            }
            // Convert camelCase to kebab-case for HTML attributes
            const attrName = key.replace(/([A-Z])/g, '-$1').toLowerCase();

            if (value === true) {
              attrs += `\n  ${attrName}`;
            } else if (value !== false && value !== undefined && value !== null) {
              attrs += `\n  ${attrName}="${value}"`;
            }
          }

          return `<${componentName}${attrs}\n>\n</${componentName}>`;
        },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
      sort: 'alpha',
    },
    backgrounds: {
      disable: false, // Disable default backgrounds since we use theme provider
    },
  },
  // Add global types for theme toolbar
  globalTypes,

  // Add global decorator for theme provider
  decorators: [withThemeProvider],

  tags: ['autodocs'],
}

export default preview;