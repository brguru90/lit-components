import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers'
import { VgCard } from '../src'
import { getArgTypesFromManifest } from '../.storybook/controls'

const { events, args, argTypes, template } = getStorybookHelpers('vg-card')

type Story = StoryObj<VgCard & typeof args>

const meta: Meta = {
  title: 'Components/Card',
  tags: ['autodocs'],
  component: 'vg-card',
  
  args,
  ...getArgTypesFromManifest('vg-card'),
  render: (args) => template(args),
  parameters: {
    actions: {
      handles: events,
    },
  },
}

export default meta

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    heading: 'Card Heading',
  },
  render: (args) => template(args, html`
    <p>This is the main content of the card. It can contain any HTML content including text, images, and other elements.</p>
    <p>Cards are useful for grouping related information together in a visually appealing container.</p>
  `),
}

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    heading: 'Outlined Card',
  },
  render: (args) => template(args, html`
    <p>This card uses the outlined variant, which typically shows a border instead of a shadow.</p>
  `),
}

export const Subtle: Story = {
  args: {
    variant: 'subtle',
    heading: 'Subtle Card',
  },
  render: (args) => template(args, html`
    <p>This card uses the subtle variant for a more understated appearance.</p>
  `),
}

export const Interactive: Story = {
  args: {
    variant: 'elevated',
    heading: 'Interactive Card',
    interactive: true,
  },
  render: (args) => template(args, html`
    <p>This card is interactive and can be clicked. It will emit a vg-action event when activated.</p>
    <p>Try clicking or pressing Enter/Space when focused.</p>
  `),
}

export const WithHeaderSlot: Story = {
  args: {
    variant: 'elevated',
    interactive: false,
  },
  render: (args) => template(args, html`
    <div slot="header" style="display: flex; align-items: center; gap: 8px; padding: 16px; border-bottom: 1px solid #e0e0e0;">
      <img src="https://via.placeholder.com/40" alt="Avatar" style="border-radius: 50%;" />
      <div>
        <h4 style="margin: 0; font-size: 14px;">John Doe</h4>
        <p style="margin: 0; font-size: 12px; color: #666;">2 hours ago</p>
      </div>
    </div>
    <p>This card demonstrates using the header slot for custom content like user information.</p>
  `),
}

export const WithFooterSlot: Story = {
  args: {
    variant: 'elevated',
    interactive: false,
    heading: 'Card with Actions',
  },
  render: (args) => template(args, html`
    <p>This card has action buttons in the footer slot.</p>
    <div slot="footer" style="display: flex; gap: 8px; padding: 16px; justify-content: flex-end; border-top: 1px solid #e0e0e0;">
      <button style="padding: 8px 16px; border: 1px solid #ccc; background: white; border-radius: 4px;">Cancel</button>
      <button style="padding: 8px 16px; border: none; background: #007bff; color: white; border-radius: 4px;">Save</button>
    </div>
  `),
}

export const FullyCustomized: Story = {
  args: {
    variant: 'outlined',
    interactive: true,
  },
  render: (args) => template(args, html`
    <div slot="header" style="padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
      <h3 style="margin: 0;">Featured Product</h3>
    </div>
    <div style="padding: 16px;">
      <img src="https://via.placeholder.com/200x120" alt="Product" style="width: 100%; border-radius: 4px; margin-bottom: 12px;" />
      <h4 style="margin: 0 0 8px 0;">Amazing Product</h4>
      <p style="margin: 0; color: #666;">This is a featured product with custom header and footer styling.</p>
      <div style="margin-top: 12px; font-size: 18px; font-weight: bold; color: #007bff;">$99.99</div>
    </div>
    <div slot="footer" style="padding: 16px; background: #f8f9fa; display: flex; justify-content: space-between; align-items: center;">
      <span style="color: #28a745; font-size: 14px;">✓ In Stock</span>
      <button style="padding: 8px 16px; border: none; background: #007bff; color: white; border-radius: 4px;">Add to Cart</button>
    </div>
  `),
}