#!/usr/bin/env python3
"""
Visual demonstration of framework-specific instructions
"""

import sys
import os

# Minimal version of the function for demo
def get_project_setup_instructions(framework=None):
    """Generate framework-specific project setup instructions."""
    
    if framework == "html":
        return """
### HTML/Vanilla JavaScript Setup

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="./node_modules/vg/dist/index.js"></script>
  <link rel="stylesheet" href="./node_modules/vg/dist/index.css" />
</head>
<body>
  <vg-button variant="primary">Click Me</vg-button>
  <script>
    document.querySelector('vg-button').addEventListener('vg-click', (e) => {
      console.log('Clicked!', e.detail);
    });
  </script>
</body>
</html>
```
"""
    elif framework == "react":
        return """
### React Setup

```jsx
import { VgButton } from "vg/react";
import "vg/index.css";

function App() {
  return (
    <VgButton 
      variant="primary"
      onVgClick={(e) => console.log('Clicked!', e.detail)}
    >
      Click Me
    </VgButton>
  );
}
```
"""
    elif framework == "vue":
        return """
### Vue Setup

```vue
<template>
  <vg-button variant="primary" @vg-click="handleClick">
    Click Me
  </vg-button>
</template>

<script setup>
import "vg/vue";
const handleClick = (e) => console.log('Clicked!', e.detail);
</script>
```
"""
    else:
        return """
### Quick Start - All Frameworks

**HTML**: `addEventListener('vg-click', handler)`
**React**: `onVgClick={handler}`
**Vue**: `@vg-click="handler"`
**Angular**: `(vg-click)="handler($event)"`
"""

def main():
    print("\n" + "="*80)
    print("VG UI Library MCP Server - Framework-Specific Instructions Demo")
    print("="*80)
    
    frameworks = [
        ("html", "HTML/Vanilla JS"),
        ("react", "React"),
        ("vue", "Vue.js"),
        (None, "All Frameworks")
    ]
    
    for framework, name in frameworks:
        print(f"\n{'='*80}")
        print(f"Framework: {name}")
        if framework:
            print(f"CLI: fastmcp run main.py --use-framework {framework}")
        else:
            print(f"CLI: fastmcp run main.py  (no framework specified)")
        print("="*80)
        print(get_project_setup_instructions(framework))
    
    print("\n" + "="*80)
    print("✅ Framework-specific instructions adapt automatically!")
    print("="*80 + "\n")

if __name__ == "__main__":
    main()
