# Framework Syntax Comparison

Quick reference guide for how Web Component syntax translates across frameworks.

## Component Usage

| Feature | HTML | React | Vue | Angular | Lit |
|---------|------|-------|-----|---------|-----|
| **Import** | `<script src="...">` | `import { VgButton } from 'vg/react'` | `import 'vg/vue'` | `import 'vg'` | `import '../src'` |
| **Component** | `<vg-button>` | `<VgButton>` | `<vg-button>` | `<vg-button>` | `<vg-button>` |
| **String Prop** | `variant="primary"` | `variant="primary"` | `variant="primary"` | `variant="primary"` | `variant="primary"` |
| **Dynamic Prop** | N/A | `variant={value}` | `:variant="value"` | `[variant]="value"` | `.variant=${value}` |
| **Boolean (true)** | `disabled` | `disabled` | `disabled` | `[disabled]="true"` | `?disabled=${true}` |
| **Boolean (false)** | (omit) | (omit) | (omit) | `[disabled]="false"` | `?disabled=${false}` |
| **Event Handler** | `addEventListener` | `onVgClick={fn}` | `@vg-click="fn"` | `(vg-click)="fn($event)"` | `@vg-click=${fn}` |
| **Children** | Text/HTML | JSX | Template | Template | `` html`...` `` |
| **Slots** | `<div slot="name">` | Same | Same | Same | Same |

## Event Handling

### HTML
```html
<vg-button id="btn">Click</vg-button>

<script>
  const btn = document.getElementById('btn');
  btn.addEventListener('vg-click', (event) => {
    console.log(event.detail);
  });
</script>
```

### React
```jsx
import { VgButton } from 'vg/react';

<VgButton onVgClick={(event) => {
  console.log(event.detail);
}}>
  Click
</VgButton>
```

### Vue
```vue
<script setup>
import 'vg/vue';

const handleClick = (event) => {
  console.log(event.detail);
};
</script>

<template>
  <vg-button @vg-click="handleClick">
    Click
  </vg-button>
</template>
```

### Angular
```typescript
// component.ts
@Component({
  selector: 'app-demo',
  template: `
    <vg-button (vg-click)="handleClick($event)">
      Click
    </vg-button>
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DemoComponent {
  handleClick(event: Event) {
    console.log((event as CustomEvent).detail);
  }
}
```

### Lit
```typescript
import { LitElement, html } from 'lit';

@customElement('my-demo')
export class MyDemo extends LitElement {
  render() {
    return html`
      <vg-button @vg-click=${this.handleClick}>
        Click
      </vg-button>
    `;
  }
  
  handleClick(e: CustomEvent) {
    console.log(e.detail);
  }
}
```

## Props/Attributes

### String Values

| Framework | Syntax | Example |
|-----------|--------|---------|
| HTML | `attr="value"` | `variant="primary"` |
| React | `prop="value"` | `variant="primary"` |
| Vue | `attr="value"` | `variant="primary"` |
| Angular | `attr="value"` | `variant="primary"` |
| Lit | `attr="value"` | `variant="primary"` |

### Dynamic Values

| Framework | Syntax | Example |
|-----------|--------|---------|
| HTML | setAttribute | `elem.setAttribute('variant', val)` |
| React | `prop={value}` | `variant={myVar}` |
| Vue | `:attr="value"` | `:variant="myVar"` |
| Angular | `[attr]="value"` | `[variant]="myVar"` |
| Lit | `.attr=${value}` | `.variant=${myVar}` |

### Boolean Values

| Framework | True | False |
|-----------|------|-------|
| HTML | `disabled` | (omit) |
| React | `disabled` or `disabled={true}` | (omit) or `disabled={false}` |
| Vue | `disabled` | (omit) or `:disabled="false"` |
| Angular | `[disabled]="true"` | `[disabled]="false"` |
| Lit | `?disabled=${true}` | `?disabled=${false}` |

### Object/Array Props

| Framework | Syntax | Example |
|-----------|--------|---------|
| HTML | JSON string or `.property` | `elem.options = [...]` |
| React | Prop expression | `options={[...]}` |
| Vue | `:prop="value"` | `:options="myArray"` |
| Angular | `[prop]="value"` | `[options]="myArray"` |
| Lit | `.prop=${value}` | `.options=${myArray}` |

## Complete Examples

### Button with All Features

#### HTML
```html
<vg-button 
  id="myBtn"
  variant="primary" 
  size="lg"
  disabled
>
  <svg slot="prefix">...</svg>
  Click Me
</vg-button>

<script>
  const btn = document.getElementById('myBtn');
  btn.addEventListener('vg-click', (e) => {
    console.log('Clicked!', e.detail);
  });
  
  // Change props dynamically
  btn.variant = 'secondary';
  btn.disabled = false;
</script>
```

#### React
```jsx
import { VgButton } from 'vg/react';
import { useState } from 'react';

function MyComponent() {
  const [variant, setVariant] = useState('primary');
  
  return (
    <VgButton
      variant={variant}
      size="lg"
      disabled
      onVgClick={(e) => {
        console.log('Clicked!', e.detail);
      }}
    >
      <svg slot="prefix">...</svg>
      Click Me
    </VgButton>
  );
}
```

#### Vue
```vue
<script setup>
import 'vg/vue';
import { ref } from 'vue';

const variant = ref('primary');

const handleClick = (e) => {
  console.log('Clicked!', e.detail);
};
</script>

<template>
  <vg-button
    :variant="variant"
    size="lg"
    disabled
    @vg-click="handleClick"
  >
    <svg slot="prefix">...</svg>
    Click Me
  </vg-button>
</template>
```

#### Angular
```typescript
// component.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DemoComponent {
  variant = 'primary';
  
  handleClick(event: Event) {
    console.log('Clicked!', (event as CustomEvent).detail);
  }
}
```
```html
<!-- demo.component.html -->
<vg-button
  [variant]="variant"
  size="lg"
  [disabled]="true"
  (vg-click)="handleClick($event)"
>
  <svg slot="prefix">...</svg>
  Click Me
</vg-button>
```

#### Lit
```typescript
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('my-demo')
export class MyDemo extends LitElement {
  @state()
  variant = 'primary';
  
  render() {
    return html`
      <vg-button
        .variant=${this.variant}
        size="lg"
        ?disabled=${true}
        @vg-click=${this.handleClick}
      >
        <svg slot="prefix">...</svg>
        Click Me
      </vg-button>
    `;
  }
  
  handleClick(e: CustomEvent) {
    console.log('Clicked!', e.detail);
  }
}
```

## Event Naming Conventions

| Web Component Event | HTML | React | Vue | Angular | Lit |
|---------------------|------|-------|-----|---------|-----|
| `vg-click` | `'vg-click'` | `onVgClick` | `@vg-click` | `(vg-click)` | `@vg-click` |
| `vg-change` | `'vg-change'` | `onVgChange` | `@vg-change` | `(vg-change)` | `@vg-change` |
| `vg-input` | `'vg-input'` | `onVgInput` | `@vg-input` | `(vg-input)` | `@vg-input` |
| `vg-focus` | `'vg-focus'` | `onVgFocus` | `@vg-focus` | `(vg-focus)` | `@vg-focus` |
| `vg-blur` | `'vg-blur'` | `onVgBlur` | `@vg-blur` | `(vg-blur)` | `@vg-blur` |

## Setup/Installation

### HTML
```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="./node_modules/vg/dist/index.js"></script>
  <link rel="stylesheet" href="./node_modules/vg/dist/index.css" />
</head>
<body>
  <vg-theme-provider mode="dark">
    <!-- Your components -->
  </vg-theme-provider>
</body>
</html>
```

### React
```jsx
// App.js
import { VgThemeProvider, VgButton } from 'vg/react';
import 'vg/index.css';

function App() {
  return (
    <VgThemeProvider mode="dark">
      {/* Your components */}
    </VgThemeProvider>
  );
}
```

### Vue
```vue
<!-- App.vue -->
<script setup>
import 'vg/vue';
import 'vg/index.css';
</script>

<template>
  <vg-theme-provider mode="dark">
    <!-- Your components -->
  </vg-theme-provider>
</template>
```

### Angular
```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import 'vg';
import 'vg/index.css';

bootstrapApplication(AppComponent);
```

### Lit
```typescript
// main.ts
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import 'vg';
import 'vg/index.css';

@customElement('my-app')
export class MyApp extends LitElement {
  render() {
    return html`
      <vg-theme-provider mode="dark">
        <!-- Your components -->
      </vg-theme-provider>
    `;
  }
}
```

## TypeScript Support

### HTML
```typescript
// types can be imported for TypeScript projects
import type { VgButton } from 'vg';

const button = document.querySelector('vg-button') as VgButton;
```

### React
```tsx
import { VgButton } from 'vg/react';
import type { VgButtonProps } from 'vg/react';

const MyButton: React.FC<VgButtonProps> = (props) => {
  return <VgButton {...props} />;
};
```

### Vue
```vue
<script setup lang="ts">
import 'vg/vue';
import type { VgButton } from 'vg';

// Type support through custom elements
</script>
```

### Angular
```typescript
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import type { VgButton } from 'vg';

@Component({
  selector: 'app-demo',
  template: `<vg-button></vg-button>`,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DemoComponent {
  // Types available for reference
}
```

### Lit
```typescript
import { LitElement, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import type { VgButton } from 'vg';

@customElement('my-demo')
export class MyDemo extends LitElement {
  @query('vg-button')
  button!: VgButton;
}
```

## Common Patterns

### Conditional Rendering

| Framework | Pattern |
|-----------|---------|
| HTML | `if (condition) { elem.style.display = 'block' }` |
| React | `{condition && <VgButton />}` |
| Vue | `<vg-button v-if="condition">` |
| Angular | `<vg-button *ngIf="condition">` |
| Lit | `${condition ? html`<vg-button>` : ''}` |

### Lists/Loops

| Framework | Pattern |
|-----------|---------|
| HTML | `items.forEach(item => { ... })` |
| React | `{items.map(item => <VgButton key={item.id} />)}` |
| Vue | `<vg-button v-for="item in items" :key="item.id">` |
| Angular | `<vg-button *ngFor="let item of items">` |
| Lit | `${items.map(item => html`<vg-button>`)}` |

---

This comparison helps you quickly understand how to use VG components in any framework!
