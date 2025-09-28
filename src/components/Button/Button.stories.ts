import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import './index'

const component = 'vg-button'

type Story = StoryObj

const meta: Meta = {
  title: 'Components/Button',
  component,
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'ghost'],
      description: 'Visual style variant for the button'
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Controls the paddings and font sizing of the button'
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disables pointer interaction and visually indicates an unavailable state'
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Renders a lightweight loading indicator and prevents interaction while true'
    },
    buttonType: {
      control: { type: 'select' },
      options: ['button', 'submit', 'reset'],
      description: 'Button type attribute mirroring the native element contract'
    },
    label: {
      control: { type: 'text' },
      description: 'Button label content'
    },
  },
  parameters: {
    actions: {
      handles: ['vg-click'],
    },
    docs: {
      description: {
        component: 'Accessible, theme-aware button component with size and variant controls.',
      },
    },
  },
  render: (args) => html`
    <vg-button
      .variant=${args.variant || 'primary'}
      .size=${args.size || 'md'}
      .disabled=${args.disabled || false}
      .loading=${args.loading || false}
      .buttonType=${args.buttonType || 'button'}
    >
      ${args.label || 'Button'}
    </vg-button>
  `,
}

export default meta

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    label: 'Primary Button',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'md',
    disabled: false,
    loading: false,
    label: 'Secondary Button',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    size: 'md',
    disabled: false,
    loading: false,
    label: 'Ghost Button',
  },
}

export const Small: Story = {
  args: {
    variant: 'primary',
    size: 'sm',
    disabled: false,
    loading: false,
    label: 'Small Button',
  },
}

export const Large: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    disabled: false,
    loading: false,
    label: 'Large Button',
  },
}

export const Disabled: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    disabled: true,
    loading: false,
    label: 'Disabled Button',
  },
}

export const Loading: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: true,
    label: 'Loading Button',
  },
}

export const WithPrefixIcon: Story = {
  render: () => html`
    <vg-button variant="primary" size="md">
      <svg slot="prefix" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
      Button with Icon
    </vg-button>
  `,
}

export const WithSuffixIcon: Story = {
  render: () => html`
    <vg-button variant="secondary" size="md">
      Button with Icon
      <svg slot="suffix" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12l-4.58 4.59z"/>
      </svg>
    </vg-button>
  `,
}