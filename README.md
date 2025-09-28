# Lit Components (VG)

A modern TypeScript-based component library built with Lit 3, featuring a comprehensive design system with theme provider and framework integrations for React, Vue, and Angular.

## 🚀 Features

- **Modern Architecture**: Built with Lit 3 and TypeScript
- **Design System**: Comprehensive theme provider with multiple theme modes (dark, light, glass, cartoon)
- **Framework Support**: React, Vue, and Angular wrapper components
- **Development Tools**: Vite-powered development with hot reload
- **Custom Elements**: Standards-compliant web components
- **TypeScript**: Full type safety with generated declarations
- **Design Tokens**: CSS custom properties for consistent styling

## 📦 Installation

```bash
npm install vg
```

## 🎯 Quick Start

### Vanilla HTML/JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="./node_modules/vg/dist/index.js"></script>
  <link rel="stylesheet" href="./node_modules/vg/dist/index.css" />
</head>
<body>
  <vg-theme-provider mode="dark">
    <vg-card heading="Welcome">
      <vg-button variant="primary" size="md">Get Started</vg-button>
    </vg-card>
  </vg-theme-provider>

  <script>
    document.querySelector('vg-button').addEventListener('vg-click', (event) => {
      console.log('Button clicked!', event.detail);
    });
  </script>
</body>
</html>
```

### React

```jsx
import { VgThemeProvider, VgButton, VgCard } from "vg/react";
import "vg/index.css";

function App() {
  return (
    <VgThemeProvider mode="dark">
      <VgCard heading="Welcome">
        <VgButton 
          variant="primary" 
          size="md"
          onVgClick={(event) => console.log('Clicked!', event.detail)}
        >
          Get Started
        </VgButton>
      </VgCard>
    </VgThemeProvider>
  );
}
```

### Vue

```vue
<template>
  <vg-theme-provider mode="dark">
    <vg-card heading="Welcome">
      <vg-button 
        variant="primary" 
        size="md"
        @vg-click="handleClick"
      >
        Get Started
      </vg-button>
    </vg-card>
  </vg-theme-provider>
</template>

<script setup>
import "vg/vue";

const handleClick = (event) => {
  console.log('Clicked!', event.detail);
};
</script>
```

### Angular

```typescript
// app.component.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <vg-theme-provider mode="dark">
      <vg-card heading="Welcome">
        <vg-button 
          variant="primary" 
          size="md"
          (vg-click)="handleClick($event)"
        >
          Get Started
        </vg-button>
      </vg-card>
    </vg-theme-provider>
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppComponent {
  handleClick(event: Event) {
    console.log('Clicked!', (event as CustomEvent).detail);
  }
}
```

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import "vg";

bootstrapApplication(AppComponent);
```

## 🧩 Components

### Theme Provider
Controls the design system theme and provides CSS custom properties.

```html
<vg-theme-provider mode="dark">
  <!-- Your components here -->
</vg-theme-provider>
```

**Props:**
- `mode`: `"dark" | "light" | "glass" | "cartoon"` - Theme mode

**Events:**
- `vg-change` - Emitted when theme changes

### Button
Versatile button component with multiple variants and sizes.

```html
<vg-button variant="primary" size="md" disabled>Click me</vg-button>
```

**Props:**
- `variant`: `"primary" | "secondary" | "ghost"` - Button style variant
- `size`: `"sm" | "md" | "lg"` - Button size
- `disabled`: `boolean` - Disable the button

**Events:**
- `vg-click` - Emitted when button is clicked

### Card
Container component with optional header and footer slots.

```html
<vg-card heading="Card Title" variant="outlined">
  <p>Card content goes here</p>
  <div slot="footer">
    <vg-button>Action</vg-button>
  </div>
</vg-card>
```

**Props:**
- `heading`: `string` - Card header text
- `variant`: `"default" | "outlined" | "subtle"` - Card style variant

**Slots:**
- Default slot - Main card content
- `footer` - Footer content area

### Input
Text input component with label and helper text support.

```html
<vg-input 
  label="Email" 
  placeholder="Enter your email"
  helper-text="We'll never share your email"
  required
></vg-input>
```

**Props:**
- `label`: `string` - Input label
- `placeholder`: `string` - Placeholder text
- `helper-text`: `string` - Helper text below input
- `value`: `string` - Input value
- `disabled`: `boolean` - Disable the input
- `required`: `boolean` - Mark as required

**Events:**
- `vg-change` - Emitted when input value changes

### Dropdown
Select dropdown with rich option support.

```html
<vg-dropdown 
  label="Choose option"
  placeholder="Select..."
  helper-text="Pick your favorite"
></vg-dropdown>
```

**Props:**
- `label`: `string` - Dropdown label
- `placeholder`: `string` - Placeholder text
- `helper-text`: `string` - Helper text
- `options`: `DropdownOption[]` - Array of options
- `value`: `string` - Selected value
- `disabled`: `boolean` - Disable the dropdown
- `required`: `boolean` - Mark as required

**Events:**
- `vg-change` - Emitted when selection changes

## 🎨 Theming

The library includes a comprehensive design system with CSS custom properties:

```css
:root {
  --vg-font-family-base: 'Inter', 'Segoe UI', sans-serif;
  --vg-font-size-sm: 0.875rem;
  --vg-font-size-md: 1rem;
  --vg-font-size-lg: 1.125rem;
  --vg-spacing-sm: 0.75rem;
  --vg-spacing-md: 1rem;
  --vg-spacing-lg: 1.5rem;
  --vg-text-color: #ffffff;
  --vg-background-color: #1a1a1a;
  /* ... and many more */
}
```

### Theme Modes
- **Dark**: Default dark theme with high contrast
- **Light**: Clean light theme for bright environments
- **Glass**: Modern glassmorphism effect with backdrop blur
- **Cartoon**: Playful theme with increased letter spacing

## 🛠 Development

### Prerequisites
- Node.js 16+ 
- npm 7+

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build library
npm run build-module

# Generate manifests and wrappers
npm run lsp-support

# Full release build
npm run release
```

### Project Structure

```
├── src/
│   ├── components/           # Component implementations
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Input/
│   │   ├── Dropdown/
│   │   └── ThemeProvider/
│   ├── styles/              # Global styles and tokens
│   ├── index.ts             # Library entry point
│   └── my-element.ts        # Development playground
├── demo/                    # Framework demo apps
│   ├── html-demo/
│   ├── react-demo/
│   ├── vue-demo/
│   └── angular-demo/
├── dist/                    # Built library output
├── types/                   # TypeScript declarations
└── scripts/                 # Build and utility scripts
```

### Development Workflow

1. **Component Development**: Edit components in `src/components`
2. **Playground Testing**: Use `npm run dev` to test in the playground
3. **Framework Testing**: Use `npm run demo` to test all framework integrations
4. **Building**: Use `npm run build-module` for library builds
5. **Release**: Use `npm run release` for full release preparation

### Adding New Components

1. Create component folder: `src/components/MyComponent/`
2. Implement component: `index.ts` and `style.scss`
3. Export from main barrel: `src/index.ts`
4. Follow the established patterns for props, events, and styling

## 🔧 Configuration

### Vite Configuration
- `vite.config.ts` - Development server configuration
- `vite-module.config.ts` - Library build configuration

### TypeScript
- `tsconfig.json` - Development TypeScript config
- `tsconfig-module.json` - Library build TypeScript config

### Custom Elements Manifest
- `custom-elements-manifest.config.mjs` - Generates component documentation and framework wrappers

## 📖 Documentation

- **API Documentation**: Generated automatically via `apt-viewer.html`
- **VS Code IntelliSense**: Automatic via custom elements manifest
- **Component Explorer**: Use the playground at `http://localhost:8080`

## 🧪 Framework Demos

Run all demo applications simultaneously:

```bash
npm run demo
```

Individual demos:
- **HTML**: `npm run start --prefix demo/html-demo` (Port 4000)
- **React**: `npm run start --prefix demo/react-demo` (Port 3000)  
- **Vue**: `npm run dev --prefix demo/vue-demo` (Port 5173)
- **Angular**: `npm run start --prefix demo/angular-demo` (Port 4200)

## 📋 Event System

All components follow a consistent event naming convention:
- Events are prefixed with `vg-` (e.g., `vg-click`, `vg-change`)
- Framework wrappers convert to appropriate conventions:
  - React: `onVgClick`, `onVgChange`
  - Angular: `(vg-click)`, `(vg-change)`
  - Vue: `@vg-click`, `@vg-change`