"""
Framework-specific project setup instructions for VG UI Library.

This module contains functions to generate framework-specific documentation
and setup instructions for different JavaScript/TypeScript frameworks.
"""

from typing import Optional


def get_project_setup_instructions(framework: Optional[str] = None) -> str:
    """Generate framework-specific project setup instructions based on the framework preference.
    
    Args:
        framework: The framework to generate instructions for. 
                  Supported values: 'html', 'react', 'react19', 'vue', 'angular', 'lit', None
                  If None, returns instructions for all frameworks.
    
    Returns:
        A formatted string containing framework-specific setup instructions including:
        - Installation commands
        - Import statements
        - Configuration setup
        - VS Code integration
        - Code examples
        - Event handling patterns
        - Best practices
    """
    
    if framework == "html":
        return """
### HTML/Vanilla JavaScript Setup

**Installation:**
```bash
# From GitHub repository
npm install https://github.com/brguru90/lit-components.git

# Or add to package.json dependencies:
# "dependencies": {
#   "vg": "github:brguru90/lit-components"
# }
# Then run: npm install
```

**Project Structure:**
```
my-project/
├── node_modules/
├── .vscode/
│   └── settings.json
├── index.html
└── package.json
```

**VS Code IntelliSense Configuration:**

Create `.vscode/settings.json` for component autocomplete:
```json
{
  "html.customData": [
    "./node_modules/vg/dist/vg.html-custom-data.json"
  ]
}
```

**Required Imports:**
- JavaScript: `./node_modules/vg/dist/index.js`
- CSS: `./node_modules/vg/dist/index.css`

**Complete Example:**

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="./node_modules/vg/dist/index.js"></script>
  <link rel="stylesheet" href="./node_modules/vg/dist/index.css" />
  <script>
    window.addEventListener('DOMContentLoaded', () => {
      const button = document.querySelector('vg-button');
      const dropdown = document.querySelector('vg-dropdown');
      
      // Set complex properties via JavaScript
      dropdown.options = [
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '2' }
      ];
      
      button.addEventListener('vg-click', (e) => {
        console.log('Clicked!', e.detail);
      });
    });
  </script>
</head>
<body>
  <vg-theme-provider mode="dark">
    <vg-card heading="Welcome">
      <vg-dropdown label="Select"></vg-dropdown>
      <vg-button variant="primary" size="md">Get Started</vg-button>
    </vg-card>
  </vg-theme-provider>
</body>
</html>
```

**Event Handling:**
- Use `addEventListener('vg-click', handler)` pattern
- Events are CustomEvents with data in `event.detail`
- Wait for `DOMContentLoaded` before accessing elements

**Best Practices:**
- Import both JavaScript and CSS in `<head>`
- Use `type="module"` for ES module support
- Set complex properties (arrays/objects) via JavaScript
- Configure VS Code for IntelliSense support
"""
    
    elif framework == "react":
        return """
### React 18 Setup

**Installation:**
```bash
# From GitHub repository
npm install https://github.com/brguru90/lit-components.git

# Or add to package.json dependencies:
# "dependencies": {
#   "vg": "github:brguru90/lit-components"
# }
# Then run: npm install
```

**Required Imports:**
- CSS: `import 'vg/index.css'` (once in main entry)
- Components: `import { ComponentName } from "vg/react"`
- Base library: `import "vg"` (optional, for direct web component usage)
- Types: `import type { ThemeMode, ButtonVariant, ... } from "vg"`

**Main Entry Setup (`src/index.js`):**

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'vg/index.css';  // Import VG CSS once
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Component Usage (`src/App.js`):**

```jsx
import { useState } from "react";
import { 
  ThemeProvider as VgThemeProvider,
  VgButton, 
  VgCard, 
  VgDropdown 
} from "vg/react";
import "vg";  // Optional: for base components

function App() {
  const [theme, setTheme] = useState("dark");
  const [variant, setVariant] = useState("primary");

  const options = [
    { label: "Primary", value: "primary" },
    { label: "Secondary", value: "secondary" }
  ];

  return (
    <VgThemeProvider mode={theme}>
      <VgCard heading="React App">
        <VgDropdown
          label="Variant"
          value={variant}
          options={options}
          onVgChange={(e) => setVariant(e.detail.value)}
        />
        <VgButton 
          variant={variant}
          size="md"
          onVgClick={(e) => console.log(e.detail)}
        >
          Click Me
        </VgButton>
      </VgCard>
    </VgThemeProvider>
  );
}
```

**Event Handling:**
- Pattern: `onVgClick`, `onVgChange` (camelCase with `onVg` prefix)
- Access data via `event.detail`

**TypeScript Support:**
```tsx
import type { ThemeMode, ButtonVariant, DropdownChangeDetail } from "vg";

const handleChange = (e: CustomEvent<DropdownChangeDetail>) => {
  console.log(e.detail.value);
};
```

**Best Practices:**
- Import `vg/index.css` once in main entry file
- Use React wrappers from `vg/react`
- Pass complex props (arrays/objects) directly
- Event handlers use `onVg[EventName]` pattern
"""
    
    elif framework == "react19":
        return """
### React 19 Setup (JSX Intrinsics)

**Installation:**
```bash
# From GitHub repository
npm install https://github.com/brguru90/lit-components.git

# Or add to package.json dependencies:
# "dependencies": {
#   "vg": "github:brguru90/lit-components"
# }
# Then run: npm install
```

**Required Imports:**
- CSS: `import 'vg/index.css'` (once in main entry)
- JSX Types: `import "vg/jsx"` (once in App.tsx)
- TypeScript Types: `import type { ThemeMode, ButtonVariant, ... } from "vg"`

**Main Entry Setup (`src/main.tsx`):**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'vg/index.css'  // Import VG CSS once
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Component Usage (`src/App.tsx`):**

```tsx
import { useState } from "react";
import "vg/jsx"  // Import JSX type definitions once
import type { 
  ThemeMode, 
  ButtonVariant, 
  DropdownChangeDetail 
} from "vg";

function App() {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [variant, setVariant] = useState<ButtonVariant>("primary");

  const options = [
    { label: "Primary", value: "primary" },
    { label: "Secondary", value: "secondary" }
  ];

  return (
    <vg-theme-provider mode={theme}>
      <vg-card heading="React 19 App">
        <vg-dropdown
          label="Variant"
          value={variant}
          options={options}
          onvg-change={(e: CustomEvent<DropdownChangeDetail>) => 
            setVariant(e.detail.value as ButtonVariant)
          }
        />
        <vg-button 
          variant={variant} 
          size="md"
          onvg-click={(e: CustomEvent) => console.log(e.detail)}
        >
          Click Me
        </vg-button>
      </vg-card>
    </vg-theme-provider>
  );
}
```

**Event Handling:**
- Pattern: `onvg-click`, `onvg-change` (lowercase with hyphens)
- Type events as `CustomEvent` or `CustomEvent<DetailType>`
- Access data via `event.detail`

**TypeScript Configuration:**

Key tsconfig settings for VG components:
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "skipLibCheck": true
  }
}
```

**Best Practices:**
- Import `vg/index.css` once in main entry
- Import `vg/jsx` once for type definitions
- Use native web component tags (`<vg-button>`)
- Event handlers use `onvg-` prefix with hyphens
- Import TypeScript types from `vg` for type safety
"""
    
    elif framework == "vue":
        return """
### Vue 3 Setup

**Installation:**
```bash
# From GitHub repository
npm install https://github.com/brguru90/lit-components.git

# Or add to package.json dependencies:
# "dependencies": {
#   "vg": "github:brguru90/lit-components"
# }
# Then run: npm install
```

**Required Imports:**
- CSS: `import 'vg/index.css'` (once in main.js)
- Components: `import "vg/vue"` (once in App.vue or main component)

**Main Entry Setup (`src/main.js`):**

```javascript
import { createApp } from 'vue'
import 'vg/index.css'  // Import VG CSS once
import App from './App.vue'

createApp(App).mount('#app')
```

**Component Usage (`src/App.vue`):**

```vue
<template>
  <vg-theme-provider :mode="theme">
    <vg-card heading="Vue App">
      <vg-dropdown
        label="Theme"
        :value="theme"
        :options="themeOptions"
        @vg-change="handleChange"
      />
      <vg-button 
        variant="primary" 
        size="md"
        @vg-click="handleClick"
      >
        Click Me
      </vg-button>
    </vg-card>
  </vg-theme-provider>
</template>

<script setup>
import { ref } from 'vue';
import "vg/vue";  // Register VG components globally

const theme = ref('dark');
const themeOptions = [
  { label: "Dark", value: "dark" },
  { label: "Light", value: "light" }
];

const handleClick = (e) => console.log(e.detail);
const handleChange = (e) => theme.value = e.detail.value;
</script>
```

**Event Handling:**
- Pattern: `@vg-click`, `@vg-change` (Vue event syntax with `@`)
- Access data via `event.detail`
- Use `:prop` for dynamic binding (e.g., `:value="theme"`)

**VS Code Integration:**

Create `.vscode/extensions.json` for Volar support:
```json
{
  "recommendations": ["Vue.volar"]
}
```

**Best Practices:**
- Import `vg/index.css` once in main.js
- Import `vg/vue` once to register all components
- Use Vue's reactive refs/state for props
- Event handlers use `@vg-` prefix
- Pass complex props using `:options="array"`
"""
    
    elif framework == "angular":
        return """
### Angular 18+ Setup

**Installation:**
```bash
# From GitHub repository
npm install https://github.com/brguru90/lit-components.git

# Or add to package.json dependencies:
# "dependencies": {
#   "vg": "github:brguru90/lit-components"
# }
# Then run: npm install
```

**Required Configuration:**
- Import `"vg"` in main.ts
- Add `CUSTOM_ELEMENTS_SCHEMA` to components
- Import CSS via angular.json or styles.scss

**Main Entry Setup (`src/main.ts`):**

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import "vg";  // Register VG components

bootstrapApplication(AppComponent)
  .catch((err) => console.error(err));
```

**CSS Configuration (`angular.json`):**

Option 1 - Add to styles array:
```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "styles": [
              "node_modules/vg/dist/index.css",
              "src/styles.scss"
            ]
          }
        }
      }
    }
  }
}
```

Option 2 - Import in `src/styles.scss`:
```scss
@import '../node_modules/vg/dist/index.css';
```

**VS Code IntelliSense Configuration:**

Create `.vscode/settings.json`:
```json
{
  "html.customData": [
    "./node_modules/vg/dist/vg.html-custom-data.json"
  ]
}
```

**Component Usage (`app.component.ts`):**

```typescript
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <vg-theme-provider [attr.mode]="theme">
      <vg-card heading="Angular App">
        <vg-button 
          variant="primary" 
          size="md"
          (vg-click)="handleClick($event)"
        >
          Click Me
        </vg-button>
      </vg-card>
    </vg-theme-provider>
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]  // Required!
})
export class AppComponent {
  theme = 'dark';
  
  handleClick(event: Event) {
    console.log((event as CustomEvent).detail);
  }
}
```

**Complex Properties (Arrays/Objects):**

Set via ViewChild and ElementRef:
```typescript
import { Component, CUSTOM_ELEMENTS_SCHEMA, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  template: `<vg-dropdown #dropdown label="Options"></vg-dropdown>`,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppComponent implements AfterViewInit {
  @ViewChild('dropdown') dropdown!: ElementRef;
  
  ngAfterViewInit() {
    this.dropdown.nativeElement.options = [
      { label: "Option 1", value: "1" },
      { label: "Option 2", value: "2" }
    ];
  }
}
```

**Event Handling:**
- Pattern: `(vg-click)`, `(vg-change)` (Angular event binding)
- Cast events as `CustomEvent` to access `detail`
- Use `[attr.prop]` for string attributes

**VS Code Extensions:**

Create `.vscode/extensions.json`:
```json
{
  "recommendations": ["angular.ng-template"]
}
```

**Best Practices:**
- Always add `CUSTOM_ELEMENTS_SCHEMA` to components
- Import `"vg"` once in main.ts
- Configure CSS in angular.json or styles.scss
- Cast CustomEvents when accessing `detail`
- Set complex properties via ElementRef
- Configure VS Code for IntelliSense
"""
    
    elif framework == "lit":
        return r"""
### Lit Setup

**Installation:**
```bash
# From GitHub repository
npm install https://github.com/brguru90/lit-components.git lit

# Or add to package.json dependencies:
# "dependencies": {
#   "vg": "github:brguru90/lit-components",
#   "lit": "^3.0.0"
# }
# Then run: npm install
```

**Required Imports:**
- Base library: `import "vg"` (registers components)
- CSS: `import "vg/index.css"`
- Types: `import type { ButtonVariant, ... } from "vg"`

**TypeScript Configuration:**

Key tsconfig settings for Lit decorators:
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

**Component Example (`src/my-app.ts`):**

```typescript
import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { ButtonVariant, DropdownChangeDetail } from "vg";
import "vg";  // Register VG components
import "vg/index.css";  // Import VG styles

@customElement("my-app")
export class MyApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 1rem;
    }
  `;

  @state() private theme = "dark";
  @state() private variant: ButtonVariant = "primary";
  @state() private clicks = 0;

  render() {
    return html`
      <vg-theme-provider mode=${this.theme}>
        <vg-card heading="Lit App">
          <vg-dropdown
            label="Variant"
            .value=${this.variant}
            .options=${[
              { label: "Primary", value: "primary" },
              { label: "Secondary", value: "secondary" }
            ]}
            @vg-change=${this.handleChange}
          ></vg-dropdown>
          
          <vg-button
            variant=${this.variant}
            size="md"
            @vg-click=${this.handleClick}
          >
            Click Me
          </vg-button>
          
          <p>Clicked ${this.clicks} times</p>
        </vg-card>
      </vg-theme-provider>
    `;
  }

  private handleClick(e: CustomEvent) {
    this.clicks++;
    console.log('Clicked!', e.detail);
  }
  
  private handleChange(e: CustomEvent<DropdownChangeDetail>) {
    this.variant = e.detail.value as ButtonVariant;
  }
}
```

**Event Handling:**
- Pattern: `@vg-click`, `@vg-change` in templates
- Type events as `CustomEvent<DetailType>`
- Access data via `event.detail`

**Property Binding:**
- Simple values: `attribute=${value}`
- Complex data: `.property=${value}` (dot prefix)

**Best Practices:**
- Use `@customElement` decorator for registration
- Use `@state` for reactive private properties
- Use `@property` for public component properties
- Import `"vg"` and `"vg/index.css"` once
- Enable `experimentalDecorators` in tsconfig
- Use `.property` syntax for arrays/objects
"""
    
    else:  # All frameworks
        return r"""
# VG UI Library - Framework Setup Guide

## Installation

```bash
# From GitHub repository
npm install https://github.com/brguru90/lit-components.git

# Or add to package.json dependencies:
# "dependencies": {
#   "vg": "github:brguru90/lit-components"
# }
# Then run: npm install
```

---

## Quick Start by Framework

### HTML/Vanilla JavaScript

**Required Imports:**
```html
<script type="module" src="./node_modules/vg/dist/index.js"></script>
<link rel="stylesheet" href="./node_modules/vg/dist/index.css" />
```

**VS Code IntelliSense:**
```json
// .vscode/settings.json
{
  "html.customData": ["./node_modules/vg/dist/vg.html-custom-data.json"]
}
```

**Usage:**
```html
<vg-theme-provider mode="dark">
  <vg-button variant="primary">Click Me</vg-button>
</vg-theme-provider>

<script>
  window.addEventListener('DOMContentLoaded', () => {
    document.querySelector('vg-button').addEventListener('vg-click', (e) => {
      console.log(e.detail);
    });
  });
</script>
```

---

### React 18

**Required Imports:**
```jsx
// src/index.js
import 'vg/index.css';

// src/App.js
import { VgButton, VgCard } from "vg/react";
import "vg";  // Optional: for base components
```

**Usage:**
```jsx
function App() {
  return (
    <VgCard heading="React App">
      <VgButton onVgClick={(e) => console.log(e.detail)}>
        Click Me
      </VgButton>
    </VgCard>
  );
}
```

**Event Pattern:** `onVgClick`, `onVgChange`

---

### React 19 (JSX Intrinsics)

**Required Imports:**
```tsx
// src/main.tsx
import 'vg/index.css';

// src/App.tsx
import "vg/jsx";
import type { ButtonVariant } from "vg";
```

**Usage:**
```tsx
function App() {
  return (
    <vg-card heading="React 19 App">
      <vg-button 
        variant="primary"
        onvg-click={(e: CustomEvent) => console.log(e.detail)}
      >
        Click Me
      </vg-button>
    </vg-card>
  );
}
```

**Event Pattern:** `onvg-click`, `onvg-change`

---

### Vue 3

**Required Imports:**
```javascript
// src/main.js
import 'vg/index.css'

// src/App.vue
import "vg/vue";
```

**Usage:**
```vue
<template>
  <vg-card heading="Vue App">
    <vg-button @vg-click="handleClick">Click Me</vg-button>
  </vg-card>
</template>

<script setup>
import "vg/vue";

const handleClick = (e) => console.log(e.detail);
</script>
```

**Event Pattern:** `@vg-click`, `@vg-change`

**VS Code Extensions:**
```json
// .vscode/extensions.json
{ "recommendations": ["Vue.volar"] }
```

---

### Angular 18+

**Required Configuration:**
```typescript
// src/main.ts
import "vg";

// Component
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
schemas: [CUSTOM_ELEMENTS_SCHEMA]
```

**CSS Configuration (angular.json):**
```json
{
  "styles": [
    "node_modules/vg/dist/index.css",
    "src/styles.scss"
  ]
}
```

**OR in styles.scss:**
```scss
@import '../node_modules/vg/dist/index.css';
```

**Usage:**
```typescript
@Component({
  template: `
    <vg-card heading="Angular App">
      <vg-button (vg-click)="handleClick($event)">
        Click Me
      </vg-button>
    </vg-card>
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppComponent {
  handleClick(event: Event) {
    console.log((event as CustomEvent).detail);
  }
}
```

**Event Pattern:** `(vg-click)`, `(vg-change)`

**VS Code Configuration:**
```json
// .vscode/settings.json
{
  "html.customData": ["./node_modules/vg/dist/vg.html-custom-data.json"]
}

// .vscode/extensions.json
{ "recommendations": ["angular.ng-template"] }
```

---

### Lit

**Required Imports:**
```typescript
import "vg";
import "vg/index.css";
import type { ButtonVariant } from "vg";
```

**TypeScript Configuration:**
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "useDefineForClassFields": false
  }
}
```

**Usage:**
```typescript
import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import "vg";
import "vg/index.css";

@customElement("my-app")
export class MyApp extends LitElement {
  render() {
    return html`
      <vg-card heading="Lit App">
        <vg-button @vg-click=${this.handleClick}>
          Click Me
        </vg-button>
      </vg-card>
    `;
  }

  private handleClick(e: CustomEvent) {
    console.log(e.detail);
  }
}
```

**Event Pattern:** `@vg-click`, `@vg-change`

---

## Event Handling Patterns

| Framework | Event Syntax | Example |
|-----------|--------------|---------|
| **HTML** | `addEventListener('vg-click', fn)` | `btn.addEventListener('vg-click', e => {})` |
| **React 18** | `onVgClick={fn}` | `<VgButton onVgClick={e => {}}>` |
| **React 19** | `onvg-click={fn}` | `<vg-button onvg-click={e => {}}>` |
| **Vue** | `@vg-click="fn"` | `<vg-button @vg-click="fn">` |
| **Angular** | `(vg-click)="fn($event)"` | `<vg-button (vg-click)="fn($event)">` |
| **Lit** | `@vg-click=${this.fn}` | `<vg-button @vg-click=${this.fn}>` |

All events are `CustomEvent` with data in `event.detail`.

---

## TypeScript Support

**Import Types:**
```typescript
import type { 
  ThemeMode,           // "dark" | "light" | "glass" | "cartoon"
  ButtonVariant,       // "primary" | "secondary" | "ghost"
  ButtonSize,          // "sm" | "md" | "lg"
  DropdownOption,      // { label: string; value: string }
  DropdownChangeDetail,// { value: string }
  InputChangeDetail    // { value: string }
} from "vg";
```

---

## VS Code IntelliSense

### HTML/Angular Projects:
```json
// .vscode/settings.json
{
  "html.customData": [
    "./node_modules/vg/dist/vg.html-custom-data.json"
  ]
}
```

### Recommended Extensions:
```json
// .vscode/extensions.json
{
  "recommendations": [
    "Vue.volar",          // For Vue projects
    "angular.ng-template"  // For Angular projects
  ]
}
```

---

## CSS Customization

Override CSS custom properties:
```css
:root {
  --vg-primary-color: #your-brand-color;
  --vg-border-radius: 8px;
  --vg-font-family-base: 'Your Font', sans-serif;
  --vg-spacing-md: 1rem;
}
```

---

## Best Practices

### ✅ Do's

- **Import CSS once** in main entry file
- **Configure VS Code** for IntelliSense
- **Use framework wrappers** for React/Vue
- **Type events** with TypeScript
- **Use `.property` syntax** in Lit for arrays/objects
- **Add CUSTOM_ELEMENTS_SCHEMA** in Angular

### ❌ Don'ts

- Don't import CSS in multiple files
- Don't forget `CUSTOM_ELEMENTS_SCHEMA` in Angular
- Don't mix event syntaxes (use correct one for framework)
- Don't forget to import `"vg/vue"` in Vue
- Don't skip decorator config for Lit

---

## Troubleshooting

**Components not recognized:**
- Ensure `npm install vg` completed
- Import VG properly for your framework
- Check `CUSTOM_ELEMENTS_SCHEMA` in Angular

**TypeScript errors:**
- Import types: `import type { ... } from "vg"`
- For React 19: Import `"vg/jsx"`
- For Lit: Enable `experimentalDecorators`

**Styles not applied:**
- Import CSS: `import 'vg/index.css'`
- For Angular: Add to `angular.json` or styles.scss
- Verify CSS loads in browser DevTools

**Events not firing:**
- Use correct event syntax for framework
- Check event name has `vg-` prefix
- Access data via `event.detail`

---

## Quick Reference

### CSS Import Locations:
- **HTML**: `<link>` in `<head>`
- **React/React 19**: `src/index.js` or `src/main.tsx`
- **Vue**: `src/main.js`
- **Angular**: `angular.json` or `src/styles.scss`
- **Lit**: Component file (`import "vg/index.css"`)

### Component Registration:
- **HTML**: Automatic via `<script>` tag
- **React**: Import from `vg/react`
- **React 19**: Import `"vg/jsx"` for types
- **Vue**: Import `"vg/vue"`
- **Angular**: Import `"vg"` in `main.ts`
- **Lit**: Import `"vg"`

### Complex Properties (arrays/objects):
- **HTML/Angular**: Set via JavaScript/ElementRef
- **React/React 19**: Pass directly as props
- **Vue**: Use `:options="array"`
- **Lit**: Use `.property=${value}` syntax
"""
