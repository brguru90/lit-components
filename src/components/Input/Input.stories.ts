import type { Meta, StoryObj } from '@storybook/web-components'
import { getWcStorybookHelpers } from 'wc-storybook-helpers'
import './index'

const component = 'vg-input'
const { events, args, argTypes, template } = getWcStorybookHelpers(component)

type Story = StoryObj

const meta: Meta = {
  title: 'Components/Input',
  component,
  args,
  argTypes: argTypes as any,
  parameters: {
    actions: {
      handles: events,
    },
    docs: {
      description: {
        component: 'Theme-aware text input supporting helper and error messaging.',
      },
    },
  },
  render: (args) => template(args),
}

export default meta

export const Default: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter your username',
    type: 'text',
    disabled: false,
    required: false,
    value: '',
  },
}

export const WithValue: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    type: 'email',
    value: 'john.doe@example.com',
    disabled: false,
    required: true,
  },
}

export const WithHelperText: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    type: 'password',
    helperText: 'Password must be at least 8 characters long',
    required: true,
    disabled: false,
  },
}

export const WithError: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    type: 'email',
    value: 'invalid-email',
    error: 'Please enter a valid email address',
    disabled: false,
    required: true,
  },
}

export const Disabled: Story = {
  args: {
    label: 'Readonly Field',
    placeholder: 'This field is disabled',
    type: 'text',
    value: 'Cannot edit this',
    disabled: true,
    required: false,
  },
}

export const Required: Story = {
  args: {
    label: 'Required Field',
    placeholder: 'This field is required',
    type: 'text',
    required: true,
    disabled: false,
  },
}

export const WithPrefixIcon: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search for items...',
    type: 'search',
    'prefix-slot': `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-left: 12px;">
        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
      </svg>
    `,
    disabled: false,
    required: false,
  },
}

export const WithSuffixButton: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    type: 'password',
    'suffix-slot': `
      <button type="button" style="border: none; background: transparent; padding: 8px; cursor: pointer; display: flex; align-items: center;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
        </svg>
      </button>
    `,
    disabled: false,
    required: false,
  },
}

export const NumberInput: Story = {
  args: {
    label: 'Age',
    placeholder: 'Enter your age',
    type: 'number',
    helperText: 'Must be 18 or older',
    disabled: false,
    required: true,
  },
}

export const TelephoneInput: Story = {
  args: {
    label: 'Phone Number',
    placeholder: '+1 (555) 123-4567',
    type: 'tel',
    helperText: 'Include country code',
    disabled: false,
    required: false,
  },
}

export const AllStates: Story = {
  render: () => `
    <div style="display: flex; flex-direction: column; gap: 24px; max-width: 400px;">
      <vg-input 
        label="Normal State" 
        placeholder="Type something..." 
        helper-text="This is helper text">
      </vg-input>
      
      <vg-input 
        label="With Value" 
        value="Some content" 
        helper-text="Field with existing content">
      </vg-input>
      
      <vg-input 
        label="Error State" 
        value="invalid@" 
        error="Invalid email format">
      </vg-input>
      
      <vg-input 
        label="Disabled State" 
        value="Cannot edit" 
        disabled
        helper-text="This field is disabled">
      </vg-input>
      
      <vg-input 
        label="Required Field" 
        placeholder="This field is required" 
        required
        helper-text="* Required field">
      </vg-input>
    </div>
  `,
}