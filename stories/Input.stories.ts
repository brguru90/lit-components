import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers'
import { VgInput } from '../src'
import { getArgTypesFromManifest } from '../.storybook/controls'

const { events, args, argTypes, template } = getStorybookHelpers('vg-input')

type Story = StoryObj<VgInput & typeof args>

const meta: Meta = {
  title: 'Components/Input',
  tags: ['autodocs'],
  component: 'vg-input',
  
  args,
  ...getArgTypesFromManifest('vg-input'),
  render: (args) => template(args),
  parameters: {
    actions: {
      handles: events,
    },
  },
}

export default meta

export const Default: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter your username',
    type: 'text',
  },
}

export const WithValue: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    type: 'email',
    value: 'john.doe@example.com',
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
  },
}

export const WithError: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    type: 'email',
    value: 'invalid-email',
    error: 'Please enter a valid email address',
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
  },
}

export const Required: Story = {
  args: {
    label: 'Required Field',
    placeholder: 'This field is required',
    type: 'text',
    required: true,
  },
}

export const WithPrefixIcon: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search for items...',
    type: 'search',
  },
  render: (args) => template(args, html`
    <svg slot="prefix" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-left: 12px;">
      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    </svg>
  `),
}

export const WithSuffixButton: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    type: 'password',
  },
  render: (args) => template(args, html`
    <button slot="suffix" type="button" style="border: none; background: transparent; padding: 8px; cursor: pointer; display: flex; align-items: center;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
      </svg>
    </button>
  `),
}

export const NumberInput: Story = {
  args: {
    label: 'Age',
    placeholder: 'Enter your age',
    type: 'number',
    helperText: 'Must be 18 or older',
    required: true,
  },
}

export const TelephoneInput: Story = {
  args: {
    label: 'Phone Number',
    placeholder: '+1 (555) 123-4567',
    type: 'tel',
    helperText: 'Include country code',
  },
}