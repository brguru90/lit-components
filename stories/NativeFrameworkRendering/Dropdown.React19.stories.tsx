/**
 * Dropdown Component - React 19 JSX Native Rendering
 * 
 * This demonstrates using React 19's JSX with direct custom element support.
 * Uses lowercase element names (vg-dropdown) with JSX type definitions from vg/jsx.
 */

import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import type { DropdownChangeDetail } from 'vg'
import 'vg/jsx'

const meta: Meta = {
  title: 'Native Framework Rendering/Dropdown/React 19 JSX',
  tags: ['autodocs', 'test'],
  parameters: {
    docs: {
      description: {
        component: 'Dropdown component rendered using React 19 JSX with native custom element support.',
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
 * Basic dropdown with React 19 JSX syntax
 */
export const Default: Story = {
  render: () => {
    const container = document.createElement('div')
    
    const App = () => {
      const [value, setValue] = useState('')
      
      return (
        <div>
          <vg-dropdown
            label="Select an Option"
            placeholder="Choose one..."
            options={sampleOptions}
            value={value}
            onvg-change={(event: CustomEvent<DropdownChangeDetail>) => setValue(event.detail.value)}
            data-testid="default-dropdown"
          />
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
    
    await step('Dropdown renders with label', async () => {
      const dropdown = canvas.getByTestId('default-dropdown')
      await expect(dropdown).toBeInTheDocument()
      await expect(dropdown).toHaveAttribute('label', 'Select an Option')
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
          <vg-dropdown
            label="Country"
            placeholder="Select your country"
            options={countryOptions}
            value={value}
            helperText="This affects your shipping options"
            required
            onvg-change={(event: CustomEvent<DropdownChangeDetail>) => setValue(event.detail.value)}
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
      const dropdown = canvas.getByTestId('country-dropdown')
      await expect(dropdown).toHaveAttribute('value', 'us')
    })
  },
}

/**
 * Dropdown with prefix icon - React 19 slot syntax
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
          <vg-dropdown
            label="Location"
            placeholder="Select location"
            options={locationOptions}
            value={value}
            onvg-change={(event: CustomEvent<DropdownChangeDetail>) => setValue(event.detail.value)}
            data-testid="location-dropdown"
          >
            <svg 
              {...{ slot: 'prefix' } as any}
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              style={{ marginLeft: '12px' }}
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </vg-dropdown>
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
    
    const App = () => (
      <div>
        <vg-dropdown
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
      const dropdown = canvas.getByTestId('disabled-dropdown')
      await expect(dropdown).toHaveAttribute('disabled')
    })
  },
}

/**
 * Complete React 19 application demo
 */
export const React19AppDemo: Story = {
  render: () => {
    const container = document.createElement('div')
    
    const App = () => {
      const [theme, setTheme] = useState('dark')
      const [country, setCountry] = useState('us')
      
      const themeOptions = [
        { label: 'Dark', value: 'dark' },
        { label: 'Light', value: 'light' },
        { label: 'Glass', value: 'glass' },
      ]
      
      return (
        <div>
          <h3>React 19 JSX Integration</h3>
          <vg-theme-provider {...{ mode: theme } as any}>
            <vg-card {...{ heading: "Settings", variant: "subtle" } as any}>
              <vg-dropdown
                label="Theme"
                options={themeOptions}
                value={theme}
                onvg-change={(e: CustomEvent<DropdownChangeDetail>) => setTheme(e.detail.value)}
                data-testid="theme-dropdown"
              >
                <svg {...{ slot: 'prefix' } as any} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a7 7 0 1 0 10 10"/>
                </svg>
              </vg-dropdown>
              
              <vg-dropdown
                label="Country"
                options={countryOptions}
                value={country}
                helperText="Select your country"
                onvg-change={(e: CustomEvent<DropdownChangeDetail>) => setCountry(e.detail.value)}
                data-testid="country-dropdown"
              />
            </vg-card>
            
            <vg-card {...{ heading: "Preview", variant: "outlined" } as any}>
              <p>Theme: <strong>{theme}</strong></p>
              <p>Country: <strong>{country}</strong></p>
            </vg-card>
          </vg-theme-provider>
        </div>
      )
    }
    
    const root = createRoot(container)
    root.render(<App />)
    return container
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('React 19 components render correctly', async () => {
      const themeDropdown = canvas.getByTestId('theme-dropdown')
      const countryDropdown = canvas.getByTestId('country-dropdown')
      
      await expect(themeDropdown).toHaveAttribute('value', 'dark')
      await expect(countryDropdown).toHaveAttribute('value', 'us')
    })
  },
  parameters: {
    docs: {
      description: {
        story: 'Full application demo using React 19 JSX syntax with web components. Notice the lowercase element names and `onvg-change` event handlers.',
      },
    },
  },
}
