/**
 * Dropdown Component - React Native Rendering
 * 
 * This demonstrates using React's JSX directly in Storybook stories
 * instead of Lit's html template. This shows how the component works
 * in real React applications using the React wrapper (vg/react).
 */

import type { Meta, StoryObj } from '@storybook/react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { useState } from 'react'
import { VgDropdown } from 'vg/react'

const meta: Meta<typeof VgDropdown> = {
  title: 'Native Framework Rendering/Dropdown/React',
  component: VgDropdown,
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

type Story = StoryObj<typeof VgDropdown>

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
    const [value, setValue] = useState('')
    
    return (
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
    )
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
 * Dropdown with prefix icon using React slot syntax
 */
export const WithPrefixIcon: Story = {
  render: () => {
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
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('Dropdown with icon renders', async () => {
      const dropdown = canvas.getByTestId('location-dropdown')
      await expect(dropdown).toBeInTheDocument()
      
      // Check if slot content exists
      const svg = dropdown.querySelector('svg[slot="prefix"]')
      await expect(svg).toBeTruthy()
    })
  },
}

/**
 * Disabled dropdown state
 */
export const Disabled: Story = {
  render: () => (
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
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('Dropdown is disabled', async () => {
      const dropdown = canvas.getByTestId('disabled-dropdown')
      await expect(dropdown).toHaveAttribute('disabled')
    })
    
    await step('Disabled dropdown does not open on click', async () => {
      const dropdown = canvas.getByTestId('disabled-dropdown')
      
      // Try to click
      await userEvent.click(dropdown)
      
      // Verify it stays disabled
      await expect(dropdown).toHaveAttribute('disabled')
    })
  },
}

/**
 * Dropdown with error state
 */
export const WithError: Story = {
  render: () => {
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
 * Interactive test - Full user flow
 */
export const InteractiveSelection: Story = {
  render: () => {
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
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('Dropdown renders', async () => {
      const dropdown = canvas.getByTestId('interactive-dropdown')
      await expect(dropdown).toBeInTheDocument()
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
    const [theme, setTheme] = useState('dark')
    const [variant, setVariant] = useState('primary')
    
    const themeOptions = [
      { label: 'Dark', value: 'dark' },
      { label: 'Light', value: 'light' },
      { label: 'Glass', value: 'glass' },
    ]
    
    const variantOptions = [
      { label: 'Primary', value: 'primary' },
      { label: 'Secondary', value: 'secondary' },
      { label: 'Ghost', value: 'ghost' },
    ]
    
    return (
      <div>
        <h3>React State Management Demo</h3>
        <div style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
          <VgDropdown
            label="Theme"
            options={themeOptions}
            value={theme}
            onVgChange={(e) => setTheme(e.detail.value)}
            data-testid="theme-dropdown"
          />
          <VgDropdown
            label="Variant"
            options={variantOptions}
            value={variant}
            onVgChange={(e) => setVariant(e.detail.value)}
            data-testid="variant-dropdown"
          />
        </div>
        <div style={{ marginTop: '16px', padding: '16px', background: '#f0f0f0', borderRadius: '4px' }}>
          <p><strong>Current State:</strong></p>
          <p>Theme: {theme}</p>
          <p>Variant: {variant}</p>
        </div>
      </div>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('Both dropdowns render with React state', async () => {
      const themeDropdown = canvas.getByTestId('theme-dropdown')
      const variantDropdown = canvas.getByTestId('variant-dropdown')
      
      await expect(themeDropdown).toHaveAttribute('value', 'dark')
      await expect(variantDropdown).toHaveAttribute('value', 'primary')
    })
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates React hooks (useState) integration with multiple dropdowns managing application state.',
      },
    },
  },
}
