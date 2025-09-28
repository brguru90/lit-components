import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers'
import { VgButton } from '../src'
import { getArgTypesFromManifest } from '../.storybook/controls'

const { events, args, argTypes, template } = getStorybookHelpers('vg-button')

console.log({ events, args, argTypes: argTypes, template })
type Story = StoryObj<VgButton & typeof args>

const meta: Meta = {
  title: 'Components/Button',
  tags: ['autodocs'],
  component: 'vg-button',
  
  args,
  ...getArgTypesFromManifest('vg-button'),
  render: (args) => template(args),
  parameters: {
    actions: {
      handles: events,
    },
  },
}

export default meta

export const Default: Story = {
  render: (args) => template(args, html`Click me`),
}

export const Primary: Story = {
  args: {
    variant: 'primary',
  },
  render: (args) => template(args, html`Primary Button`),
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
  render: (args) => template(args, html`Secondary Button`),
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
  },
  render: (args) => template(args, html`Ghost Button`),
}

export const Small: Story = {
  args: {
    size: 'sm',
  },
  render: (args) => template(args, html`Small Button`),
}

export const Large: Story = {
  args: {
    size: 'lg',
  },
  render: (args) => template(args, html`Large Button`),
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => template(args, html`Disabled Button`),
}

export const Loading: Story = {
  args: {
    loading: true,
  },
  render: (args) => template(args, html`Loading Button`),
}

export const WithPrefixIcon: Story = {
  render: (args) => template(args, html`
    <svg slot="prefix" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
    Button with Icon
  `),
}

export const WithSuffixIcon: Story = {
  args: {
    variant: 'secondary',
  },
  render: (args) => template(args, html`
    Button with Icon
    <svg slot="suffix" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12l-4.58 4.59z"/>
    </svg>
  `),
}