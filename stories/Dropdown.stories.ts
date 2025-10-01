import type { Meta, StoryContext, StoryObj } from '@storybook/web-components-vite'
import { useArgs, useState } from 'storybook/preview-api';
import { html } from 'lit'
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers'
import { VgDropdown } from '../src'
import { getArgTypesFromManifest } from '../.storybook/controls'

const { events, args, argTypes, template } = getStorybookHelpers('vg-dropdown')

type Story = StoryObj<VgDropdown & typeof args>

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
  tags: ['autodocs'],
  component: 'vg-dropdown',

  args: args,
  ...getArgTypesFromManifest('vg-dropdown'),
  render: (args) => template(args),
  // parameters: {
  //   actions: {
  //     handles: events,
  //   },
  //   docs: {
  //     source: {
  //       type: 'dynamic',
  //       // transformSource receives the original source and story context (args, etc.)
  //       transform: (_src: string, storyContext:StoryContext) => {
  //         const { options, ...otherArgs } = storyContext.args

  //         console.log(storyContext)
  //         return `
  //         ${JSON.stringify(otherArgs)}<br />
  //           <vg-dropdown 
              // label="${otherArgs.label || ''}"
              // placeholder="${otherArgs.placeholder || ''}"
              // ?disabled="${otherArgs.disabled}"
              // ?required="${otherArgs.required}"
              // value="${otherArgs.value || ''}"
              // .options="${JSON.stringify(options)}"
  //           >
  //           </vg-dropdown>
  //         `
  //       },
  //     },
  //   },
  // },
}

export default meta

const ExampleComponent = (args: any) => {
  const [currentArgs, updateArgs] = useArgs();
  const [value, setValue] = useState(currentArgs.value || '');
  const onchange = (e: CustomEvent) => {
    setValue(e.detail.value);
    updateArgs({ value: e.detail.value })
  }
  return html`
    <vg-dropdown 
      label=${args.label || ''}
      placeholder=${args.placeholder || ''}
      ?disabled=${args.disabled}
      ?required=${args.required}
      value=${args.value || ''}
      helper-text=${args.helperText || ''}
      error=${args.error || ''}
      .options=${args.options}
      @vg-change=${onchange}
    ></vg-dropdown><br />
    Selected: <b>${value}</b>
  `
}

export const Default: Story = {
  args: {
    label: 'Select an Option',
    placeholder: 'Choose one...',
    options: sampleOptions,
    disabled: false,
    required: false,
    value: '',
  },

  render: ExampleComponent
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
  render: ExampleComponent

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
  render: ExampleComponent
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
  render: ExampleComponent
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
  render: ExampleComponent
}

export const WithPrefixIcon: Story = {
  args: {
    label: 'Location',
    placeholder: 'Select location',
    options: [
      { label: 'New York', value: 'ny', description: 'Eastern Time Zone' },
      { label: 'Los Angeles', value: 'la', description: 'Pacific Time Zone' },
      { label: 'Chicago', value: 'chi', description: 'Central Time Zone' },
      { label: 'Denver', value: 'den', description: 'Mountain Time Zone' },
    ],
  },
  render: (args) => {
    const [currentArgs, updateArgs] = useArgs();
    const [value, setValue] = useState(currentArgs.value || '');
    const onchange = (e: CustomEvent) => {
      setValue(e.detail.value);
      updateArgs({ value: e.detail.value })
    }
    return html`
      <vg-dropdown 
        label=${args.label || ''}
        placeholder=${args.placeholder || ''}
        ?disabled=${args.disabled}
        ?required=${args.required}
        value=${args.value || ''}
        .options=${args.options}
        @vg-change=${onchange}
      >
        <svg slot="prefix" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-left: 12px;">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </vg-dropdown><br />
      Selected: <b>${value}</b>
    `
  },
  parameters: {
    actions: {
      handles: events,
    },
    docs: {
      source: {
        type: 'dynamic',
        // transformSource receives the original source and story context (args, etc.)
        transform: (_src: string, storyContext:StoryContext) => {
          const { options, ...otherArgs } = storyContext.args
          return `
            <vg-dropdown 
              label="${otherArgs.label || ''}"
              placeholder="${otherArgs.placeholder || ''}"
              disabled="${otherArgs.disabled}"
              required="${otherArgs.required}"
              value="${otherArgs.value || ''}"
              options="${JSON.stringify(options)}"
              on-vg-change="(event) => { /* handler */ }"
            >
              <svg slot="prefix" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-left: 12px;">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </vg-dropdown>
          `
        },
      },
    },
  },
}

export const WithSuffixBadge: Story = {
  args: {
    label: 'Plan Type',
    placeholder: 'Select your plan',
    value: 'pro',
    options: [
      { label: 'Basic', value: 'basic', description: '$10/month - Essential features' },
      { label: 'Pro', value: 'pro', description: '$25/month - Advanced features' },
      { label: 'Enterprise', value: 'enterprise', description: '$50/month - All features' },
    ],
  },
  render: (args) => {
    const { options, ...otherArgs } = args
    return html`
      <vg-dropdown 
        label=${otherArgs.label || ''}
        placeholder=${otherArgs.placeholder || ''}
        ?disabled=${otherArgs.disabled}
        ?required=${otherArgs.required}
        value=${otherArgs.value || ''}
        .options=${options}
        @vg-change=${onchange}
      >
        <span slot="suffix" style="background: #28a745; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px; margin-right: 8px;">Popular</span>
      </vg-dropdown>
    `
  },
  parameters: {
    actions: {
      handles: events,
    },
    docs: {
      source: {
        type: 'dynamic',
        // transformSource receives the original source and story context (args, etc.)
        transform: (_src: string, storyContext:StoryContext) => {
          const { options, ...otherArgs } = storyContext.args
          return `
            <vg-dropdown 
              label="${otherArgs.label || ''}"
              placeholder="${otherArgs.placeholder || ''}"
              disabled="${otherArgs.disabled}"
              required="${otherArgs.required}"
              value="${otherArgs.value || ''}"
              options='${JSON.stringify(options)}'
              on-vg-change="(event) => { /* handler */ }"
            >
               <span slot="suffix" style="background: #28a745; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px; margin-right: 8px;">
                Popular
               </span>
            </vg-dropdown>
          `
        },
      },
    },
  },
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
  render: ExampleComponent
}

