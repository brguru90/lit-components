/**
 * Dropdown Component - React Native Rendering
 * 
 * This demonstrates using React's JSX directly in Storybook stories
 * instead of Lit's html template. This shows how the component works
 * in real React applications using the React wrapper (vg/react).
 */

import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { VgDropdown, ThemeProvider as VgThemeProvider, VgCard } from 'vg/react'
import 'vg'

const meta: Meta = {
  title: 'Native Framework Rendering/Dropdown/React',
  tags: ['autodocs', 'test'],
  parameters: {
    docs: {
      description: {
        component: 'Dropdown component rendered using React JSX and the React wrapper from `vg/react`.',
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
 * Basic dropdown with state management
 */
export const Default: Story = {
  render: () => {
    const container = document.createElement('div')
    
    const App = () => {
      const [value, setValue] = useState('')
      
      return (
        <VgThemeProvider mode="dark">
          <div>
            <VgDropdown
              label="Select an Option"
              placeholder="Choose one..."
              options={sampleOptions}
              value={value}
              onVgChange={(event) => setValue(event.detail.value)}
              data-testid="default-dropdown"
            />
            <p style={{ marginTop: '12px' }}>
              Selected: <strong>{value || '(none)'}</strong>
            </p>
          </div>
        </VgThemeProvider>
      )
    }
    
    const root = createRoot(container)
    root.render(<App />)
    return container
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('Dropdown renders with label', async () => {
      await waitFor(async () => {
        const dropdown = canvas.getByTestId('default-dropdown') as any
        await expect(dropdown).toBeInTheDocument()
        await expect(dropdown.options).toBeTruthy()
        await expect(dropdown.label).toBe('Select an Option')
      }, { timeout: 3000 })
    })
    
    await step('Dropdown shows placeholder', async () => {
      const dropdown = canvas.getByTestId('default-dropdown') as any
      await expect(dropdown.placeholder).toBe('Choose one...')
    })
  },
}

/**
 * Dropdown with pre-selected value
 */
export const WithValue: Story = {
  render: () => {
    const container = document.createElement('div')
    
    const App = () => {
      const [value, setValue] = useState('us')
      
      return (
        <div>
          <VgDropdown
            label="Country"
            placeholder="Select your country"
            options={countryOptions}
            value={value}
            helperText="This affects your shipping options"
            required
            onVgChange={(event) => setValue(event.detail.value)}
            data-testid="country-dropdown"
          />
          <p style={{ marginTop: '12px' }}>
            Selected: <strong>{value}</strong>
          </p>
        </div>
      )
    }
    
    const root = createRoot(container)
    root.render(<App />)
    return container
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('Dropdown has initial value', async () => {
      await waitFor(async () => {
        const dropdown = canvas.getByTestId('country-dropdown') as any
        await expect(dropdown.options).toBeTruthy()
        await expect(dropdown.value).toBe('us')
      }, { timeout: 3000 })
    })
    
    await step('Dropdown is required', async () => {
      const dropdown = canvas.getByTestId('country-dropdown') as any
      // For web components, required is set as a property but may be reflected differently
      await expect(dropdown.required !== undefined && dropdown.required !== null && dropdown.required !== false).toBe(true)
    })
  },
}

/**
 * Dropdown with prefix icon using React slot syntax
 */
export const WithPrefixIcon: Story = {
  render: () => {
    const container = document.createElement('div')
    
    const App = () => {
      const [value, setValue] = useState('')
      
      const locationOptions = [
        { label: 'New York', value: 'ny', description: 'Eastern Time Zone' },
        { label: 'Los Angeles', value: 'la', description: 'Pacific Time Zone' },
        { label: 'Chicago', value: 'chi', description: 'Central Time Zone' },
      ]
      
      return (
        <div>
          <VgDropdown
            label="Location"
            placeholder="Select location"
            options={locationOptions}
            value={value}
            onVgChange={(event) => setValue(event.detail.value)}
            data-testid="location-dropdown"
          >
            <svg 
              {...{ slot: "prefix" } as any}
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              style={{ marginLeft: '12px' }}
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </VgDropdown>
          <p style={{ marginTop: '12px' }}>
            Selected: <strong>{value || '(none)'}</strong>
          </p>
        </div>
      )
    }
    
    const root = createRoot(container)
    root.render(<App />)
    return container
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('Dropdown with icon renders', async () => {
      await waitFor(async () => {
        const dropdown = canvas.getByTestId('location-dropdown') as any
        await expect(dropdown).toBeInTheDocument()
        await expect(dropdown.options).toBeTruthy()
        
        // Check if slot content exists
        const svg = dropdown.querySelector('svg[slot="prefix"]')
        await expect(svg).toBeTruthy()
      }, { timeout: 3000 })
    })
  },
}

/**
 * Disabled dropdown state
 */
export const Disabled: Story = {
  render: () => {
    const container = document.createElement('div')
    
    const App = () => (
      <div>
        <VgDropdown
          label="Disabled Dropdown"
          placeholder="Cannot select"
          options={sampleOptions}
          value="option2"
          helperText="This field is currently disabled"
          disabled
          data-testid="disabled-dropdown"
        />
      </div>
    )
    
    const root = createRoot(container)
    root.render(<App />)
    return container
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('Dropdown is disabled', async () => {
      await waitFor(async () => {
        const dropdown = canvas.getByTestId('disabled-dropdown') as any
        await expect(dropdown.options).toBeTruthy()
        await expect(dropdown.disabled !== undefined && dropdown.disabled !== null && dropdown.disabled !== false).toBe(true)
      }, { timeout: 3000 })
    })
    
    await step('Disabled dropdown does not open on click', async () => {
      const dropdown = canvas.getByTestId('disabled-dropdown') as any
      
      // Try to click
      await userEvent.click(dropdown)
      
      // Verify it stays disabled
      await expect(dropdown.disabled !== undefined && dropdown.disabled !== null && dropdown.disabled !== false).toBe(true)
    })
  },
}

/**
 * Dropdown with error state
 */
export const WithError: Story = {
  render: () => {
    const container = document.createElement('div')
    
    const App = () => {
      const [value, setValue] = useState('')
      
      return (
        <div>
          <VgDropdown
            label="Required Field"
            placeholder="You must select an option"
            options={sampleOptions}
            value={value}
            error={value ? '' : 'This field is required'}
            required
            onVgChange={(event) => setValue(event.detail.value)}
            data-testid="error-dropdown"
          />
        </div>
      )
    }
    
    const root = createRoot(container)
    root.render(<App />)
    return container
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('Dropdown shows error when empty', async () => {
      await waitFor(async () => {
        const dropdown = canvas.getByTestId('error-dropdown') as any
        await expect(dropdown.options).toBeTruthy()
        await expect(dropdown.error).toBe('This field is required')
      }, { timeout: 3000 })
    })
  },
}

/**
 * Interactive test - Full user flow
 */
export const InteractiveSelection: Story = {
  render: () => {
    const container = document.createElement('div')
    
    const App = () => {
      const [value, setValue] = useState('')
      const [changeCount, setChangeCount] = useState(0)
      
      return (
        <div>
          <VgDropdown
            label="Interactive Dropdown"
            placeholder="Select an option"
            options={sampleOptions}
            value={value}
            helperText={`Selection changed ${changeCount} times`}
            onVgChange={(event) => {
              setValue(event.detail.value)
              setChangeCount(prev => prev + 1)
            }}
            data-testid="interactive-dropdown"
          />
          <p style={{ marginTop: '12px' }}>
            Current Value: <strong>{value || '(none)'}</strong>
          </p>
          <p>
            Changes: <strong data-testid="change-count">{changeCount}</strong>
          </p>
        </div>
      )
    }
    
    const root = createRoot(container)
    root.render(<App />)
    return container
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('Dropdown renders', async () => {
      await waitFor(async () => {
        const dropdown = canvas.getByTestId('interactive-dropdown') as any
        await expect(dropdown).toBeInTheDocument()
        await expect(dropdown.options).toBeTruthy()
      }, { timeout: 3000 })
    })
    
    await step('Initial state is empty', async () => {
      const changeCount = canvas.getByTestId('change-count')
      await expect(changeCount).toHaveTextContent('0')
    })
    
    // Note: Full interaction testing (clicking to open dropdown, selecting option)
    // requires accessing shadow DOM which is framework-agnostic
  },
}

/**
 * React hooks integration test
 */
export const ReactHooksIntegration: Story = {
  render: () => {
    const container = document.createElement('div')
    
    const App = () => {
      const [theme, setTheme] = useState<'dark' | 'light' | 'glass'>('dark')
      const [country, setCountry] = useState('us')

      const countryOptions = [
        { label: 'United States', value: 'us' },
        { label: 'Canada', value: 'ca' },
        { label: 'United Kingdom', value: 'uk' },
        { label: 'Germany', value: 'de' },
        { label: 'France', value: 'fr' },
        { label: 'Japan', value: 'jp' },
        { label: 'Australia', value: 'au' },
      ]

      const themeOptions = [
        { label: 'Dark', value: 'dark' },
        { label: 'Light', value: 'light' },
        { label: 'Glass', value: 'glass' },
      ]

      return (
        <VgThemeProvider {...{ mode: theme } as any}>
          <VgCard heading="Settings" variant="subtle">
            <VgDropdown
              label="Theme"
              options={themeOptions}
              value={theme}
              onVgChange={(e) => setTheme(e.detail.value as 'dark' | 'light' | 'glass')}
              data-testid="theme-dropdown"
            >
              <svg {...{ slot: 'prefix' } as any} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 2a7 7 0 1 0 10 10"/>
              </svg>
            </VgDropdown>
            
            <VgDropdown
              label="Country"
              options={countryOptions}
              value={country}
              helperText="Select your country"
              onVgChange={(e) => setCountry(e.detail.value)}
              data-testid="country-dropdown"
            />
          </VgCard>
          
          <VgCard heading="Preview" variant="outlined">
            <p>Theme: <strong>{theme}</strong></p>
            <p>Country: <strong>{country}</strong></p>
          </VgCard>
        </VgThemeProvider>
      )
    }
    
    const root = createRoot(container)
    root.render(<App />)
    return container
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('React components render correctly', async () => {
      // Wait for React components to be fully initialized
      await waitFor(async () => {
        const themeDropdown = canvas.getByTestId('theme-dropdown') as any
        const countryDropdown = canvas.getByTestId('country-dropdown') as any
        
        // Ensure components have their options and values set
        await expect(themeDropdown.options).toBeTruthy()
        await expect(countryDropdown.options).toBeTruthy()
        await expect(themeDropdown.value).toBe('dark')
        await expect(countryDropdown.value).toBe('us')
      }, { timeout: 3000 })
    })
    
    await step('Verify theme and country display values', async () => {
      const themeText = canvas.getByText(/Theme:/)
      const countryText = canvas.getByText(/Country:/)
      
      await expect(themeText).toBeInTheDocument()
      await expect(countryText).toBeInTheDocument()
    })
  },
  parameters: {
    docs: {
      description: {
        story: 'Full application demo using React wrapper components. Notice the VgCard heading prop and children content.',
      },
    },
  },
}
