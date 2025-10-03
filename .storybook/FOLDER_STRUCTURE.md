# .storybook Folder Structure

This document describes the logical organization of files in the `.storybook` folder.

## Overview

The `.storybook` folder has been organized into logical groups based on functionality to improve maintainability and clarity.

## Folder Structure

```
.storybook/
├── addons/                  # Storybook addons
│   └── lighthouse/          # Lighthouse performance addon
│       ├── Panel.tsx        # Addon UI panel component
│       ├── register.tsx     # Addon registration
│       ├── server.mjs       # Lighthouse API server
│       └── *.md            # Documentation files
├── lighthouse/              # Lighthouse configuration (shared)
│   ├── lighthouse-config.cjs       # CommonJS config for Node.js
│   ├── lighthouse-config.ts        # TypeScript config exports
│   ├── lighthouse.d.ts             # Type definitions
│   ├── lighthouse-runner.mjs       # Lighthouse runner script
│   └── LIGHTHOUSE_TEST_RUNNER.md   # Documentation
├── themes/                  # Theme configuration
│   ├── decorators.ts        # Theme decorators and global types
│   └── themes.ts            # Theme definitions (dark, light, glass, cartoon)
├── utils/                   # Utility functions
│   ├── framework-transformer.ts    # Framework code transformation
│   └── test-runner-utils.ts        # Test runner utilities
├── controls.ts              # Custom controls utilities
├── main.ts                  # Storybook main configuration
├── manager.ts               # Storybook manager (UI shell) configuration
├── preview.tsx              # Preview configuration and decorators
└── test-runner.ts           # Test runner configuration
```

## File Categories

### Core Configuration Files (root level)
These files must remain at the root level as Storybook expects them there:
- `main.ts` - Main Storybook configuration
- `manager.ts` - Manager (UI shell) configuration  
- `preview.tsx` - Preview configuration and global decorators
- `test-runner.ts` - Test runner configuration
- `controls.ts` - Custom controls utilities (used by story files)

### Addons (`addons/`)
Custom Storybook addons that extend functionality:
- **lighthouse/** - Performance auditing addon with UI panel and API server

### Lighthouse Configuration (`lighthouse/`)
Shared Lighthouse configuration files used by both the test runner and the addon:
- Configuration files (`.cjs`, `.ts`)
- Type definitions
- Runner script
- Documentation

**Why separate from addon?** These configuration files are shared between multiple consumers (test runner, addon, etc.), so they live in their own folder rather than inside the addon.

### Themes (`themes/`)
Theme-related files that define the appearance of Storybook:
- Theme definitions (dark, light, glass, cartoon)
- Theme decorators and global toolbar configuration

### Utilities (`utils/`)
Reusable utility functions and helpers:
- Framework code transformation (HTML, React, Vue, Angular, Lit)
- Test runner utilities (Lighthouse integration, caching)

## Import Paths

After reorganization, import paths have been updated as follows:

### From `preview.tsx`:
```typescript
import { withThemeProvider, globalTypes } from './themes/decorators'
import { themes } from './themes/themes'
import { transformCodeForFramework } from './utils/framework-transformer'
```

### From `manager.ts`:
```typescript
import { themes } from './themes/themes'
```

### From `test-runner.ts`:
```typescript
import { runLighthouseAudit } from './utils/test-runner-utils'
```

### From addon files:
```typescript
import { DEFAULT_THRESHOLDS } from '../../lighthouse/lighthouse-config'
```

### From utilities:
```typescript
import { LighthouseThresholds } from '../lighthouse/lighthouse-config'
```

## Benefits of This Structure

1. **Logical Grouping**: Files are organized by functionality rather than scattered
2. **Clear Separation**: Core config, themes, utilities, and addons are clearly separated
3. **Reusability**: Shared files (like lighthouse config) are in their own folders
4. **Maintainability**: Easier to find and update related files
5. **Scalability**: Easy to add new categories as the project grows

## Adding New Files

When adding new files, follow these guidelines:

- **Storybook config files**: Keep at root (main.ts, preview.tsx, etc.)
- **Theme-related**: Add to `themes/`
- **Utilities/helpers**: Add to `utils/`
- **Addons**: Add to `addons/<addon-name>/`
- **Shared configs**: Consider if it belongs in an existing folder or needs a new one

## Note

Storybook-specific files like `main.ts`, `test-runner.ts`, `preview.tsx`, `manager.ts`, and the `addons/` folder are not moved as they serve as entry points for Storybook's configuration system.
