import type { Meta, StoryObj } from '@storybook/web-components'
import { getWcStorybookHelpers } from 'wc-storybook-helpers'
import './index'

const component = 'vg-card'
const { events, args, argTypes, template } = getWcStorybookHelpers(component)

type Story = StoryObj

const meta: Meta = {
  title: 'Components/Card',
  component,
  args,
  argTypes: argTypes as any,
  parameters: {
    actions: {
      handles: events,
    },
    docs: {
      description: {
        component: 'Theme-aware content container with optional header/footer slots.',
      },
    },
  },
  render: (args) => template(args),
}

export default meta

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    interactive: false,
    heading: 'Card Heading',
    'default-slot': `
      <p>This is the main content of the card. It can contain any HTML content including text, images, and other elements.</p>
      <p>Cards are useful for grouping related information together in a visually appealing container.</p>
    `,
  },
}

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    interactive: false,
    heading: 'Outlined Card',
    'default-slot': `
      <p>This card uses the outlined variant, which typically shows a border instead of a shadow.</p>
    `,
  },
}

export const Subtle: Story = {
  args: {
    variant: 'subtle',
    interactive: false,
    heading: 'Subtle Card',
    'default-slot': `
      <p>This card uses the subtle variant for a more understated appearance.</p>
    `,
  },
}

export const Interactive: Story = {
  args: {
    variant: 'elevated',
    interactive: true,
    heading: 'Interactive Card',
    'default-slot': `
      <p>This card is interactive and can be clicked. It will emit a vg-action event when activated.</p>
      <p>Try clicking or pressing Enter/Space when focused.</p>
    `,
  },
}

export const WithHeaderSlot: Story = {
  args: {
    variant: 'elevated',
    interactive: false,
    'header-slot': `
      <div style="display: flex; align-items: center; gap: 8px; padding: 16px; border-bottom: 1px solid #e0e0e0;">
        <img src="https://via.placeholder.com/40" alt="Avatar" style="border-radius: 50%;" />
        <div>
          <h4 style="margin: 0; font-size: 14px;">John Doe</h4>
          <p style="margin: 0; font-size: 12px; color: #666;">2 hours ago</p>
        </div>
      </div>
    `,
    'default-slot': `
      <p>This card demonstrates using the header slot for custom content like user information.</p>
    `,
  },
}

export const WithFooterSlot: Story = {
  args: {
    variant: 'elevated',
    interactive: false,
    heading: 'Card with Actions',
    'default-slot': `
      <p>This card has action buttons in the footer slot.</p>
    `,
    'footer-slot': `
      <div style="display: flex; gap: 8px; padding: 16px; justify-content: flex-end; border-top: 1px solid #e0e0e0;">
        <button style="padding: 8px 16px; border: 1px solid #ccc; background: white; border-radius: 4px;">Cancel</button>
        <button style="padding: 8px 16px; border: none; background: #007bff; color: white; border-radius: 4px;">Save</button>
      </div>
    `,
  },
}

export const FullyCustomized: Story = {
  args: {
    variant: 'outlined',
    interactive: true,
    'header-slot': `
      <div style="padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
        <h3 style="margin: 0;">Featured Product</h3>
      </div>
    `,
    'default-slot': `
      <div style="padding: 16px;">
        <img src="https://via.placeholder.com/200x120" alt="Product" style="width: 100%; border-radius: 4px; margin-bottom: 12px;" />
        <h4 style="margin: 0 0 8px 0;">Amazing Product</h4>
        <p style="margin: 0; color: #666;">This is a featured product with custom header and footer styling.</p>
        <div style="margin-top: 12px; font-size: 18px; font-weight: bold; color: #007bff;">$99.99</div>
      </div>
    `,
    'footer-slot': `
      <div style="padding: 16px; background: #f8f9fa; display: flex; justify-content: space-between; align-items: center;">
        <span style="color: #28a745; font-size: 14px;">✓ In Stock</span>
        <button style="padding: 8px 16px; border: none; background: #007bff; color: white; border-radius: 4px;">Add to Cart</button>
      </div>
    `,
  },
}