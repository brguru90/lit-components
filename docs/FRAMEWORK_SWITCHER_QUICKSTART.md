# Framework Switcher - Quick Start Guide

## What is it?

The Framework Switcher is a toolbar feature in Storybook that automatically shows your web component code examples in different framework syntaxes (HTML, React, Vue, Angular, Lit).

## How to Use

### Step 1: Start Storybook

```bash
npm run storybook
```

### Step 2: Navigate to a Component

Click on any component story in the sidebar, for example:
- Components → Button → Primary
- Components → Card → Default
- Components → Input → Default

### Step 3: Switch to the "Docs" Tab

At the top of the right panel, click the **"Docs"** tab (next to "Canvas").

### Step 4: Select Your Framework

In the top toolbar, you'll see a dropdown that says **"Framework"** with an icon:

```
🔧 Framework: [HTML ▾]
```

Click it and select your preferred framework:
- **HTML** - Vanilla JavaScript with Web Components
- **React** - JSX with React wrappers  
- **Vue** - Vue 3 SFC with Composition API
- **Angular** - Angular standalone components
- **Lit** - LitElement with decorators

### Step 5: View & Copy Code

Scroll down to any story example in the Docs tab. The code block will now show syntax for your selected framework!

**Example - Button Story:**

When **React** is selected:
```jsx
import { VgButton } from 'vg/react'

function MyComponent() {
  return (
    <VgButton variant="primary">
      Click me
    </VgButton>
  );
}
```

When **Vue** is selected:
```vue
<template>
  <vg-button variant="primary">
    Click me
  </vg-button>
</template>

<script setup>
import 'vg/vue'
</script>
```

## Tips

### 💡 Persist Your Selection
The framework selection persists across different stories, so you don't need to change it every time!

### 💡 Compare Frameworks
Open multiple browser tabs to compare code side-by-side in different frameworks.

### 💡 Copy-Paste Ready
All generated code is ready to copy and paste into your project!

### 💡 Combine with Theme Switcher
You can also use the **Theme** dropdown to see how components look with different themes while viewing framework-specific code.

## Common Patterns

### Event Handlers

The code automatically transforms event handlers for each framework:

**HTML:**
```javascript
element.addEventListener('vg-click', (event) => {
  console.log(event.detail);
});
```

**React:**
```jsx
<VgButton onVgClick={(event) => console.log(event.detail)} />
```

**Vue:**
```vue
<vg-button @vg-click="handleClick" />
```

**Angular:**
```html
<vg-button (vg-click)="handleClick($event)" />
```

### Props/Attributes

Props are transformed appropriately:

**HTML:**
```html
<vg-button variant="primary" disabled>Button</vg-button>
```

**React:**
```jsx
<VgButton variant="primary" disabled>Button</VgButton>
```

**Vue:**
```vue
<vg-button variant="primary" :disabled="true">Button</vg-button>
```

## Troubleshooting

### Code not updating when I switch frameworks?
- Make sure you're on the **Docs** tab (not Canvas)
- Try refreshing the page
- Check browser console for errors

### Can I see live running examples?
The Framework Switcher shows **code snippets only**. For full running examples:
- Use the **Canvas** tab in Storybook
- Check the `demo/` folder for complete framework projects

### Can I customize the generated code?
Yes! See [FRAMEWORK_SWITCHER.md](./FRAMEWORK_SWITCHER.md#customization) for details on customizing transformations.

## What's Next?

- Read the full [Framework Switcher Documentation](./FRAMEWORK_SWITCHER.md)
- Explore the [demo projects](../demo/) for complete working examples
- Check out the [Component API documentation](../README.md#components)

---

**Happy coding! 🚀**
