import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { useArgs, useState } from 'storybook/preview-api'
import { html } from 'lit'
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers'
import { ThemeProvider } from '../src'
import { getArgTypesFromManifest } from '../.storybook/controls'

import { addons } from 'storybook/manager-api'
import { ThemeChangeDetail } from '../src/components/ThemeProvider/theme-provider'
import { themes } from '../.storybook/themes'

const { events, args, argTypes, template } = getStorybookHelpers('vg-theme-provider')

type Story = StoryObj<ThemeProvider & typeof args>


const onThemeChange = (event: CustomEvent<ThemeChangeDetail>) => {
  const newTheme = themes[event.detail.mode]
  console.log(newTheme, event.detail.mode)

  if (newTheme) {
    addons.setConfig({
      theme: newTheme,
    })
  }
}



const meta: Meta = {
  title: 'Components/ThemeProvider',
  tags: ['autodocs'],
  component: 'vg-theme-provider',

  args: { ...args,"@vg-change":console.log },
  ...getArgTypesFromManifest('vg-theme-provider'),
  render: (args) => template(args),
  parameters: {
    actions: {
      handles: events,
    },
  },
}

export default meta

export const Dark: Story = {
  args: {
    mode: 'dark',
  },
  render: (args) => template(args, html`
    <div style="padding: 24px; border-radius: 8px; background: var(--vg-background-color); color: var(--vg-text-color);">
      <h3 style="margin: 0 0 16px 0; color: var(--vg-accent-color);">Dark Theme</h3>
      <p style="margin: 0 0 16px 0;">This content inherits the dark theme styling with CSS custom properties.</p>
      <vg-button variant="primary">Sample Button</vg-button>
    </div>
  `),
}

export const Light: Story = {
  args: {
    mode: 'light',
  },
  render: (args) => template(args, html`
    <div style="padding: 24px; border-radius: 8px; background: var(--vg-background-color); color: var(--vg-text-color);">
      <h3 style="margin: 0 0 16px 0; color: var(--vg-accent-color);">Light Theme</h3>
      <p style="margin: 0 0 16px 0;">This content inherits the light theme styling with CSS custom properties.</p>
      <vg-button variant="primary">Sample Button</vg-button>
    </div>
  `),
}

export const Glass: Story = {
  args: {
    mode: 'glass',
  },
  render: (args) => template(args, html`
    <div style="padding: 24px; border-radius: 8px; background: var(--vg-background-color); color: var(--vg-text-color);">
      <h3 style="margin: 0 0 16px 0; color: var(--vg-accent-color);">Glass Theme</h3>
      <p style="margin: 0 0 16px 0;">This content inherits the glass theme styling with CSS custom properties.</p>
      <vg-button variant="primary">Sample Button</vg-button>
    </div>
  `),
}

export const Cartoon: Story = {
  args: {
    mode: 'cartoon',
  },
  render: (args) => template(args, html`
    <div style="padding: 24px; border-radius: 8px; background: var(--vg-background-color); color: var(--vg-text-color);">
      <h3 style="margin: 0 0 16px 0; color: var(--vg-accent-color);">Cartoon Theme</h3>
      <p style="margin: 0 0 16px 0;">This content inherits the cartoon theme styling with CSS custom properties.</p>
      <vg-button variant="primary">Sample Button</vg-button>
    </div>
  `),
}

export const WithMultipleComponents: Story = {
  args: {
    mode: 'dark',
  },
  render: (args) => template(args, html`
    <div style="padding: 24px; display: flex; flex-direction: column; gap: 16px; background: var(--vg-background-color); color: var(--vg-text-color); border-radius: 8px;">
      <h3 style="margin: 0; color: var(--vg-accent-color);">Component Showcase</h3>
      
      <vg-card heading="Sample Card" variant="elevated">
        <p>This card inherits the theme from the provider.</p>
        <div style="display: flex; gap: 8px; margin-top: 16px;">
          <vg-button variant="primary" size="sm">Primary</vg-button>
          <vg-button variant="secondary" size="sm">Secondary</vg-button>
          <vg-button variant="ghost" size="sm">Ghost</vg-button>
        </div>
      </vg-card>
      
      <div style="display: grid; gap: 16px; grid-template-columns: 1fr 1fr;">
        <vg-input label="Username" placeholder="Enter username"></vg-input>
        <vg-dropdown 
          label="Options" 
          placeholder="Select..."
          .options=${[
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
      { label: 'Option 3', value: '3' },
    ]}
        ></vg-dropdown>
      </div>
    </div>
  `),
}