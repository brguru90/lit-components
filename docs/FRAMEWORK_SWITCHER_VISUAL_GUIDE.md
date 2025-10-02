# Framework Switcher - Visual Guide

## 🎨 User Interface

### Storybook Toolbar

```
┌─────────────────────────────────────────────────────────────┐
│  Components / Button / Primary                              │
├─────────────────────────────────────────────────────────────┤
│  [Canvas] [Docs]   🎨 Theme: Dark ▾   🔧 Framework: React ▾ │
└─────────────────────────────────────────────────────────────┘
                            ↑                        ↑
                      Theme Switcher         Framework Switcher
                      (Existing)              (NEW!)
```

### Framework Dropdown Menu

```
🔧 Framework: [HTML ▾]
   ┌────────────────┐
   │ 📄 HTML       │ ← Vanilla JavaScript
   │ ⚛️  React      │ ← JSX with wrappers
   │ 🟢 Vue        │ ← Composition API
   │ 🅰️  Angular    │ ← Standalone components
   │ 🔥 Lit        │ ← LitElement
   └────────────────┘
```

## 🔄 Transformation Flow

### Step-by-Step Process

```
┌──────────────────────────────────────────┐
│  1. User Writes Story (Once)             │
│  ┌────────────────────────────────────┐  │
│  │ export const Primary: Story = {    │  │
│  │   args: {                          │  │
│  │     variant: 'primary',            │  │
│  │     disabled: false                │  │
│  │   }                                │  │
│  │ }                                  │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────┐
│  2. Storybook Toolbar                    │
│                                          │
│  User Selects: Framework: [React ▾]     │
└──────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────┐
│  3. Context Update                       │
│                                          │
│  context.globals.framework = 'react'     │
└──────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────┐
│  4. Preview.tsx Intercepts               │
│                                          │
│  docs.source.transform() is called       │
└──────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────┐
│  5. Framework Transformer                │
│                                          │
│  transformCodeForFramework(              │
│    'react',                              │
│    storyContext                          │
│  )                                       │
└──────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────┐
│  6. React Transformer Applied            │
│  ┌────────────────────────────────────┐  │
│  │ import { VgButton } from 'vg/react'│  │
│  │                                    │  │
│  │ <VgButton                          │  │
│  │   variant="primary"                │  │
│  │   disabled={false}                 │  │
│  │ />                                 │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────┐
│  7. Code Displayed in Docs Tab           │
└──────────────────────────────────────────┘
```

## 📊 Side-by-Side Comparison

### Same Story, Different Frameworks

#### HTML
```
┌─────────────────────────────────────────┐
│ 📄 HTML                                 │
├─────────────────────────────────────────┤
│ <vg-button                              │
│   variant="primary"                     │
│   disabled>                             │
│   Click me                              │
│ </vg-button>                            │
│                                         │
│ <script>                                │
│   const btn = document                  │
│     .querySelector('vg-button');        │
│   btn.addEventListener(                 │
│     'vg-click',                         │
│     (e) => console.log(e.detail)        │
│   );                                    │
│ </script>                               │
└─────────────────────────────────────────┘
```

#### React
```
┌─────────────────────────────────────────┐
│ ⚛️  React                                │
├─────────────────────────────────────────┤
│ import { VgButton } from 'vg/react'     │
│                                         │
│ function MyComponent() {                │
│   const handleClick = (e) => {          │
│     console.log(e.detail);              │
│   };                                    │
│                                         │
│   return (                              │
│     <VgButton                           │
│       variant="primary"                 │
│       disabled                          │
│       onVgClick={handleClick}           │
│     >                                   │
│       Click me                          │
│     </VgButton>                         │
│   );                                    │
│ }                                       │
└─────────────────────────────────────────┘
```

#### Vue
```
┌─────────────────────────────────────────┐
│ 🟢 Vue                                  │
├─────────────────────────────────────────┤
│ <script setup>                          │
│ import 'vg/vue'                         │
│                                         │
│ const handleClick = (e) => {            │
│   console.log(e.detail);                │
│ };                                      │
│ </script>                               │
│                                         │
│ <template>                              │
│   <vg-button                            │
│     variant="primary"                   │
│     disabled                            │
│     @vg-click="handleClick"             │
│   >                                     │
│     Click me                            │
│   </vg-button>                          │
│ </template>                             │
└─────────────────────────────────────────┘
```

#### Angular
```
┌─────────────────────────────────────────┐
│ 🅰️  Angular                             │
├─────────────────────────────────────────┤
│ // component.ts                         │
│ @Component({                            │
│   selector: 'app-demo',                 │
│   templateUrl: './demo.html',           │
│   schemas: [CUSTOM_ELEMENTS_SCHEMA]     │
│ })                                      │
│ export class DemoComponent {            │
│   handleClick(e: Event) {               │
│     console.log(                        │
│       (e as CustomEvent).detail         │
│     );                                  │
│   }                                     │
│ }                                       │
│                                         │
│ // demo.html                            │
│ <vg-button                              │
│   variant="primary"                     │
│   [disabled]="true"                     │
│   (vg-click)="handleClick($event)"      │
│ >                                       │
│   Click me                              │
│ </vg-button>                            │
└─────────────────────────────────────────┘
```

#### Lit
```
┌─────────────────────────────────────────┐
│ 🔥 Lit                                  │
├─────────────────────────────────────────┤
│ import { LitElement, html } from 'lit'; │
│                                         │
│ @customElement('my-demo')               │
│ export class MyDemo extends LitElement {│
│   handleClick(e: CustomEvent) {         │
│     console.log(e.detail);              │
│   }                                     │
│                                         │
│   render() {                            │
│     return html`                        │
│       <vg-button                        │
│         variant="primary"               │
│         ?disabled=${true}               │
│         @vg-click=${this.handleClick}   │
│       >                                 │
│         Click me                        │
│       </vg-button>                      │
│     `;                                  │
│   }                                     │
│ }                                       │
└─────────────────────────────────────────┘
```

## 🎯 Key Differences Handled

### 1. Event Handling

```
HTML:     element.addEventListener('vg-click', ...)
React:    onVgClick={...}
Vue:      @vg-click="..."
Angular:  (vg-click)="..."
Lit:      @vg-click=${...}
```

### 2. Boolean Attributes

```
HTML:     disabled
React:    disabled or disabled={true}
Vue:      disabled or :disabled="true"
Angular:  [disabled]="true"
Lit:      ?disabled=${true}
```

### 3. Props/Attributes

```
HTML:     variant="primary"
React:    variant="primary"
Vue:      variant="primary"
Angular:  [variant]="'primary'"
Lit:      variant="primary"
```

### 4. Imports

```
HTML:     <script type="module" src="vg/dist/index.js">
React:    import { VgButton } from 'vg/react'
Vue:      import 'vg/vue'
Angular:  import 'vg' in main.ts
Lit:      import 'vg' or individual components
```

## 📱 Mobile View

```
┌─────────────────────────┐
│ ☰  Components           │
├─────────────────────────┤
│ 📱 Responsive Toolbar   │
│                         │
│ [Canvas] [Docs]         │
│ 🎨 Theme ▾              │
│ 🔧 Framework ▾          │
├─────────────────────────┤
│ Story Content           │
│                         │
│ Code Block              │
│ (Framework-specific)    │
└─────────────────────────┘
```

## 🎬 Animation Flow

```
User Clicks Framework Dropdown
        ↓
Dropdown Opens with 5 Options
        ↓
User Selects "Vue"
        ↓
[Visual transition ~200ms]
        ↓
Code Block Updates
├── Import statements change
├── Component syntax changes  
├── Event handlers change
└── Props binding changes
        ↓
Updated code displayed
```

## 🎓 Learning Path

```
New User Journey:
1. "I want to use these components"
        ↓
2. Opens Storybook
        ↓
3. Sees Theme Switcher (familiar pattern)
        ↓
4. Discovers Framework Switcher
        ↓
5. Selects "React" (their framework)
        ↓
6. Sees React-specific code
        ↓
7. Copies code → Pastes in project
        ↓
8. ✅ Components work immediately!
```

## 💡 Visual Indicators

### Framework Icons

```
📄 HTML      → Document icon
⚛️  React     → Atom icon  
🟢 Vue       → Green circle
🅰️  Angular   → A letter
🔥 Lit       → Fire icon
```

### Status Indicators

```
✅ Selected:  Highlighted in dropdown
📋 Copy:      Click to copy code
🔄 Transform: Visual transition effect
⚠️  Warning:  If complex transformation needed
```

## 🔍 Before & After Screenshots

### Before Implementation
```
┌────────────────────────────────────────┐
│ Storybook                              │
├────────────────────────────────────────┤
│ Only 🎨 Theme switcher                 │
│                                        │
│ Code always shows:                     │
│ • Lit/Web Component syntax             │
│ • Users must translate manually        │
│ • Friction for React/Vue/Angular users │
└────────────────────────────────────────┘
```

### After Implementation
```
┌────────────────────────────────────────┐
│ Storybook                              │
├────────────────────────────────────────┤
│ 🎨 Theme + 🔧 Framework switchers      │
│                                        │
│ Code shows:                            │
│ • User's preferred framework           │
│ • Copy-paste ready                     │
│ • Zero translation needed              │
│ • ✅ Immediate productivity            │
└────────────────────────────────────────┘
```

---

## 🎨 Color Coding (in Storybook UI)

- **HTML**: Gray (#6c757d)
- **React**: Blue (#61dafb)
- **Vue**: Green (#42b883)
- **Angular**: Red (#dd0031)
- **Lit**: Orange (#ff6e42)

---

This visual guide helps users understand the Framework Switcher at a glance!
