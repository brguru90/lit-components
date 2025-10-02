import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { VgButton } from '../src'
import { getArgTypesFromManifest } from '../.storybook/controls'

type Story = StoryObj<VgButton>

const meta: Meta = {
  title: 'Examples/Framework Switcher Demo',
  tags: ['autodocs'],
  component: 'vg-button',
  
  ...getArgTypesFromManifest('vg-button'),
  
  parameters: {
    docs: {
      description: {
        component: `
# Framework Switcher Demo

This story demonstrates the **Framework Switcher** feature!

## How to Use

1. **Look at the toolbar** at the top of this page
2. Find the **"Framework"** dropdown (with a code icon 🔧)
3. **Select different frameworks**: HTML, React, Vue, Angular, or Lit
4. **Watch the code examples below** automatically transform!

## Try It Now

Select a framework from the toolbar, then look at the code examples in each story below. 
The code will show the syntax for your selected framework.

### Supported Frameworks

- **HTML** - Vanilla JavaScript with Web Components
- **React** - JSX with React wrapper components
- **Vue** - Vue 3 Single File Components
- **Angular** - Angular standalone components  
- **Lit** - LitElement with decorators

### Why This Matters

Web Components work everywhere! This feature demonstrates that you can:
- ✅ Write components once
- ✅ Use them in any framework
- ✅ Get framework-specific examples automatically

---

**Now scroll down and try switching frameworks!**
        `
      }
    }
  },
}

export default meta

/**
 * A simple button with basic props.
 * Switch frameworks in the toolbar to see the code change!
 */
export const SimpleButton: Story = {
  args: {
    variant: 'primary',
    size: 'md',
  },
  render: (args) => html`
    <vg-button 
      variant=${args.variant}
      size=${args.size}
    >
      Click Me
    </vg-button>
  `,
}

/**
 * Button with an event handler.
 * Notice how event handling changes per framework!
 */
export const WithEventHandler: Story = {
  args: {
    variant: 'secondary',
    size: 'md',
  },
  render: (args) => {
    const handleClick = () => console.log('Button clicked!')
    
    return html`
      <vg-button 
        variant=${args.variant}
        size=${args.size}
        @vg-click=${handleClick}
      >
        Click & Check Console
      </vg-button>
    `
  },
}

/**
 * Disabled button example.
 * Boolean props are handled differently per framework.
 */
export const DisabledButton: Story = {
  args: {
    variant: 'primary',
    disabled: true,
  },
  render: (args) => html`
    <vg-button 
      variant=${args.variant}
      ?disabled=${args.disabled}
    >
      Disabled Button
    </vg-button>
  `,
}

/**
 * Button with loading state.
 * Multiple boolean props showcase framework differences.
 */
export const LoadingButton: Story = {
  args: {
    variant: 'primary',
    loading: true,
    disabled: false,
  },
  render: (args) => html`
    <vg-button 
      variant=${args.variant}
      ?loading=${args.loading}
      ?disabled=${args.disabled}
    >
      Loading...
    </vg-button>
  `,
}

/**
 * Button with icon in prefix slot.
 * Slots/children work across all frameworks!
 */
export const WithIcon: Story = {
  args: {
    variant: 'primary',
    size: 'md',
  },
  render: (args) => html`
    <vg-button 
      variant=${args.variant}
      size=${args.size}
    >
      <svg slot="prefix" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
      Star Button
    </vg-button>
  `,
}

/**
 * Complete example with all features.
 * Combines props, events, slots, and states.
 */
export const CompleteExample: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    disabled: false,
    loading: false,
  },
  render: (args) => {
    const handleClick = () => console.log('Complete example clicked!')
    
    return html`
      <vg-button 
        variant=${args.variant}
        size=${args.size}
        ?disabled=${args.disabled}
        ?loading=${args.loading}
        @vg-click=${handleClick}
      >
        <svg slot="prefix" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        Complete Example
      </vg-button>
    `
  },
  parameters: {
    docs: {
      description: {
        story: `
This example combines:
- Props (variant, size)
- Boolean attributes (disabled, loading)
- Event handlers (onVgClick)
- Slots (prefix icon)

**Try switching frameworks** in the toolbar to see how each framework handles these features!
        `
      }
    }
  }
}
