# Framework Switcher for Storybook

## Overview

The Framework Switcher is a custom Storybook feature that allows users to view code examples for web components in multiple framework syntaxes. This demonstrates the true power of Web Components - **write once, use anywhere**.

## Features

- 🎯 **Single Source of Truth**: Define your stories once in Lit/Web Components
- 🔄 **Automatic Transformation**: Code examples automatically transform based on framework selection
- 🎨 **Toolbar Integration**: Framework selector in Storybook toolbar (similar to theme switcher)
- 📚 **Multi-Framework Support**: 
  - Vanilla HTML/JavaScript
  - React (with React wrappers)
  - Vue 3 (Composition API)
  - Angular (Standalone Components)
  - Lit Element

## How It Works

### 1. Framework Selector Toolbar

Located in the Storybook toolbar (top bar), users can select their preferred framework:

```
🔧 Framework: [HTML ▾] [React] [Vue] [Angular] [Lit]
```

### 2. Automatic Code Transformation

When you select a framework, the code snippets in the Docs tab automatically transform to show:

- **HTML**: Vanilla Web Components with event listeners
- **React**: JSX with React wrapper components
- **Vue**: SFC (Single File Component) with Composition API
- **Angular**: Component class with template
- **Lit**: LitElement with decorators

### 3. Story Definition

You define your stories once using standard Storybook format:

```typescript
export const Primary: Story = {
  args: {
    variant: 'primary',
    disabled: false,
    onClick: () => console.log('clicked')
  },
  render: (args) => ExampleComponent(args, html`Primary Button`),
}
```

### 4. Framework-Specific Output Examples

#### HTML Output
```html
<vg-button
  variant="primary"
  @vg-click="${handleClick}">
  Primary Button
</vg-button>

<script>
  const element = document.querySelector('vg-button');
  element.addEventListener('vg-click', (event) => {
    console.log('vg-click', event.detail);
  });
</script>
```

#### React Output
```jsx
import { VgButton } from 'vg/react'
import 'vg'

function MyComponent() {
  const handleEvent = (event) => {
    console.log('vg-click', event.detail);
  };

  return (
    <VgButton
      variant="primary"
      onVgClick={handleEvent}>
      Primary Button
    </VgButton>
  );
}
```

#### Vue Output
```vue
<script setup>
import 'vg/vue'
import { ref } from 'vue'

const handleEvent = (event) => {
  console.log(event.type, event.detail);
}
</script>

<template>
  <vg-button
    variant="primary"
    @vg-click="handleEvent">
    Primary Button
  </vg-button>
</template>
```

#### Angular Output
```typescript
// component.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-demo',
  standalone: true,
  templateUrl: './demo.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DemoComponent {
  public variant = 'primary';

  onEvent(event: Event) {
    console.log((event as CustomEvent).detail);
  }
}

// demo.component.html
<vg-button
  [variant]="variant"
  (vg-click)="onEvent($event)">
  Primary Button
</vg-button>
```

#### Lit Output
```typescript
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('my-demo')
export class MyDemo extends LitElement {
  handleEvent(e: CustomEvent) {
    console.log(e.type, e.detail);
  }

  render() {
    return html`
      <vg-button
        variant="primary"
        @vg-click=${this.handleEvent}>
        Primary Button
      </vg-button>
    `;
  }
}
```

## Implementation Details

### Architecture

```
┌─────────────────────────────────────────────────┐
│  Storybook Toolbar                              │
│  [Theme: Dark ▾] [Framework: React ▾]           │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Global Context (context.globals.framework)     │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  preview.tsx - docs.source.transform()          │
│  Intercepts code generation                      │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  framework-transformer.ts                        │
│  • Analyzes story context                       │
│  • Extracts component name, props, events       │
│  • Applies framework-specific transformation    │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Docs Tab - Shows transformed code              │
└─────────────────────────────────────────────────┘
```

### Key Files

1. **`.storybook/framework-transformer.ts`**
   - Core transformation logic
   - Framework-specific transformers
   - Handles attributes, events, slots, children

2. **`.storybook/decorators.ts`**
   - Defines `framework` global type
   - Adds framework selector to toolbar
   - Icon mapping for each framework

3. **`.storybook/preview.tsx`**
   - Integrates framework transformer
   - Reads selected framework from globals
   - Applies transformation in `docs.source.transform()`

## Customization

### Adding a New Framework

To add support for a new framework (e.g., Svelte):

1. **Add Framework Type** (`framework-transformer.ts`):
```typescript
export type FrameworkType = 'html' | 'react' | 'vue' | 'angular' | 'lit' | 'svelte'
```

2. **Create Transformer Function**:
```typescript
function transformToSvelte({ componentName, attrs, children }: TransformOptions): string {
  // Your transformation logic
  return `<script>
  // Svelte component code
</script>

<vg-button {variant}>
  {children}
</vg-button>`
}
```

3. **Add to Switch Statement**:
```typescript
switch (framework) {
  case 'svelte':
    return transformToSvelte(options)
  // ... other cases
}
```

4. **Add Toolbar Item** (`.storybook/decorators.ts`):
```typescript
framework: {
  // ...
  toolbar: {
    items: [
      // ... existing items
      { value: 'svelte', title: 'Svelte', icon: 'circle' },
    ],
  },
}
```

### Customizing Transformations

You can customize how code is generated for each framework by modifying the transformer functions in `framework-transformer.ts`.

**Example: Custom event handler names**

```typescript
function transformToReact({ componentName, attrs, children }: TransformOptions): string {
  // Custom logic for event naming
  for (const [key, value] of Object.entries(attrs)) {
    if (key.startsWith('on')) {
      // Convert onVgClick -> onButtonClick
      const customName = key.replace('Vg', 'Button')
      // ... transformation logic
    }
  }
}
```

## Benefits

### For Component Library Authors

✅ **Write Once**: Create stories once, documentation for all frameworks
✅ **Maintenance**: Single source of truth reduces maintenance burden
✅ **Consistency**: Ensures consistent examples across frameworks
✅ **Showcase**: Demonstrates framework-agnostic nature of Web Components

### For Users/Developers

✅ **Familiar Syntax**: See examples in their preferred framework
✅ **Easy Integration**: Copy-paste ready code snippets
✅ **Learning Tool**: Understand how to use Web Components in different contexts
✅ **Quick Onboarding**: Reduces friction when adopting your components

## Usage in Stories

### Basic Usage

No changes needed! Your existing stories will automatically work:

```typescript
export const Default: Story = {
  args: {
    variant: 'primary',
    size: 'md'
  }
}
```

### With Custom Properties

```typescript
export const WithIcon: Story = {
  args: {
    variant: 'secondary',
    disabled: false,
    onClick: (e) => console.log(e)
  },
  render: (args) => html`
    <vg-button ...${args}>
      <svg slot="prefix">...</svg>
      Click me
    </vg-button>
  `
}
```

### Override Framework Transform

If you need custom transformation for specific stories:

```typescript
export const CustomTransform: Story = {
  parameters: {
    docs: {
      source: {
        transformOverride: true,
        transform: (code: string, context: StoryContext) => {
          // Custom transformation logic
          return '// Custom code here'
        }
      }
    }
  }
}
```

## Comparison with Demo Projects

### Before (Separate Demo Projects)

```
demo/
├── html-demo/        # Separate HTML project
├── react-demo/       # Separate React project  
├── vue-demo/         # Separate Vue project
└── angular-demo/     # Separate Angular project

❌ Maintenance overhead
❌ Code duplication
❌ Can get out of sync
✅ Full working examples
```

### After (Storybook Framework Switcher)

```
stories/
├── Button.stories.ts    # Single story file
├── Card.stories.ts      # Auto-generates for all frameworks
└── Input.stories.ts

✅ Single source of truth
✅ Always in sync
✅ Automatic updates
⚠️  Code snippets only (not full apps)
```

### Hybrid Approach (Recommended)

Keep both:
- **Storybook Framework Switcher**: For documentation and quick reference
- **Demo Projects**: For complete integration examples and testing

## Known Limitations

1. **Code Snippets Only**: Generates code examples, not full working applications
2. **Simple Transformations**: May not handle complex nested structures perfectly
3. **Manual Slot Handling**: Slots with complex content need manual intervention
4. **Event Handler Logic**: Only shows handler signatures, not full implementation

## Future Enhancements

Possible improvements:

- [ ] Add TypeScript types for each framework
- [ ] Support for more frameworks (Svelte, Solid, Qwik)
- [ ] Better slot/children handling
- [ ] Live editable code examples
- [ ] "Open in CodeSandbox" button
- [ ] Framework-specific best practices in tooltips
- [ ] Copy to clipboard with framework context

## Troubleshooting

### Code not transforming?

1. Check that framework is selected in toolbar
2. Verify `context.globals.framework` is set
3. Check browser console for transformation errors

### Missing props in output?

Ensure props are defined in story `args`:
```typescript
export const MyStory: Story = {
  args: {
    myProp: 'value'  // ← Must be in args
  }
}
```

### Events not showing?

Event handlers must follow naming convention:
```typescript
args: {
  onVgClick: () => {},  // ✅ Correct
  onClick: () => {},    // ❌ Won't be detected as custom event
}
```

## Related Documentation

- [Theme Switcher](../README.md#theme-support)
- [Creating Stories](https://storybook.js.org/docs/web-components/writing-stories/introduction)
- [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [Demo Projects](../../demo/README.md)

## Contributing

To improve the framework transformations:

1. Edit `.storybook/framework-transformer.ts`
2. Test with various component props and events
3. Update documentation with examples
4. Submit PR with test cases

---

**Note**: This feature complements but doesn't replace the demo projects. Use demo projects for full integration examples and the framework switcher for quick documentation reference.
