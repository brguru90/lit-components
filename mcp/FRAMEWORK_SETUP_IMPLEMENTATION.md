# Framework-Specific Project Setup Instructions - Implementation Summary

## Overview
This implementation adds dynamic framework-specific project setup instructions to the VG UI Library MCP server. The instructions now adapt based on the user's framework preference (`--use-framework` CLI argument).

## Changes Made

### 1. Added `get_project_setup_instructions()` Function
**Location:** `/home/guruprasad/Desktop/workspace/lit-components/mcp/src/vg_ui_lib_mcp/main.py`

This function generates framework-specific setup instructions based on the `_use_framework` global variable:

#### Supported Frameworks:
- **`html`**: Vanilla JavaScript with web components
- **`react`**: React with wrapper components (vg/react)
- **`react19`**: React 19 with native JSX intrinsics (vg/jsx)
- **`vue`**: Vue.js with Composition API
- **`angular`**: Angular with CUSTOM_ELEMENTS_SCHEMA
- **`lit`**: Lit web components
- **`None`** (default): Shows examples for all frameworks

#### Key Features:
Each framework instruction includes:
- **Installation commands**: `npm install vg` with framework-specific packages
- **Import statements**: Framework-appropriate import syntax
- **Code examples**: Complete working examples with:
  - Component usage (vg-theme-provider, vg-card, vg-button)
  - Event handling patterns
  - Type imports (where applicable)
  - CSS imports
- **Event Handling Patterns**: Framework-specific event binding syntax
- **Best Practices**: Framework-specific tips and conventions

### 2. Updated `get_instructions()` Function
Replaced the static `instructions` string with a dynamic function that:
- Takes `framework` parameter (Optional[str])
- Calls `get_project_setup_instructions(framework)` to generate the setup section
- Injects the setup instructions into the full instructions template
- Returns complete instructions with framework-specific content

### 3. Updated FastMCP Initialization
Changed from:
```python
instructions=instructions,
```
To:
```python
instructions=get_instructions(_use_framework),
```

This ensures the MCP server initializes with the correct framework-specific instructions based on user configuration.

### 4. Updated `StartupInstructions` Tool
Modified to dynamically generate instructions on each call:
```python
@mcp.tool(name="StartupInstructions", ...)
def StartupInstructions() -> PromptMessage:
    global _use_framework
    return PromptMessage(
        role="assistant",
        content=TextContent(
            type="text",
            text=get_instructions(_use_framework)
        )
    )
```

## Framework-Specific Implementation Details

### HTML/Vanilla JavaScript
```html
<script type="module" src="./node_modules/vg/dist/index.js"></script>
<link rel="stylesheet" href="./node_modules/vg/dist/index.css" />
```
- Direct DOM manipulation
- Standard `addEventListener` with `vg-` prefixed events
- CustomEvents with `event.detail`

### React (Wrapper Components)
```jsx
import { VgButton, VgCard } from "vg/react";
import "vg/index.css";
```
- Imports wrapper components from `vg/react`
- Uses camelCase event handlers: `onVgClick`, `onVgChange`
- React component wrappers for better React integration

### React 19 (JSX Intrinsics)
```tsx
import "vg/jsx";
import type { ButtonVariant } from "vg";
import 'vg/index.css';
```
- Uses native web component tags: `<vg-button>`
- Event handlers: `onvg-click` (lowercase with hyphens)
- Direct TypeScript type imports from `vg`
- Better performance (no wrapper overhead)

### Vue
```vue
<script setup>
import "vg/vue";
import 'vg/index.css';
</script>
```
- Vue Composition API
- Vue-style event binding: `@vg-click`, `@vg-change`
- Reactive properties with `:value`

### Angular
```typescript
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import "vg";
```
- Requires `CUSTOM_ELEMENTS_SCHEMA` in component
- Angular event binding: `(vg-click)="handler($event)"`
- Import `vg` in `main.ts`
- CSS imported via `angular.json`

### Lit
```typescript
import { LitElement, html } from "lit";
import "vg";
import "vg/index.css";
```
- Native Lit template syntax
- Event listeners: `@vg-click=${this.handler}`
- Property binding: `variant=${this.variant}`
- Decorators: `@customElement`, `@state`

## Usage

### As User (CLI)
```bash
# React-specific instructions
fastmcp run main.py --use-framework react

# Vue-specific instructions
python main.py --use-framework vue

# All frameworks (default)
fastmcp run main.py
```

### In Code
```python
# Global framework preference
_use_framework = "react"  # or "vue", "angular", "lit", "html", "react19", None

# Generate instructions
instructions = get_instructions(_use_framework)
```

## Benefits

1. **Reduced Cognitive Load**: Users only see relevant examples for their framework
2. **Better Developer Experience**: Framework-specific syntax and patterns
3. **Faster Onboarding**: Direct copy-paste ready examples
4. **Comprehensive Coverage**: All frameworks still available when needed
5. **Type Safety**: TypeScript examples with proper type imports
6. **Event Handling Clarity**: Framework-specific event binding patterns clearly documented

## Testing

Test script location: `/home/guruprasad/Desktop/workspace/lit-components/mcp/test_framework_simple.py`

Run tests:
```bash
cd /home/guruprasad/Desktop/workspace/lit-components/mcp
python3 test_framework_simple.py
```

Tests verify:
- Instructions generated for all frameworks
- Framework-specific keywords present
- Correct syntax and formatting
- No Python syntax warnings

## Files Modified

1. `/home/guruprasad/Desktop/workspace/lit-components/mcp/src/vg_ui_lib_mcp/main.py`
   - Added `get_project_setup_instructions()` function
   - Added `get_instructions()` function
   - Updated FastMCP initialization
   - Updated `StartupInstructions` tool

## Event Handling Summary

| Framework | Event Syntax | Example |
|-----------|-------------|---------|
| HTML | `addEventListener('vg-click', handler)` | Native DOM |
| React | `onVgClick={handler}` | Wrapper components |
| React 19 | `onvg-click={handler}` | JSX intrinsics |
| Vue | `@vg-click="handler"` | Vue binding |
| Angular | `(vg-click)="handler($event)"` | Angular binding |
| Lit | `@vg-click=${this.handler}` | Lit template |

## Next Steps

1. ✅ Implementation complete
2. ✅ Testing complete
3. 🔄 Ready for deployment
4. 📚 Consider adding to documentation
5. 🚀 Consider adding more framework examples (Svelte, SolidJS, etc.)

## Notes

- Used raw strings (r""") for Lit examples to avoid escape sequence warnings
- All framework examples include complete, working code
- Instructions adapt to user preference seamlessly
- Backwards compatible (None shows all frameworks)
