import type { Preview } from '@storybook/web-components-vite'
import { setCustomElementsManifest } from '@storybook/web-components'

// Import all components globally
import '../src/index.ts'

// Import custom elements manifest for automatic controls
import customElements from '../dist/custom-elements.json'

// Set the custom elements manifest
setCustomElementsManifest(customElements)

const preview: Preview = {
  parameters: {
    docs: {
      extractComponentDescription: (component: any, { notes }: { notes?: any }) => {
        if (notes) {
          return typeof notes === 'string' ? notes : notes.markdown || notes.text
        }
        return null
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
    },
  },
  tags: ['autodocs'],
}

export default preview;