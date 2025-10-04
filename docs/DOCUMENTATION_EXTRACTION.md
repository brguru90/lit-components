# Storybook Documentation Extraction

This document explains the storybook documentation extraction implementation for Lit Components.

## Overview

The documentation extraction system automatically generates comprehensive component documentation by analyzing Storybook stories and combining them with metadata from `custom-elements.json`. This implementation is adapted from Vue-based reference implementation to work with Lit web components.

## Architecture

The documentation extraction system consists of three main modules:

### 1. Documentation Extraction (`.storybook/utils/documentation-extraction.ts`)

**Purpose**: Extract documentation from individual stories during test runs.

**Key Functions**:
- `extractStoryDocumentation(page, context)`: Extracts story metadata, props, events, slots from Storybook context
- `getCustomElementsInfo(componentTag)`: Reads additional metadata from `dist/custom-elements.json`
- `saveStoryDocumentation(storyId, storyEntry)`: Saves extracted documentation to chunk files

**Data Sources**:
1. **Storybook Context**: Primary source for story-specific data
   - Props from `argTypes`
   - Events from `argTypes` with event category
   - Slots from `argTypes` with slots category
   - Story descriptions and examples
   - Current args/props values

2. **custom-elements.json**: Supplementary metadata
   - Component attributes and properties
   - Event definitions
   - Slot information
   - CSS properties and parts
   - JSDoc comments

**Output**: Creates chunk files in `storybook-static/stories_doc/chunk_<pid>_<storyId>.json`

### 2. Documentation Merging (`.storybook/utils/merge-docs.ts`)

**Purpose**: Merge all documentation chunks into a single file and extract additional metadata.

**Key Functions**:
- `mergeDocs()`: Main function that orchestrates the merge process
- `resolveLitComponents()`: Discovers all Lit components from source code
- `extractTypescriptTypes()`: Extracts TypeScript type definitions
- `processScss()`: Compiles SCSS to CSS for documentation

**Process**:
1. Reads all chunk files from `storybook-static/stories_doc/`
2. Merges them into a single `docs.json`
3. Extracts TypeScript types from source files
4. Processes SCSS to extract CSS
5. Validates that all components have stories
6. Deletes chunk files after merging

**Output**: 
- `storybook-static/stories_doc/docs.json`: Complete merged documentation

### 3. Component Registry Generation (`.storybook/utils/gen-comp-registry.ts`)

**Purpose**: Transform merged documentation into structured component registry format.

**Key Functions**:
- `transformToRegistry()`: Main transformation function
- `transformSchemas(stories, transformed)`: Extracts and processes type schemas
- `transformComponents(stories, transformed)`: Transforms stories into component definitions
- `generateMinimalDocs(stories)`: Creates lightweight version of documentation

**Process**:
1. Reads `docs.json`
2. Parses TypeScript type definitions into schemas
3. Transforms component data into registry format
4. Groups components by categories
5. Generates examples from stories
6. Creates both full and minimal documentation versions

**Output**:
- `storybook-static/stories_doc/component-registry.json`: Full component registry
- `storybook-static/stories_doc/docs-min.json`: Minimal documentation for bundle

## Integration with Test Runner

The documentation extraction is integrated into the Storybook test runner through the `postVisit` hook in `.storybook/test-runner.ts`:

```typescript
async postVisit(page: Page, context: any) {
  // ... lighthouse audit ...
  
  // Extract and save documentation for this story
  try {
    await extractAndSaveDocumentation(page, context);
  } catch (error) {
    console.error(`\n❌ Error extracting documentation for ${storyName}:`, error);
    // Don't throw - documentation extraction should not fail tests
  }
}
```

**Benefits of this approach**:
- Documentation is extracted automatically when tests run
- No separate build step needed for documentation
- Always in sync with actual stories
- Can leverage Playwright's page access for rendered HTML

## Usage

### Extract Documentation

Run the test runner which will automatically extract documentation:

```bash
npm run test
```

This runs all stories through the test runner and extracts documentation chunks.

### Merge Documentation

Merge all documentation chunks into a single file:

```bash
npm run docs:merge
```

This will:
- Merge all chunk files
- Extract TypeScript types
- Process SCSS
- Validate component coverage

### Generate Component Registry

Transform merged docs into component registry:

```bash
npm run docs:generate
```

This creates:
- `component-registry.json`: Full registry with all metadata
- `docs-min.json`: Lightweight version for distribution

### Complete Documentation Build

Run all steps in sequence:

```bash
npm run docs:build
```

This runs: `docs:extract` → `docs:merge` → `docs:generate`

## Output Structure

### docs.json

```json
{
  "story-id": {
    "context": { "id": "...", "title": "...", "name": "..." },
    "component_tag": "vg-button",
    "story_name": "Primary",
    "descriptions": "Component description with AI instructions",
    "component_hierarchy": "atoms/buttons",
    "component_type": "interactive",
    "source": "Story source code",
    "rendered_source": "Rendered HTML",
    "props": { "variant": { "type": "...", "description": "..." } },
    "events": { "click": { "name": "click", "description": "..." } },
    "slots": { "default": { "description": "..." } },
    "currentArgs": { "variant": "primary" }
  },
  "processed_css": "/* compiled CSS */",
  "processed_types": [
    { "name": "ButtonVariant", "definition": "export type ButtonVariant = 'primary' | 'secondary'" }
  ]
}
```

### component-registry.json

```json
{
  "version": "{{-VG_VERSION-}}",
  "framework": "lit",
  "library": "@vg/components",
  "schemas": {
    "ButtonVariant": { "values": ["primary", "secondary"] }
  },
  "components": {
    "vg-button": {
      "lit_component_tag": "vg-button",
      "category": "Buttons",
      "descriptions": "...",
      "props": { "variant": { "type": "ButtonVariant", "$ref": "#/schemas/ButtonVariant" } },
      "events": { "click": { "name": "click", "event": "CustomEvent<void>" } },
      "examples": [
        { "id": "...", "name": "Primary", "source": "...", "args": {} }
      ]
    }
  },
  "categories": {
    "Buttons": { "name": "Buttons", "components": ["vg-button"] }
  }
}
```

### docs-min.json

Lightweight version with essential information for NPM bundle:

```json
{
  "components": {
    "vg-button": {
      "props": {},
      "events": {},
      "slots": {}
    }
  },
  "total_components": 10,
  "types": {}
}
```

## Key Differences from Vue Reference

1. **No Vue-specific parsing**: Removed `@vue/compiler-sfc` and Vue component analysis
2. **Lit component detection**: Uses custom-elements.json and TypeScript AST analysis
3. **Web Components focus**: Adapted for web component attributes vs Vue props
4. **Simplified type extraction**: Focuses on TypeScript types, not Vue prop types
5. **No Vue doc-parser**: Custom-elements.json provides equivalent metadata

## Custom Elements Manifest Integration

The system leverages `@custom-elements-manifest/analyzer` which:
- Analyzes Lit components using TypeScript
- Generates `dist/custom-elements.json` with comprehensive metadata
- Provides JSDoc-based documentation
- Extracts decorators like `@property`, `@customElement`

Configure in `custom-elements-manifest.config.mjs`:

```javascript
export default {
  globs: ["src/**/*.{js,ts}"],
  outdir: "dist",
  litelement: true,
  plugins: [
    jsDocTagsPlugin(),
    jsxTypesPlugin(),
    // ... other plugins
  ]
}
```

## Story Metadata Requirements

For optimal documentation extraction, stories should include:

### 1. Component Reference in Meta

```typescript
const meta: Meta<typeof VgButton> = {
  title: 'Components/Button',
  component: VgButton, // Must reference the actual component class
  parameters: {
    docs: {
      description: {
        component: 'Button component description\n\n#### AI Instruction:\nUse for...'
      },
      component_hierarchies: 'atoms/buttons',
      component_type: 'interactive'
    }
  }
}
```

### 2. ArgTypes Configuration

```typescript
argTypes: {
  variant: {
    control: { type: 'select' },
    options: ['primary', 'secondary'],
    description: 'Button variant',
    table: { category: 'props' }
  },
  onClick: {
    action: 'clicked',
    description: 'Fired when button is clicked',
    table: { category: 'events' }
  }
}
```

### 3. Story Examples

```typescript
export const Primary: Story = {
  args: {
    variant: 'primary',
    label: 'Primary Button'
  },
  parameters: {
    docs: {
      description: {
        story: 'Primary button variant'
      }
    }
  }
}
```

## Validation

The system validates:

1. **Component Coverage**: All Lit components must have stories
2. **Required Metadata**: Stories must have descriptions and AI instructions
3. **Component Tags**: Component tag names must be valid
4. **Type Consistency**: Props must have valid type definitions

Validation errors will be logged but won't fail the build.

## Troubleshooting

### Documentation not extracted

- Ensure `npm run test` runs successfully
- Check that stories are properly configured with meta.component
- Verify custom-elements.json is generated (`npm run lsp-support`)

### Missing component metadata

- Check custom-elements.json contains the component
- Verify JSDoc comments are present in source
- Ensure component uses Lit decorators correctly

### Type extraction issues

- Ensure TypeScript compilation is successful (`npm run type-check`)
- Check that types are exported from source files
- Verify type definitions are valid TypeScript

### SCSS processing fails

- Check that `.storybook/all.scss` exists
- Verify SCSS imports are valid
- Ensure `sass` package is installed

## Future Enhancements

Potential improvements:

1. **Incremental extraction**: Only extract changed stories
2. **Parallel processing**: Extract multiple stories concurrently  
3. **Caching**: Cache custom-elements.json parsing
4. **Validation hooks**: Add pre-commit hooks for documentation
5. **AI integration**: Generate AI-friendly documentation formats
6. **Visual regression**: Include screenshots in documentation

## Related Files

- `.storybook/utils/documentation-extraction.ts`: Core extraction logic
- `.storybook/utils/merge-docs.ts`: Documentation merging
- `.storybook/utils/gen-comp-registry.ts`: Registry generation
- `.storybook/test-runner.ts`: Test runner integration
- `.storybook/all.scss`: SCSS entry point for documentation
- `custom-elements-manifest.config.mjs`: Custom elements analyzer config
- `storybook-static/stories_doc/`: Output directory for documentation

## References

- [Custom Elements Manifest](https://custom-elements-manifest.open-wc.org/)
- [Storybook Test Runner](https://storybook.js.org/docs/react/writing-tests/test-runner)
- [Lit Documentation](https://lit.dev/)
- Reference implementation: `./storybook_reference/.storybook/`
