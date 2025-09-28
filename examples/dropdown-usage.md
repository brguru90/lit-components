# Dropdown Component Usage Guide

## Understanding Properties vs Attributes in Lit Elements

The `vg-dropdown` component's `options` property is declared with `@property({ attribute: false })`, which means it **cannot** be set as an HTML attribute and must be set as a JavaScript property.

### Why `attribute: false`?

Complex objects like arrays and objects cannot be serialized to HTML attributes effectively. Lit requires `attribute: false` for these properties to:

1. **Prevent serialization issues**: Arrays would be converted to strings like `"[object Object]"`
2. **Maintain object references**: Complex objects need to maintain their structure and references
3. **Enable reactive updates**: Lit can properly detect changes in complex objects when set as properties

## ❌ Incorrect Usage (Won't Work)

```html
<!-- This WILL NOT work - options can't be set as an attribute -->
<vg-dropdown 
  label="Select Option" 
  options="[{label: 'Option 1', value: 'opt1'}]"
></vg-dropdown>
```

## ✅ Correct Usage

### In Vanilla HTML/JavaScript

```html
<vg-dropdown id="myDropdown" label="Select Option"></vg-dropdown>

<script>
const dropdown = document.getElementById('myDropdown');
dropdown.options = [
  { label: 'Option 1', value: 'opt1', description: 'First option' },
  { label: 'Option 2', value: 'opt2', description: 'Second option' },
];
</script>
```

### In Lit Templates

```typescript
import { html } from 'lit';

const options = [
  { label: 'Option 1', value: 'opt1' },
  { label: 'Option 2', value: 'opt2' },
];

const template = html`
  <vg-dropdown 
    label="Select Option"
    .options=${options}
  ></vg-dropdown>
`;
```

Note the `.options=${options}` syntax - the dot (.) tells Lit to set this as a property, not an attribute.

### In React

```jsx
import { VgDropdown } from 'vg/react';

const options = [
  { label: 'Option 1', value: 'opt1' },
  { label: 'Option 2', value: 'opt2' },
];

function MyComponent() {
  return (
    <VgDropdown 
      label="Select Option"
      options={options}
    />
  );
}
```

### In Vue

```vue
<template>
  <vg-dropdown 
    label="Select Option"
    :options="options"
  />
</template>

<script>
export default {
  data() {
    return {
      options: [
        { label: 'Option 1', value: 'opt1' },
        { label: 'Option 2', value: 'opt2' },
      ]
    };
  }
};
</script>
```

## Storybook Implementation

In Storybook stories, we need to create custom render functions that properly handle the `options` property:

```typescript
export const Default: Story = {
  args: {
    label: 'Select an Option',
    options: sampleOptions,
    // ... other args
  },
  render: (args) => {
    const { options, ...otherArgs } = args;
    return html`
      <vg-dropdown 
        label=${otherArgs.label || ''}
        placeholder=${otherArgs.placeholder || ''}
        ?disabled=${otherArgs.disabled}
        ?required=${otherArgs.required}
        value=${otherArgs.value || ''}
        .options=${options}
      ></vg-dropdown>
    `;
  },
};
```

## Key Points

1. **Property Binding**: Use `.options=${value}` in Lit templates (note the dot prefix)
2. **Reactive Updates**: When you update the options array, assign a new array reference for Lit to detect changes
3. **Type Safety**: The `options` property is strongly typed with the `DropdownOption[]` interface
4. **Performance**: Setting as property is more efficient than parsing serialized attributes

## Option Interface

```typescript
interface DropdownOption {
  label: string;           // Display text
  value: string;           // Value returned when selected
  description?: string;    // Optional helper text
  disabled?: boolean;      // Whether the option is selectable
}
```

This approach ensures proper data handling and maintains the reactive nature of Lit elements while working correctly across all frameworks and usage scenarios.