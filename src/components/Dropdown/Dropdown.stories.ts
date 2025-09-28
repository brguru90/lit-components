import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import './index'

const component = 'vg-dropdown'

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
  { label: 'Japan', value: 'jp', description: 'Asia' },
  { label: 'Brazil', value: 'br', description: 'South America' },
]

const meta: Meta = {
  title: 'Components/Dropdown',
  component,
  argTypes: {
    label: {
      control: { type: 'text' },
      description: 'Label displayed above the dropdown control'
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder rendered as the first option when no value is selected'
    },
    value: {
      control: { type: 'text' },
      description: 'Currently selected value'
    },
    helperText: {
      control: { type: 'text' },
      description: 'Optional text rendered below the control for guidance'
    },
    error: {
      control: { type: 'text' },
      description: 'Error message displayed below the control'
    },
    name: {
      control: { type: 'text' },
      description: 'Name attribute forwarded to the native select element'
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disables the dropdown and prevents user interaction'
    },
    required: {
      control: { type: 'boolean' },
      description: 'Marks the dropdown as required when used in forms'
    },
    options: {
      control: { type: 'object' },
      description: 'Array of dropdown options'
    },
  },
  parameters: {
    actions: {
      handles: ['vg-change'],
    },
    docs: {
      description: {
        component: 'Theme-aware dropdown select element supporting helper text, errors, and descriptions per option.',
      },
    },
  },
  render: (args) => html`
    <vg-dropdown
      .label=${args.label || null}
      .placeholder=${args.placeholder || null}
      .value=${args.value || null}
      .helperText=${args.helperText || null}
      .error=${args.error || null}
      .name=${args.name || null}
      .disabled=${args.disabled || false}
      .required=${args.required || false}
      .options=${args.options || []}
    ></vg-dropdown>
  `,
}

export default meta

export const Default: Story = {
  args: {
    label: 'Select an Option',
    placeholder: 'Choose one...',
    options: sampleOptions,
    disabled: false,
    required: false,
    value: '',
  },
}

export const WithValue: Story = {
  args: {
    label: 'Country',
    placeholder: 'Select your country',
    options: countryOptions,
    value: 'us',
    helperText: 'This affects your shipping options',
    disabled: false,
    required: true,
  },
}

export const WithHelperText: Story = {
  args: {
    label: 'Priority Level',
    placeholder: 'Select priority',
    options: [
      { label: 'Low', value: 'low', description: 'Non-urgent items' },
      { label: 'Medium', value: 'medium', description: 'Standard priority' },
      { label: 'High', value: 'high', description: 'Important items' },
      { label: 'Critical', value: 'critical', description: 'Urgent attention required' },
    ],
    helperText: 'Choose the appropriate priority level for your request',
    disabled: false,
    required: true,
  },
}

export const WithError: Story = {
  args: {
    label: 'Required Field',
    placeholder: 'You must select an option',
    options: sampleOptions,
    error: 'This field is required',
    disabled: false,
    required: true,
  },
}

export const Disabled: Story = {
  args: {
    label: 'Disabled Dropdown',
    placeholder: 'Cannot select',
    options: sampleOptions,
    value: 'option2',
    helperText: 'This field is currently disabled',
    disabled: true,
    required: false,
  },
}

export const WithPrefixIcon: Story = {
  render: () => html`
    <vg-dropdown
      label="Location"
      placeholder="Select location"
      .options=${[
        { label: 'New York', value: 'ny', description: 'Eastern Time Zone' },
        { label: 'Los Angeles', value: 'la', description: 'Pacific Time Zone' },
        { label: 'Chicago', value: 'chi', description: 'Central Time Zone' },
        { label: 'Denver', value: 'den', description: 'Mountain Time Zone' },
      ]}
    >
      <svg slot="prefix" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-left: 12px;">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </vg-dropdown>
  `,
}

export const WithSuffixBadge: Story = {
  render: () => html`
    <vg-dropdown
      label="Plan Type"
      placeholder="Select your plan"
      value="pro"
      .options=${[
        { label: 'Basic', value: 'basic', description: '$10/month - Essential features' },
        { label: 'Pro', value: 'pro', description: '$25/month - Advanced features' },
        { label: 'Enterprise', value: 'enterprise', description: '$50/month - All features' },
      ]}
    >
      <span slot="suffix" style="background: #28a745; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px; margin-right: 8px;">
        Popular
      </span>
    </vg-dropdown>
  `,
}

export const LongOptionsList: Story = {
  args: {
    label: 'Country',
    placeholder: 'Select your country',
    options: [
      { label: 'Afghanistan', value: 'af' },
      { label: 'Albania', value: 'al' },
      { label: 'Algeria', value: 'dz' },
      { label: 'Argentina', value: 'ar' },
      { label: 'Australia', value: 'au' },
      { label: 'Austria', value: 'at' },
      { label: 'Bangladesh', value: 'bd' },
      { label: 'Belgium', value: 'be' },
      { label: 'Brazil', value: 'br' },
      { label: 'Canada', value: 'ca' },
      { label: 'China', value: 'cn' },
      { label: 'Denmark', value: 'dk' },
      { label: 'Egypt', value: 'eg' },
      { label: 'France', value: 'fr' },
      { label: 'Germany', value: 'de' },
      { label: 'India', value: 'in' },
      { label: 'Italy', value: 'it' },
      { label: 'Japan', value: 'jp' },
      { label: 'Mexico', value: 'mx' },
      { label: 'Netherlands', value: 'nl' },
      { label: 'Norway', value: 'no' },
      { label: 'Russia', value: 'ru' },
      { label: 'South Africa', value: 'za' },
      { label: 'Spain', value: 'es' },
      { label: 'Sweden', value: 'se' },
      { label: 'Switzerland', value: 'ch' },
      { label: 'United Kingdom', value: 'uk' },
      { label: 'United States', value: 'us' },
    ],
    helperText: 'Scroll to see more options',
    disabled: false,
    required: false,
  },
}

export const AllStates: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px; max-width: 400px;">
      <vg-dropdown 
        label="Normal State" 
        placeholder="Choose an option..."
        .options=${sampleOptions}
        helper-text="Select from the available options">
      </vg-dropdown>
      
      <vg-dropdown 
        label="With Selection" 
        placeholder="Choose an option..."
        value="option2"
        .options=${sampleOptions}
        helper-text="Option 2 is currently selected">
      </vg-dropdown>
      
      <vg-dropdown 
        label="Error State" 
        placeholder="This field has an error"
        .options=${sampleOptions}
        error="Please select a valid option">
      </vg-dropdown>
      
      <vg-dropdown 
        label="Disabled State" 
        placeholder="Cannot interact"
        value="option1"
        .options=${sampleOptions}
        ?disabled=${true}
        helper-text="This dropdown is disabled">
      </vg-dropdown>
      
      <vg-dropdown 
        label="Required Field" 
        placeholder="Selection required"
        .options=${sampleOptions}
        ?required=${true}
        helper-text="* This field is required">
      </vg-dropdown>
    </div>
  `,
}