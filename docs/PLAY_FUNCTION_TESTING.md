# Play Function Testing for Cross-Framework Web Components

## Overview

**Yes, it is absolutely possible to implement Storybook Play Functions to test web component implementation across all supported frameworks!**

This guide explains how and why Play Functions work universally for web components, regardless of whether they're used in React, Vue, Angular, HTML, or Lit.

## Table of Contents

- [Why This Works](#why-this-works)
- [Key Concepts](#key-concepts)
- [Implementation Guide](#implementation-guide)
- [Testing Strategies](#testing-strategies)
- [Running Tests](#running-tests)
- [Best Practices](#best-practices)
- [Examples](#examples)

---

## Why This Works

### The Magic of Web Components

Web Components are **framework-agnostic** by design. Here's why one Play Function test works for all frameworks:

```
┌─────────────────────────────────────────────────────────┐
│                   Framework Layer                       │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┐  │
│  │  HTML   │  React  │   Vue   │ Angular │   Lit   │  │
│  └────┬────┴────┬────┴────┬────┴────┬────┴────┬────┘  │
│       │         │         │         │         │        │
└───────┼─────────┼─────────┼─────────┼─────────┼────────┘
        │         │         │         │         │
        ▼         ▼         ▼         ▼         ▼
┌─────────────────────────────────────────────────────────┐
│              Same Web Component Output                  │
│  ┌───────────────────────────────────────────────────┐ │
│  │        <vg-button variant="primary">              │ │
│  │          #shadow-root                              │ │
│  │            <button class="btn-primary">            │ │
│  │              <slot name="prefix"></slot>           │ │
│  │              <slot></slot>                         │ │
│  │              <slot name="suffix"></slot>           │ │
│  │            </button>                               │ │
│  │        </vg-button>                                │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
        │         │         │         │         │
        ▼         ▼         ▼         ▼         ▼
┌─────────────────────────────────────────────────────────┐
│            Same DOM Testing Queries Work                │
│  • canvas.getByRole('button')                          │
│  • canvas.getByTestId('my-button')                     │
│  • userEvent.click(button)                             │
│  • expect(button).toBeVisible()                        │
└─────────────────────────────────────────────────────────┘
```

### Framework Wrappers Don't Change Behavior

Your framework wrappers (React, Vue, Angular) are **thin layers** that:
- Convert props to attributes
- Map framework events to native events
- Register the custom element

But they **don't change** the component's:
- Rendered output
- Shadow DOM structure
- Event behavior
- Accessibility features

## Key Concepts

### 1. **One Component, One Test Suite**

```typescript
// ✅ This test works for ALL frameworks
export const ClickTest: Story = {
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button')
    await userEvent.click(button)
    await expect(button).toBeInTheDocument()
  }
}
```

Whether this story is viewed with:
- HTML: `<vg-button onclick="handler">Click</vg-button>`
- React: `<VgButton onVgClick={handler}>Click</VgButton>`
- Vue: `<vg-button @vg-click="handler">Click</vg-button>`
- Angular: `<vg-button (vg-click)="handler()">Click</vg-button>`

**The Play Function test is identical** because the rendered web component is identical!

### 2. **Testing the Contract, Not the Wrapper**

```typescript
// You're testing THIS (web component behavior):
✅ Does the button render?
✅ Is it accessible?
✅ Does it fire custom events?
✅ Does disabled state work?
✅ Are slots rendered correctly?

// NOT testing THIS (framework integration):
❌ Does React prop mapping work?
❌ Does Vue directive syntax work?
❌ Does Angular binding work?
```

The framework integration is handled by your generated wrappers and validated by your demo projects.

### 3. **Shadow DOM is Framework-Agnostic**

```typescript
// All frameworks produce the same shadow DOM:
const button = document.querySelector('vg-button')
const shadowButton = button.shadowRoot.querySelector('button')

// This works regardless of framework wrapper!
await expect(shadowButton).toHaveClass('btn-primary')
```

## Implementation Guide

### Step 1: Install Dependencies

Your project already has `@storybook/test` installed! Verify:

```bash
npm list @storybook/test
```

If not installed:

```bash
npm install --save-dev @storybook/test
```

### Step 2: Import Test Utilities

```typescript
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
```

### Step 3: Add Play Functions to Stories

```typescript
export const MyStory: Story = {
  args: {
    variant: 'primary',
  },
  render: (args) => html`
    <vg-button 
      variant=${args.variant}
      data-testid="test-button"
    >
      Click Me
    </vg-button>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('Button renders', async () => {
      const button = canvas.getByTestId('test-button')
      await expect(button).toBeInTheDocument()
    })
    
    await step('Button is clickable', async () => {
      const button = canvas.getByTestId('test-button')
      await userEvent.click(button)
    })
  }
}
```

### Step 4: Run Tests

```bash
# Run in watch mode
npm run test-storybook:watch

# Run once (CI)
npm run test-storybook
```

## Testing Strategies

### 1. **Interaction Testing**

Test user interactions that work the same everywhere:

```typescript
export const ClickInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    
    // Click interaction
    await userEvent.click(button)
    
    // Verify custom event fired (check side effects)
    await waitFor(() => {
      expect(button).toBeInTheDocument()
    })
  }
}
```

### 2. **Accessibility Testing**

Validate ARIA and keyboard behavior:

```typescript
export const AccessibilityTest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    // Check role
    const button = canvas.getByRole('button')
    await expect(button).toBeVisible()
    
    // Test keyboard interaction
    await userEvent.tab()
    expect(document.activeElement).toBe(button)
    
    await userEvent.keyboard('{Enter}')
    // Verify button activated
  }
}
```

### 3. **State Testing**

Test different component states:

```typescript
export const StateTests: Story = {
  render: () => html`
    <vg-button data-testid="normal">Normal</vg-button>
    <vg-button disabled data-testid="disabled">Disabled</vg-button>
    <vg-button loading data-testid="loading">Loading</vg-button>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    // Normal button is clickable
    await expect(canvas.getByTestId('normal')).not.toHaveAttribute('disabled')
    
    // Disabled button is not clickable
    await expect(canvas.getByTestId('disabled')).toHaveAttribute('disabled')
    
    // Loading button shows loading state
    await expect(canvas.getByTestId('loading')).toHaveAttribute('loading')
  }
}
```

### 4. **Slot Content Testing**

Validate that slots work correctly:

```typescript
export const SlotTest: Story = {
  render: () => html`
    <vg-button data-testid="with-icon">
      <svg slot="prefix">...</svg>
      Button Text
    </vg-button>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByTestId('with-icon')
    
    // Verify slot is rendered
    const prefixSlot = button.shadowRoot?.querySelector('slot[name="prefix"]')
    expect(prefixSlot).toBeTruthy()
    
    // Verify slotted content exists
    const svg = button.querySelector('[slot="prefix"]')
    expect(svg).toBeTruthy()
  }
}
```

### 5. **Form Integration Testing**

Test components in form contexts:

```typescript
export const FormTest: Story = {
  render: () => html`
    <form data-testid="test-form">
      <vg-input 
        label="Email" 
        type="email"
        data-testid="email-input"
      ></vg-input>
      <vg-button type="submit" data-testid="submit">Submit</vg-button>
    </form>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    // Fill input
    const input = canvas.getByTestId('email-input')
    await userEvent.type(input, 'test@example.com')
    
    // Submit form
    const submitButton = canvas.getByTestId('submit')
    await userEvent.click(submitButton)
    
    // Verify form submission
  }
}
```

## Running Tests

### Interactive Mode (Development)

```bash
npm run storybook
```

Then open the **Interactions** panel in Storybook to see tests running live.

### Automated Tests (CI/CD)

```bash
# Run all story tests
npm run test-storybook

# Run specific story
npm run test-storybook -- --url http://localhost:6006 --stories-json stories.json
```

### With Test Runner Config

You already have `test-runner.ts` set up! Your tests will:
1. Run Storybook test-runner
2. Execute Play Functions
3. Run Lighthouse audits (optional)

```bash
# Build storybook first
npm run build-storybook

# Run tests against built storybook
npm run test-storybook
```

## Best Practices

### ✅ DO:

1. **Test component behavior, not framework syntax**
   ```typescript
   // ✅ Good - Tests actual behavior
   await expect(button).toHaveAttribute('variant', 'primary')
   
   // ❌ Bad - Tests framework wrapper
   await expect(button).toHaveProperty('onVgClick')
   ```

2. **Use data-testid for stable selectors**
   ```typescript
   render: () => html`<vg-button data-testid="my-button">Click</vg-button>`
   play: async ({ canvas }) => {
     const button = canvas.getByTestId('my-button')
   }
   ```

3. **Test accessibility**
   ```typescript
   // Query by role (best for accessibility)
   const button = canvas.getByRole('button', { name: 'Submit' })
   ```

4. **Use step() for clear test structure**
   ```typescript
   play: async ({ canvasElement, step }) => {
     await step('Setup', async () => { /* ... */ })
     await step('Interaction', async () => { /* ... */ })
     await step('Assertion', async () => { /* ... */ })
   }
   ```

5. **Test custom events via side effects**
   ```typescript
   // Instead of mocking event listeners directly,
   // test that the event causes expected side effects
   await userEvent.click(button)
   await waitFor(() => {
     expect(canvas.getByText('Clicked!')).toBeInTheDocument()
   })
   ```

### ❌ DON'T:

1. **Don't test framework-specific syntax**
   ```typescript
   // ❌ Bad - Only works in React
   expect(button.props.onVgClick).toBeDefined()
   ```

2. **Don't rely on framework lifecycle**
   ```typescript
   // ❌ Bad - Framework-dependent
   await waitFor(() => component.$nextTick())
   ```

3. **Don't test wrapper implementation**
   ```typescript
   // ❌ Bad - Tests React wrapper
   expect(VgButton).toHaveBeenCalledWith(props)
   ```

## Examples

### Example 1: Complete Button Test Suite

See `stories/Button.interaction.test.stories.ts` for a comprehensive example covering:
- Click interactions
- Disabled state
- Loading state
- All variants
- All sizes
- Slot content
- Keyboard accessibility
- Rapid clicks
- Framework-agnostic behavior

### Example 2: Input Component Testing

```typescript
export const InputTest: Story = {
  render: () => html`
    <vg-input 
      label="Username"
      placeholder="Enter username"
      data-testid="username-input"
    ></vg-input>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('Input renders with label', async () => {
      const input = canvas.getByLabelText('Username')
      await expect(input).toBeInTheDocument()
    })
    
    await step('User can type in input', async () => {
      const input = canvas.getByTestId('username-input')
      await userEvent.type(input, 'john_doe')
      await expect(input).toHaveValue('john_doe')
    })
    
    await step('Input fires change events', async () => {
      const input = canvas.getByTestId('username-input')
      await userEvent.clear(input)
      await userEvent.type(input, 'new_value')
      
      // Custom event should have fired
      await expect(input.value).toBe('new_value')
    })
  }
}
```

### Example 3: Dropdown Component Testing

```typescript
export const DropdownTest: Story = {
  args: {
    options: [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
      { value: '3', label: 'Option 3' },
    ],
  },
  render: (args) => html`
    <vg-dropdown 
      .options=${args.options}
      data-testid="test-dropdown"
    ></vg-dropdown>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    
    await step('Dropdown opens on click', async () => {
      const dropdown = canvas.getByTestId('test-dropdown')
      await userEvent.click(dropdown)
      
      // Options should be visible
      await waitFor(() => {
        expect(canvas.getByText('Option 1')).toBeVisible()
      })
    })
    
    await step('User can select option', async () => {
      const option2 = canvas.getByText('Option 2')
      await userEvent.click(option2)
      
      // Selection should be reflected
      await waitFor(() => {
        expect(canvas.getByText('Option 2')).toBeInTheDocument()
      })
    })
  }
}
```

## Integration with Your Project

### Current Setup

Your project already has:
- ✅ `@storybook/test-runner` installed
- ✅ `test-runner.ts` configured with Lighthouse
- ✅ Scripts: `test-storybook` and `test-storybook:watch`

### Adding Play Functions

1. **Add to existing stories** (like we did with `Button.stories.ts`)
2. **Create dedicated test story files** (like `Button.interaction.test.stories.ts`)
3. **Tag test stories** with `tags: ['test']` to separate them

### Running Alongside Lighthouse

Your `test-runner.ts` already runs Lighthouse audits. Play Functions add:
- **Functional testing** - Does it work?
- **Interaction testing** - Can users interact?
- **Accessibility testing** - Is it usable?

While Lighthouse provides:
- **Performance metrics**
- **Best practices**
- **SEO checks**

They complement each other perfectly!

## FAQ

### Q: Do I need separate tests for each framework?

**A: No!** One Play Function test validates all frameworks because web components render the same shadow DOM regardless of wrapper.

### Q: Can I test framework-specific features?

**A: Not with Play Functions.** Use your demo projects for framework-specific integration testing. Play Functions test the web component itself.

### Q: How do I test custom events?

**A: Test side effects.** Instead of mocking event listeners, test that the event causes expected changes:

```typescript
// Test the effect of the event, not the event itself
await userEvent.click(button)
await waitFor(() => {
  expect(canvas.getByText('Event fired!')).toBeInTheDocument()
})
```

### Q: Can I test shadow DOM internals?

**A: Yes, but carefully:**

```typescript
const button = canvas.getByTestId('my-button')
const shadowButton = button.shadowRoot?.querySelector('button')
expect(shadowButton).toHaveClass('btn-primary')
```

### Q: Should I test in all frameworks manually?

**A: No need!** Play Functions validate universal behavior. Use:
- **Play Functions** - Universal component behavior
- **Demo Projects** - Framework-specific integration
- **Lighthouse** - Performance and best practices

### Q: How do I debug failing tests?

1. Run Storybook in dev mode: `npm run storybook`
2. Open the story with failing test
3. Open **Interactions** panel
4. Watch test execute step-by-step
5. Use browser DevTools to inspect

## Conclusion

Play Functions are **perfect** for your cross-framework web component library because:

✅ **One Test Suite** - Write once, validates all frameworks
✅ **Framework-Agnostic** - Tests actual web component behavior
✅ **Real User Interactions** - Simulates clicks, typing, keyboard nav
✅ **Accessibility First** - Tests ARIA roles, keyboard support
✅ **Visual Debugging** - See tests run live in Storybook
✅ **CI/CD Ready** - Automated testing with test-runner
✅ **Complements Demos** - Tests complement your framework demos
✅ **Lighthouse Integration** - Works alongside your existing Lighthouse setup

Your web components are truly **write once, use anywhere** - and now they're **test once, validate everywhere** too!

---

## Related Documentation

- [Storybook Interaction Testing](https://storybook.js.org/docs/writing-tests/interaction-testing)
- [Framework Switcher](./FRAMEWORK_SWITCHER.md)
- [Lighthouse Integration](./LIGHTHOUSE.md)
- [Component Architecture](../.github/instructions/copilot-instructions.md)

## Need Help?

Check out the comprehensive examples in:
- `stories/Button.interaction.test.stories.ts`
- `stories/Button.stories.ts` (updated with Play Functions)

Run them with:
```bash
npm run storybook
# Then check the Interactions panel!
```
