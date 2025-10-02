/**
 * Dropdown Component - Vanilla HTML/JavaScript
 * 
 * This demonstrates using vanilla HTML and JavaScript without any framework.
 * Uses addEventListener, querySelector, and direct DOM manipulation.
 */

import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import "vg"

const meta: Meta = {
  title: 'Native Framework Rendering/Dropdown/HTML',
  tags: ['autodocs', 'test'],
  parameters: {
    docs: {
      description: {
        component: 'Dropdown component using vanilla HTML and JavaScript with addEventListener and DOM manipulation.',
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
 * Basic dropdown with vanilla JavaScript
 */
export const Default: Story = {
  render: () => {
    const container = document.createElement('div')
    container.innerHTML = `
      <div>
        <vg-dropdown
          label="Select an Option"
          placeholder="Choose one..."
          data-testid="default-dropdown"
        ></vg-dropdown>
        <p id="selected-value" style="margin-top: 12px;">
          Selected: <strong>(none)</strong>
        </p>
      </div>
    `
    
    // Initialize after DOM is ready
    setTimeout(() => {
      const dropdown = container.querySelector('vg-dropdown') as any
      const outputEl = container.querySelector('#selected-value strong')
      
      if (dropdown) {
        dropdown.options = sampleOptions
        
        dropdown.addEventListener('vg-change', (event: Event) => {
          const customEvent = event as CustomEvent
          if (outputEl) {
            outputEl.textContent = customEvent.detail.value || '(none)'
          }
        })
      }
    }, 0)
    
    return container
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('Dropdown renders with label', async () => {
      const dropdown = canvas.getByTestId('default-dropdown')
      await expect(dropdown).toBeInTheDocument()
      await expect(dropdown).toHaveAttribute('label', 'Select an Option')
    })
    
    await step('Options are set via JavaScript', async () => {
      const dropdown = canvas.getByTestId('default-dropdown') as any
      await waitFor(() => {
        expect(dropdown.options).toBeTruthy()
        expect(dropdown.options.length).toBeGreaterThan(0)
      })
    })
  },
}

/**
 * Dropdown with pre-selected value
 */
export const WithValue: Story = {
  render: () => {
    const container = document.createElement('div')
    container.innerHTML = `
      <div>
        <vg-dropdown
          label="Country"
          placeholder="Select your country"
          value="us"
          helper-text="This affects your shipping options"
          required
          data-testid="country-dropdown"
        ></vg-dropdown>
        <p id="country-value" style="margin-top: 12px;">
          Selected: <strong>us</strong>
        </p>
      </div>
    `
    
    setTimeout(() => {
      const dropdown = container.querySelector('vg-dropdown') as any
      const outputEl = container.querySelector('#country-value strong')
      
      if (dropdown) {
        dropdown.options = countryOptions
        
        dropdown.addEventListener('vg-change', (event: Event) => {
          const customEvent = event as CustomEvent
          if (outputEl) {
            outputEl.textContent = customEvent.detail.value
          }
        })
      }
    }, 0)
    
    return container
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('Dropdown has initial value', async () => {
      const dropdown = canvas.getByTestId('country-dropdown')
      await expect(dropdown).toHaveAttribute('value', 'us')
      await expect(dropdown).toHaveAttribute('required')
    })
  },
}

/**
 * Dropdown with prefix icon using slot
 */
export const WithPrefixIcon: Story = {
  render: () => {
    const container = document.createElement('div')
    container.innerHTML = `
      <div>
        <vg-dropdown
          label="Location"
          placeholder="Select location"
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
        <p id="location-value" style="margin-top: 12px;">
          Selected: <strong>(none)</strong>
        </p>
      </div>
    `
    
    setTimeout(() => {
      const dropdown = container.querySelector('vg-dropdown') as any
      const outputEl = container.querySelector('#location-value strong')
      
      const locationOptions = [
        { label: 'New York', value: 'ny', description: 'Eastern Time Zone' },
        { label: 'Los Angeles', value: 'la', description: 'Pacific Time Zone' },
        { label: 'Chicago', value: 'chi', description: 'Central Time Zone' },
      ]
      
      if (dropdown) {
        dropdown.options = locationOptions
        
        dropdown.addEventListener('vg-change', (event: Event) => {
          const customEvent = event as CustomEvent
          if (outputEl) {
            outputEl.textContent = customEvent.detail.value || '(none)'
          }
        })
      }
    }, 0)
    
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
    container.innerHTML = `
      <div>
        <vg-dropdown
          label="Disabled Dropdown"
          placeholder="Cannot select"
          value="option2"
          helper-text="This field is currently disabled"
          disabled
          data-testid="disabled-dropdown"
        ></vg-dropdown>
      </div>
    `
    
    setTimeout(() => {
      const dropdown = container.querySelector('vg-dropdown') as any
      if (dropdown) {
        dropdown.options = sampleOptions
      }
    }, 0)
    
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
 * Dropdown with error state
 */
export const WithError: Story = {
  render: () => {
    const container = document.createElement('div')
    container.innerHTML = `
      <div>
        <vg-dropdown
          label="Required Field"
          placeholder="Please select"
          error="This field is required"
          required
          data-testid="error-dropdown"
        ></vg-dropdown>
      </div>
    `
    
    setTimeout(() => {
      const dropdown = container.querySelector('vg-dropdown') as any
      if (dropdown) {
        dropdown.options = sampleOptions
        
        dropdown.addEventListener('vg-change', (event: Event) => {
          const customEvent = event as CustomEvent
          if (customEvent.detail.value) {
            dropdown.removeAttribute('error')
          }
        })
      }
    }, 0)
    
    return container
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('Dropdown shows error state', async () => {
      const dropdown = canvas.getByTestId('error-dropdown')
      await expect(dropdown).toHaveAttribute('error', 'This field is required')
    })
  },
}

/**
 * Complete vanilla JavaScript demo
 */
export const VanillaJavaScriptDemo: Story = {
  render: () => {
    const container = document.createElement('div')
    container.innerHTML = `
      <div>
        <h3>Vanilla HTML/JavaScript Demo</h3>
        <vg-theme-provider mode="dark" id="theme-provider">
          <vg-card heading="Settings" variant="subtle">
            <vg-dropdown
              label="Theme"
              value="dark"
              id="theme-dropdown"
              data-testid="theme-dropdown"
            >
              <svg slot="prefix" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 2a7 7 0 1 0 10 10"/>
              </svg>
            </vg-dropdown>
            
            <vg-dropdown
              label="Country"
              value="us"
              helper-text="Select your country"
              id="country-dropdown"
              data-testid="country-dropdown"
            ></vg-dropdown>
          </vg-card>
          
          <vg-card heading="State" variant="outlined">
            <p>Theme: <strong id="theme-display">dark</strong></p>
            <p>Country: <strong id="country-display">us</strong></p>
            <p>Total Changes: <strong id="change-count" data-testid="change-count">0</strong></p>
          </vg-card>
        </vg-theme-provider>
      </div>
    `
    
    // Initialize after DOM is ready
    setTimeout(() => {
      const themeDropdown = container.querySelector('#theme-dropdown') as any
      const countryDropdown = container.querySelector('#country-dropdown') as any
      const themeProvider = container.querySelector('#theme-provider') as any
      const themeDisplay = container.querySelector('#theme-display')
      const countryDisplay = container.querySelector('#country-display')
      const changeCount = container.querySelector('#change-count')
      
      let count = 0
      
      const themeOptions = [
        { label: 'Dark', value: 'dark' },
        { label: 'Light', value: 'light' },
        { label: 'Glass', value: 'glass' },
      ]
      
      if (themeDropdown) {
        themeDropdown.options = themeOptions
        
        themeDropdown.addEventListener('vg-change', (event: Event) => {
          const customEvent = event as CustomEvent
          const newTheme = customEvent.detail.value
          
          if (themeProvider) {
            themeProvider.setAttribute('mode', newTheme)
          }
          if (themeDisplay) {
            themeDisplay.textContent = newTheme
          }
          if (changeCount) {
            count++
            changeCount.textContent = count.toString()
          }
        })
      }
      
      if (countryDropdown) {
        countryDropdown.options = countryOptions
        
        countryDropdown.addEventListener('vg-change', (event: Event) => {
          const customEvent = event as CustomEvent
          const newCountry = customEvent.detail.value
          
          if (countryDisplay) {
            countryDisplay.textContent = newCountry
          }
          if (changeCount) {
            count++
            changeCount.textContent = count.toString()
          }
        })
      }
    }, 0)
    
    return container
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('Vanilla JS components render correctly', async () => {
      const themeDropdown = canvas.getByTestId('theme-dropdown')
      const countryDropdown = canvas.getByTestId('country-dropdown')
      
      await expect(themeDropdown).toHaveAttribute('value', 'dark')
      await expect(countryDropdown).toHaveAttribute('value', 'us')
    })
    
    await step('Change counter initializes to 0', async () => {
      const changeCount = canvas.getByTestId('change-count')
      await expect(changeCount).toHaveTextContent('0')
    })
    
    await step('Event listeners are attached', async () => {
      const themeDropdown = canvas.getByTestId('theme-dropdown') as any
      await waitFor(() => {
        expect(themeDropdown.options).toBeTruthy()
        expect(themeDropdown.options.length).toBeGreaterThan(0)
      })
    })
  },
  parameters: {
    docs: {
      description: {
        story: 'Full vanilla JavaScript demo using addEventListener, querySelector, and direct DOM manipulation without any framework.',
      },
    },
  },
}

/**
 * Interactive selection with validation
 */
export const InteractiveValidation: Story = {
  render: () => {
    const container = document.createElement('div')
    container.innerHTML = `
      <div>
        <h3>Interactive Validation</h3>
        <vg-dropdown
          label="Select Country"
          placeholder="Choose your country"
          required
          error="Please select a country"
          id="validation-dropdown"
          data-testid="validation-dropdown"
        ></vg-dropdown>
        <vg-button 
          variant="primary" 
          id="submit-button"
          data-testid="submit-button"
          disabled
        >
          Submit
        </vg-button>
        <p id="validation-message" style="margin-top: 12px; color: #888;">
          Please select a country to enable submit button
        </p>
      </div>
    `
    
    setTimeout(() => {
      const dropdown = container.querySelector('#validation-dropdown') as any
      const submitButton = container.querySelector('#submit-button') as any
      const message = container.querySelector('#validation-message')
      
      if (dropdown) {
        dropdown.options = countryOptions
        
        dropdown.addEventListener('vg-change', (event: Event) => {
          const customEvent = event as CustomEvent
          const value = customEvent.detail.value
          
          if (value) {
            dropdown.removeAttribute('error')
            if (submitButton) {
              submitButton.removeAttribute('disabled')
            }
            if (message) {
              (message as HTMLElement).style.color = '#4caf50'
              message.textContent = `Selected: ${value}`
            }
          } else {
            dropdown.setAttribute('error', 'Please select a country')
            if (submitButton) {
              submitButton.setAttribute('disabled', '')
            }
            if (message) {
              (message as HTMLElement).style.color = '#888'
              message.textContent = 'Please select a country to enable submit button'
            }
          }
        })
      }
      
      if (submitButton) {
        submitButton.addEventListener('vg-click', () => {
          if (message) {
            (message as HTMLElement).style.color = '#2196f3'
            message.textContent = 'Form submitted successfully!'
          }
        })
      }
    }, 0)
    
    return container
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('Dropdown and button render', async () => {
      const dropdown = canvas.getByTestId('validation-dropdown')
      const button = canvas.getByTestId('submit-button')
      
      await expect(dropdown).toBeInTheDocument()
      await expect(button).toHaveAttribute('disabled')
    })
    
    await step('Validation error is shown', async () => {
      const dropdown = canvas.getByTestId('validation-dropdown')
      await expect(dropdown).toHaveAttribute('error', 'Please select a country')
    })
  },
}
