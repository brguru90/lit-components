/**
 * Dropdown Component - Angular Native Rendering
 * 
 * This demonstrates REAL Angular components with proper Angular syntax:
 * - Property binding: [property]="value"
 * - Event binding: (event)="handler($event)"
 * - String interpolation: {{ expression }}
 * 
 * Each story uses bootstrapApplication to render Angular components
 * with full Angular functionality.
 */

import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import 'zone.js' // Required for Angular's change detection
import '@angular/compiler' // Required for JIT compilation
import '@angular/platform-browser-dynamic' // Required for dynamic compilation
import { bootstrapApplication } from '@angular/platform-browser'
import { DefaultDropdownComponent } from './angular-components/default-dropdown.component'
import { WithValueComponent } from './angular-components/with-value.component'
import { WithIconComponent } from './angular-components/with-icon.component'
import { DisabledComponent } from './angular-components/disabled.component'
import { ComponentDemoComponent } from './angular-components/component-demo.component'
import { AttributeBindingComponent } from './angular-components/attribute-binding.component'
import "vg"

const meta: Meta = {
  title: 'Native Framework Rendering/Dropdown/Angular',
  tags: ['autodocs', 'test'],
  parameters: {
    docs: {
      description: {
        component: `Dropdown component with real Angular components and syntax.
        
These stories use actual Angular standalone components with:
- Property binding: \`[options]="data"\`
- Event binding: \`(vg-change)="handler($event)"\`
- String interpolation: \`{{ value }}\`

Each story bootstraps an Angular application using \`bootstrapApplication\`.
For a complete Angular project example, see \`demo/anguler-demo\`.`,
      },
    },
  },
}

export default meta

type Story = StoryObj



/**
 * Basic dropdown - Real Angular component with property and event bindings
 * 
 * Uses Angular @Component decorator with proper Angular template syntax:
 * - [options]="sampleOptions" for property binding
 * - (vg-change)="onChange($event)" for event binding  
 * - {{ value || '(none)' }} for string interpolation
 */
export const Default: Story = {
  render: () => {
    const container = document.createElement('app-default-dropdown')
    
    // Bootstrap Angular application
    // NOTE: bootstrapApplication can only be called once per page
    // Angular manages the entire component lifecycle
    setTimeout(() => {
      bootstrapApplication(DefaultDropdownComponent, {
        providers: []
      }).catch(err => console.error('Angular bootstrap error:', err))
    }, 0)
    
    return container
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('Wait for Angular to bootstrap', async () => {
      await waitFor(() => {
        const dropdown = canvas.queryByTestId('default-dropdown')
        expect(dropdown).toBeTruthy()
      }, { timeout: 5000 })
    })
    
    await step('Dropdown renders with label', async () => {
      const dropdown = canvas.getByTestId('default-dropdown')
      await expect(dropdown).toBeInTheDocument()
      await expect(dropdown).toHaveAttribute('label', 'Select an Option')
    })
  },
}

/**
 * Dropdown with pre-selected value using Angular property binding
 */
export const WithValue: Story = {
  render: () => {
    const container = document.createElement('app-with-value')
    setTimeout(() => {
      bootstrapApplication(WithValueComponent, {
        providers: []
      }).catch(err => console.error('Angular bootstrap error:', err))
    }, 0)
    return container
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('Wait for Angular to bootstrap', async () => {
      await waitFor(() => {
        const dropdown = canvas.queryByTestId('country-dropdown')
        expect(dropdown).toBeTruthy()
      }, { timeout: 3000 })
    })
    
    await step('Dropdown has initial value', async () => {
      const dropdown = canvas.getByTestId('country-dropdown')
      await expect(dropdown).toHaveAttribute('value', 'us')
    })
    
    await step('Dropdown is required', async () => {
      const dropdown = canvas.getByTestId('country-dropdown')
      await expect(dropdown).toHaveAttribute('required')
    })
  },
}

/**
 * Dropdown with prefix icon - Angular slot projection
 */
export const WithIcon: Story = {
  render: () => {
    const container = document.createElement('app-with-icon')
    setTimeout(() => {
      bootstrapApplication(WithIconComponent, {
        providers: []
      }).catch(err => console.error('Angular bootstrap error:', err))
    }, 0)
    return container
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('Wait for Angular to bootstrap', async () => {
      await waitFor(() => {
        const dropdown = canvas.queryByTestId('location-dropdown')
        expect(dropdown).toBeTruthy()
      }, { timeout: 3000 })
    })
    
    await step('Dropdown with icon renders', async () => {
      const dropdown = canvas.getByTestId('location-dropdown')
      await expect(dropdown).toBeInTheDocument()
      
      const svg = dropdown.querySelector('svg[slot="prefix"]')
      await expect(svg).toBeTruthy()
    })
  },
}

/**
 * Disabled dropdown
 */
export const Disabled: Story = {
  render: () => {
    const container = document.createElement('app-disabled')
    setTimeout(() => {
      bootstrapApplication(DisabledComponent, {
        providers: []
      }).catch(err => console.error('Angular bootstrap error:', err))
    }, 0)
    return container
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('Wait for Angular to bootstrap', async () => {
      await waitFor(() => {
        const dropdown = canvas.queryByTestId('disabled-dropdown')
        expect(dropdown).toBeTruthy()
      }, { timeout: 3000 })
    })
    
    await step('Dropdown is disabled', async () => {
      const dropdown = canvas.getByTestId('disabled-dropdown')
      await expect(dropdown).toHaveAttribute('disabled')
    })
  },
}

/**
 * Complete Angular component demo with multiple bindings
 */
export const ComponentDemo: Story = {
  render: () => {
    const container = document.createElement('app-component-demo')
    setTimeout(() => {
      bootstrapApplication(ComponentDemoComponent, {
        providers: []
      }).catch(err => console.error('Angular bootstrap error:', err))
    }, 0)
    return container
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('Wait for Angular to bootstrap', async () => {
      await waitFor(() => {
        const themeDropdown = canvas.queryByTestId('theme-dropdown')
        expect(themeDropdown).toBeTruthy()
      }, { timeout: 3000 })
    })
    
    await step('Angular components render correctly', async () => {
      const themeDropdown = canvas.getByTestId('theme-dropdown')
      const countryDropdown = canvas.getByTestId('country-dropdown')
      
      await expect(themeDropdown).toHaveAttribute('value', 'dark')
      await expect(countryDropdown).toHaveAttribute('value', 'us')
    })
    
    await step('Change counter initializes to 0', async () => {
      const changeCount = canvas.getByTestId('change-count')
      await expect(changeCount).toHaveTextContent('0')
    })
  },
  parameters: {
    docs: {
      description: {
        story: 'Full Angular component demo using property bindings [property], event bindings (event), and string interpolation {{ }}.',
      },
    },
  },
}

/**
 * Angular attribute binding demo with [attr.] syntax
 */
export const AngularAttributeBinding: Story = {
  render: () => {
    const container = document.createElement('app-attribute-binding')
    setTimeout(() => {
      bootstrapApplication(AttributeBindingComponent, {
        providers: []
      }).catch(err => console.error('Angular bootstrap error:', err))
    }, 0)
    return container
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('Wait for Angular to bootstrap', async () => {
      await waitFor(() => {
        const dropdown = canvas.queryByTestId('attribute-dropdown')
        expect(dropdown).toBeTruthy()
      }, { timeout: 3000 })
    })
    
    await step('Dropdown with dynamic attributes renders', async () => {
      const dropdown = canvas.getByTestId('attribute-dropdown')
      await expect(dropdown).toHaveAttribute('required')
      await expect(dropdown).toHaveAttribute('error', 'This field is required')
    })
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates Angular attribute binding with [attr.] syntax for dynamic attribute values.',
      },
    },
  },
}
