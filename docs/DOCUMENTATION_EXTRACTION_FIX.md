# Documentation Extraction Fix

## Problem Summary

The documentation extraction logic in `.storybook/utils/documentation-extraction.ts` was not properly categorizing component metadata from Storybook's `argTypes`. This resulted in:

1. **Props miscategorization**: Many props were going to `unknownArgs` instead of `props`
2. **Events in props**: Some events were being categorized as props
3. **Missing categories**: CSS parts and CSS properties were not being extracted
4. **Slots working correctly**: Slots were properly categorized

## Root Cause

The original code only checked for three categories:
- `category === 'slots'`
- `category === 'events'`  
- `category === 'props'` (or no category with non-function type)

However, Storybook's `table.category` field can have multiple values including:
- `'attributes'`
- `'properties'`
- `'css shadow parts'`
- `'css properties'` / `'css custom properties'`

## Solution Implemented

### 1. Enhanced Category Detection

Updated the extraction logic to handle all category types:

```typescript
const category = argType.table?.category?.toLowerCase();

if (category === 'slots') {
  // Handle slots
} else if (category === 'events') {
  // Handle events
} else if (category === 'css shadow parts') {
  // Handle CSS parts
} else if (category === 'css properties' || category === 'css custom properties') {
  // Handle CSS properties
} else if (
  category === 'props' ||
  category === 'properties' ||
  category === 'attributes' ||
  (!category && argType.type?.name !== 'function')
) {
  // Handle props/attributes
}
```

### 2. Filter Disabled Properties

Added filtering for internal Storybook properties that have `table.disable === true`:

```typescript
// Skip internal Storybook handlers
if (key.startsWith('on') && argType.table?.disable === true) {
  continue;
}

// Skip disabled internal properties
if (argType.table?.disable === true) {
  continue;
}
```

### 3. Added New Categories

Extended the `StoryEntry` interface to include:
- `cssParts?: Record<string, any>`
- `cssProperties?: Record<string, any>`

## Results

### Before Fix (Dropdown Component)
```json
{
  "props": ["onVgChange"],
  "slots": ["prefix", "suffix"],
  "events": ["vg-change"],
  "unknownArgs": [
    "disabled", "dropdownId", "error", "hasPrefixContent",
    "hasSuffixContent", "helper-text", "helperText", "label",
    "name", "options", "placeholder", "required", "select",
    "selectElement", "value"
  ]
}
```

### After Fix (Dropdown Component)
```json
{
  "props": [
    "disabled", "dropdownId", "error", "helper-text",
    "helperText", "name", "options", "placeholder",
    "required", "value"
  ],
  "slots": ["prefix", "suffix"],
  "events": ["vg-change"],
  "unknownArgs": [],
  "cssParts": ["label", "select"]
}
```

### Button Component Results
```json
{
  "props": ["buttonType", "disabled", "loading", "size", "variant"],
  "slots": ["prefix", "suffix"],
  "events": ["vg-click"],
  "unknownArgs": [],
  "cssParts": ["button"]
}
```

### Input Component Results
```json
{
  "props": 10,
  "slots": 2,
  "events": 1,
  "unknownArgs": [],
  "cssParts": 2,
  "cssProperties": 0
}
```

## Properties Correctly Filtered

Properties with `table.disable: true` are now correctly filtered out:
- `hasPrefixContent` (internal state)
- `hasSuffixContent` (internal state)
- `selectElement` (internal reference)
- `onVgChange` (Storybook action handler)

## Testing

To verify the changes:

```bash
# 1. Run type check
npm run type-check

# 2. Rebuild documentation
npm run docs:build

# 3. Verify categorization
jq '.["components-dropdown--default"] | {props: .props | keys, slots: .slots | keys, events: .events | keys, unknownArgs: .unknownArgs | keys, cssParts: .cssParts | keys}' storybook-static/stories_doc/docs.json
```

## Reference Implementation

The fix was inspired by the Vue-specific implementation in `storybook_reference/.storybook/test-runner.ts`, but adapted for web components and Lit with generic Storybook categorization.

## Files Modified

- `.storybook/utils/documentation-extraction.ts`
  - Enhanced `extractStoryDocumentation()` function
  - Updated `StoryEntry` interface
  - Added CSS parts and properties extraction
  - Improved category detection logic
  - Added filtering for disabled properties

## Impact

- ✅ All props now correctly categorized
- ✅ Events properly separated from props
- ✅ CSS parts and properties now extracted
- ✅ Internal/disabled properties filtered out
- ✅ Slots continue to work correctly
- ✅ No unknownArgs in typical components
- ✅ Type-safe with TypeScript
