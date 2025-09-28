import type { Preview } from '@storybook/web-components-vite'
import { setCustomElementsManifest } from '@storybook/web-components'

// Import all components globally
import '../src/index.ts'

// Import custom elements manifest for automatic controls
import customElements from '../dist/custom-elements.json'

customElements.modules.forEach((mod) => {
  mod.declarations.forEach((decl) => {
    decl?.events?.forEach((event) => {
      if(event["x-originalName"]){
        event.name = event["x-originalName"]
      }
    })
    decl.members=[]
  })
})

// Set the custom elements manifest
setCustomElementsManifest(customElements)

const preview: Preview = {
  parameters: {
    docs: {
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
      source: {
        excludeDecorators: true,
        type: 'dynamic',
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
  },
  tags: ['autodocs'],
}

export default preview;