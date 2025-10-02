/**
 * Dropdown Component - Vue 3 Native Rendering
 * 
 * This demonstrates using Vue 3's Single File Component (SFC) syntax
 * in Storybook stories. Uses Composition API with reactive state management.
 * 
 * Note: Uses Vue's runtime + compiler build to support inline templates.
 */

import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
// Import from vue/dist/vue.esm-bundler.js to get runtime + compiler
import { ref, createApp } from 'vue/dist/vue.esm-bundler.js'
import "vg/vue"

const meta: Meta = {
  title: 'Native Framework Rendering/Dropdown/Vue 3',
  tags: ['autodocs', 'test'],
  parameters: {
    docs: {
      description: {
        component: 'Dropdown component rendered using Vue 3 Composition API with reactive refs.',
      },
    },
  },
}

export default meta

type Story = StoryObj

const sampleOptions = [
  { label: 'Option 1', value: 'option1', description: 'First option' },
  { label: 'Option 2', value: 'option2', description: 'Second option' },
  { label: 'Option 3', value: 'option3', description: 'Third option' },
  { label: 'Disabled Option', value: 'disabled', description: 'This option is disabled', disabled: true },
]

const countryOptions = [
  { label: 'United States', value: 'us', description: 'North America' },
  { label: 'United Kingdom', value: 'uk', description: 'Europe' },
  { label: 'Canada', value: 'ca', description: 'North America' },
  { label: 'Australia', value: 'au', description: 'Oceania' },
  { label: 'Germany', value: 'de', description: 'Europe' },
]

/**
 * Basic dropdown with Vue 3 reactive ref
 */
export const Default: Story = {
  render: () => {
    const container = document.createElement('div')
    
    const app = createApp({
      setup() {
        const value = ref('')
        
        const onChange = (event: CustomEvent) => {
          value.value = event.detail.value
        }
        
        return { value, onChange, sampleOptions }
      },
      template: `
        <div>
          <vg-dropdown
            label="Select an Option"
            placeholder="Choose one..."
            :options="sampleOptions"
            :value="value"
            @vg-change="onChange"
            data-testid="default-dropdown"
          />
          <p style="margin-top: 12px;">
            Selected: <strong>{{ value || '(none)' }}</strong>
          </p>
        </div>
      `,
    })
    
    app.mount(container)
    return container
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('Dropdown renders with label', async () => {
      const dropdown = canvas.getByTestId('default-dropdown')
      await expect(dropdown).toBeInTheDocument()
      await expect(dropdown).toHaveAttribute('label', 'Select an Option')
    })
    
    await step('Dropdown shows placeholder', async () => {
      const dropdown = canvas.getByTestId('default-dropdown')
      await expect(dropdown).toHaveAttribute('placeholder', 'Choose one...')
    })
  },
}

/**
 * Dropdown with pre-selected value
 */
export const WithValue: Story = {
  render: () => {
    const container = document.createElement('div')
    
    const app = createApp({
      setup() {
        const value = ref('us')
        
        const onChange = (event: CustomEvent) => {
          value.value = event.detail.value
        }
        
        return { value, onChange, countryOptions }
      },
      template: `
        <div>
          <vg-dropdown
            label="Country"
            placeholder="Select your country"
            :options="countryOptions"
            :value="value"
            helper-text="This affects your shipping options"
            required
            @vg-change="onChange"
            data-testid="country-dropdown"
          />
          <p style="margin-top: 12px;">
            Selected: <strong>{{ value }}</strong>
          </p>
        </div>
      `,
    })
    
    app.mount(container)
    return container
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
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
 * Dropdown with prefix icon - Vue slot syntax
 */
export const WithPrefixIcon: Story = {
  render: () => {
    const container = document.createElement('div')
    
    const app = createApp({
      setup() {
        const value = ref('')
        
        const locationOptions = [
          { label: 'New York', value: 'ny', description: 'Eastern Time Zone' },
          { label: 'Los Angeles', value: 'la', description: 'Pacific Time Zone' },
          { label: 'Chicago', value: 'chi', description: 'Central Time Zone' },
        ]
        
        const onChange = (event: CustomEvent) => {
          value.value = event.detail.value
        }
        
        return { value, onChange, locationOptions }
      },
      template: `
        <div>
          <vg-dropdown
            label="Location"
            placeholder="Select location"
            :options="locationOptions"
            :value="value"
            @vg-change="onChange"
            data-testid="location-dropdown"
          >
            <svg 
              slot="prefix" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              style="margin-left: 12px;"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </vg-dropdown>
          <p style="margin-top: 12px;">
            Selected: <strong>{{ value || '(none)' }}</strong>
          </p>
        </div>
      `,
    })
    
    app.mount(container)
    return container
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
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
    const container = document.createElement('div')
    
    const app = createApp({
      setup() {
        return { sampleOptions }
      },
      template: `
        <div>
          <vg-dropdown
            label="Disabled Dropdown"
            placeholder="Cannot select"
            :options="sampleOptions"
            value="option2"
            helper-text="This field is currently disabled"
            disabled
            data-testid="disabled-dropdown"
          />
        </div>
      `,
    })
    
    app.mount(container)
    return container
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('Dropdown is disabled', async () => {
      const dropdown = canvas.getByTestId('disabled-dropdown')
      await expect(dropdown).toHaveAttribute('disabled')
    })
    
    await step('Disabled dropdown does not open on click', async () => {
      const dropdown = canvas.getByTestId('disabled-dropdown')
      
      await userEvent.click(dropdown)
      
      await expect(dropdown).toHaveAttribute('disabled')
    })
  },
}

/**
 * Dropdown with error state
 */
export const WithError: Story = {
  render: () => {
    const container = document.createElement('div')
    
    const app = createApp({
      setup() {
        const value = ref('')
        
        const onChange = (event: CustomEvent) => {
          value.value = event.detail.value
        }
        
        const error = ref('This field is required')
        
        const updateError = (val: string) => {
          error.value = val ? '' : 'This field is required'
        }
        
        return { value, onChange, error, updateError, sampleOptions }
      },
      template: `
        <div>
          <vg-dropdown
            label="Required Field"
            placeholder="You must select an option"
            :options="sampleOptions"
            :value="value"
            :error="error"
            required
            @vg-change="(e) => { onChange(e); updateError(e.detail.value); }"
            data-testid="error-dropdown"
          />
        </div>
      `,
    })
    
    app.mount(container)
    return container
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('Dropdown shows error when empty', async () => {
      const dropdown = canvas.getByTestId('error-dropdown')
      await expect(dropdown).toHaveAttribute('error', 'This field is required')
    })
  },
}

/**
 * Vue 3 Composition API demo with multiple reactive refs
 */
export const VueCompositionAPIDemo: Story = {
  render: () => {
    const container = document.createElement('div')
    
    const app = createApp({
      setup() {
        const theme = ref('dark')
        const country = ref('us')
        const changeCount = ref(0)
        
        const themeOptions = [
          { label: 'Dark', value: 'dark' },
          { label: 'Light', value: 'light' },
          { label: 'Glass', value: 'glass' },
        ]
        
        const onThemeChange = (event: CustomEvent) => {
          theme.value = event.detail.value
          changeCount.value++
        }
        
        const onCountryChange = (event: CustomEvent) => {
          country.value = event.detail.value
          changeCount.value++
        }
        
        return { 
          theme, 
          country, 
          changeCount,
          themeOptions, 
          countryOptions,
          onThemeChange,
          onCountryChange
        }
      },
      template: `
        <div>
          <h3>Vue 3 Composition API Demo</h3>
          <vg-theme-provider :mode="theme">
            <vg-card heading="Settings" variant="subtle">
              <vg-dropdown
                label="Theme"
                :options="themeOptions"
                :value="theme"
                @vg-change="onThemeChange"
                data-testid="theme-dropdown"
              >
                <svg slot="prefix" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a7 7 0 1 0 10 10"/>
                </svg>
              </vg-dropdown>
              
              <vg-dropdown
                label="Country"
                :options="countryOptions"
                :value="country"
                helper-text="Select your country"
                @vg-change="onCountryChange"
                data-testid="country-dropdown"
              />
            </vg-card>
            
            <vg-card heading="State" variant="outlined">
              <p>Theme: <strong>{{ theme }}</strong></p>
              <p>Country: <strong>{{ country }}</strong></p>
              <p>Total Changes: <strong data-testid="change-count">{{ changeCount }}</strong></p>
            </vg-card>
          </vg-theme-provider>
        </div>
      `,
    })
    
    app.mount(container)
    return container
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('Vue 3 components render with reactive state', async () => {
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
        story: 'Demonstrates Vue 3 Composition API with ref() for reactive state management. Uses @ syntax for event binding and : for prop binding.',
      },
    },
  },
}

/**
 * Vue v-model demonstration (if supported)
 */
export const VueVModelPattern: Story = {
  render: () => {
    const container = document.createElement('div')
    
    const app = createApp({
      setup() {
        const selectedValue = ref('')
        
        return { selectedValue, sampleOptions }
      },
      template: `
        <div>
          <h3>Vue Event Binding Pattern</h3>
          <vg-dropdown
            label="Select Option"
            :options="sampleOptions"
            :value="selectedValue"
            @vg-change="(e) => selectedValue = e.detail.value"
            data-testid="vmodel-dropdown"
          />
          <p style="margin-top: 16px;">
            Selected Value: <strong data-testid="selected-value">{{ selectedValue || '(none)' }}</strong>
          </p>
        </div>
      `,
    })
    
    app.mount(container)
    return container
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('Dropdown with Vue reactive binding renders', async () => {
      const dropdown = canvas.getByTestId('vmodel-dropdown')
      await expect(dropdown).toBeInTheDocument()
      
      const selectedValue = canvas.getByTestId('selected-value')
      await expect(selectedValue).toHaveTextContent('(none)')
    })
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates Vue 3 reactive binding pattern similar to v-model using @vg-change event and :value prop.',
      },
    },
  },
}
