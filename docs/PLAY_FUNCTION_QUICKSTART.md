# Play Function Testing - Quick Start

## TL;DR

**YES!** You can use Storybook Play Functions to test your web components across ALL frameworks (React, Vue, Angular, HTML, Lit) with a single test suite.

## Why It Works

Web components render the **same shadow DOM** regardless of framework wrapper → **One test validates all frameworks**

## 5-Minute Setup

### 1. Test utilities are already installed ✅

Your project already has `@storybook/test` - you're ready to go!

### 2. Add a Play Function

```typescript
import { expect, userEvent, within } from 'storybook/test'

export const ClickTest: Story = {
  render: () => html`
    <vg-button data-testid="my-button">Click Me</vg-button>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByTestId('my-button')
    
    // Test interaction
    await userEvent.click(button)
    await expect(button).toBeInTheDocument()
  }
}
```

### 3. Run Tests

```bash
# Development (with live preview)
npm run storybook

# Automated (CI/CD)
npm run test-storybook
```

## What You Get

### ✅ Universal Testing
- **One test** validates React, Vue, Angular, HTML, Lit
- Tests actual web component behavior
- Framework wrappers don't affect test results

### ✅ Real User Interactions
- Click, type, keyboard navigation
- Form submission
- Drag and drop

### ✅ Accessibility Testing
- ARIA roles
- Keyboard support
- Screen reader compatibility

### ✅ Visual Debugging
- Watch tests run in Storybook UI
- See each step execute
- Debug failures interactively

## Quick Examples

### Test Button Click
```typescript
play: async ({ canvasElement }) => {
  const button = within(canvasElement).getByRole('button')
  await userEvent.click(button)
  await expect(button).toBeInTheDocument()
}
```

### Test Input Typing
```typescript
play: async ({ canvasElement }) => {
  const input = within(canvasElement).getByLabelText('Email')
  await userEvent.type(input, 'test@example.com')
  await expect(input).toHaveValue('test@example.com')
}
```

### Test Disabled State
```typescript
play: async ({ canvasElement }) => {
  const button = within(canvasElement).getByRole('button')
  await expect(button).toHaveAttribute('disabled')
}
```

### Test Keyboard Navigation
```typescript
play: async ({ canvasElement }) => {
  await userEvent.tab() // Focus first element
  const button = within(canvasElement).getByRole('button')
  expect(document.activeElement).toBe(button)
  
  await userEvent.keyboard('{Enter}') // Activate
}
```

## See It In Action

Check out the comprehensive example:
```bash
# View stories/Button.interaction.test.stories.ts
npm run storybook
# Navigate to: Components/Button/Interaction Tests
```

## Next Steps

1. ✅ **Start with basic interactions** - Click, type, visibility
2. ✅ **Add accessibility tests** - Keyboard nav, ARIA roles
3. ✅ **Test component states** - Disabled, loading, error
4. ✅ **Validate slots** - Prefix/suffix icons, custom content
5. ✅ **Run in CI/CD** - Automated testing pipeline

## Key Insight

Your **Framework Switcher** shows different syntax for each framework, but **Play Functions prove** that the underlying component behavior is identical everywhere!

```
Framework Switcher (Docs)     Play Functions (Tests)
─────────────────────         ──────────────────────
Shows: How to USE             Tests: Does it WORK
In: Each framework            For: All frameworks
Result: Documentation         Result: Validation
```

## Full Documentation

For comprehensive guide, see: [`PLAY_FUNCTION_TESTING.md`](./PLAY_FUNCTION_TESTING.md)

---

**Happy Testing! 🎉**
