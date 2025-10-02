import type { Meta, StoryObj, StoryContext } from '@storybook/web-components-vite'
import { useArgs, useState } from 'storybook/preview-api'
import { html } from 'lit'
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers'
import { VgButton } from '../src'
import { getArgTypesFromManifest } from '../.storybook/controls'

const { events, args, argTypes, template } = getStorybookHelpers('vg-button')

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

const ExampleComponent = (args: any, content?: any) => {
  const [clickCount, setClickCount] = useState(0);
  const [lastEventTime, setLastEventTime] = useState('');
  
  const onclick = (e: CustomEvent) => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    setLastEventTime(new Date().toLocaleTimeString());
  }
  
  return html`
    <vg-button 
      variant=${args.variant || 'primary'}
      size=${args.size || 'md'}
      ?disabled=${args.disabled}
      ?loading=${args.loading}
      @vg-click=${onclick}
    >
      ${content || 'Click me'}
    </vg-button><br />
    <div style="margin-top: 12px; font-size: 14px; color: #666;">
      Click Count: <b>${clickCount}</b>
      ${lastEventTime ? html`<br />Last Clicked: <b>${lastEventTime}</b>` : ''}
      ${args.disabled || args.loading ? html`<br /><span style="color: #999;">(should not increment)</span>` : ''}
    </div>
  `
}

export const Default: Story = {
  render: (args) => ExampleComponent(args, html`Click me`),
}

export const Primary: Story = {
  args: {
    variant: 'primary',
  },
  render: (args) => ExampleComponent(args, html`Primary Button`),
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
  render: (args) => ExampleComponent(args, html`Secondary Button`),
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
  },
  render: (args) => ExampleComponent(args, html`Ghost Button`),
}

export const Small: Story = {
  args: {
    size: 'sm',
  },
  render: (args) => ExampleComponent(args, html`Small Button`),
}

export const Large: Story = {
  args: {
    size: 'lg',
  },
  render: (args) => ExampleComponent(args, html`Large Button`),
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => ExampleComponent(args, html`Disabled Button`),
}

export const Loading: Story = {
  args: {
    loading: true,
  },
  render: (args) => ExampleComponent(args, html`Loading Button`),
}

export const WithPrefixIcon: Story = {
  render: (args) => ExampleComponent(args, html`
    <svg slot="prefix" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
    Button with Icon
  `),
  parameters: {
    docs: {
      source: {
        type: 'dynamic',
        transform: (_src: string, storyContext: StoryContext) => {
          const args = storyContext.args
          return `<vg-button${args.variant && args.variant !== 'primary' ? ` variant="${args.variant}"` : ''}${args.size && args.size !== 'md' ? ` size="${args.size}"` : ''}${args.disabled ? ' disabled' : ''}${args.loading ? ' loading' : ''} @vg-click="\${handleClick}">
  <svg slot="prefix" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
  Button with Icon
</vg-button>`
        },
      },
    },
  },
}

export const WithSuffixIcon: Story = {
  args: {
    variant: 'secondary',
  },
  render: (args) => ExampleComponent(args, html`
    Button with Icon
    <svg slot="suffix" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12l-4.58 4.59z"/>
    </svg>
  `),
  parameters: {
    docs: {
      source: {
        type: 'dynamic',
        transform: (_src: string, storyContext: StoryContext) => {
          const args = storyContext.args
          return `<vg-button${args.variant && args.variant !== 'primary' ? ` variant="${args.variant}"` : ''}${args.size && args.size !== 'md' ? ` size="${args.size}"` : ''}${args.disabled ? ' disabled' : ''}${args.loading ? ' loading' : ''} @vg-click="\${handleClick}">
  Button with Icon
  <svg slot="suffix" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12l-4.58 4.59z"/>
  </svg>
</vg-button>`
        },
      },
    },
  },
}