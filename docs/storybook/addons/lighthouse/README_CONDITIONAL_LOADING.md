# Conditional Addon Loading

The Lighthouse addon now only registers in development mode to reduce the production bundle size.

## Implementation

### 1. Environment Variable Configuration (`main.ts`)
The `main.ts` file sets an environment variable that indicates whether the addon should be enabled:

```typescript
env: (config) => ({
  ...config,
  STORYBOOK_LIGHTHOUSE_ENABLED: process.env.NODE_ENV !== 'production' ? 'true' : 'false',
}),
```

### 2. Conditional Registration (`register.tsx`)
The addon registration is wrapped in a conditional check:

```typescript
const isEnabled = process.env.STORYBOOK_LIGHTHOUSE_ENABLED === 'true';

if (isEnabled) {
  addons.register(ADDON_ID, () => {
    // Register the panel
    addons.add(PANEL_ID, {
      // ... addon configuration
    });
  });
}
```

## Testing

### Development Mode
Run `npm run storybook` and verify:
- The Lighthouse tab appears in the addons panel
- The addon functions normally

### Production Build
1. Build: `npm run build-storybook`
2. Serve: `npm run start`
3. Verify:
   - The Lighthouse tab does NOT appear in the addons panel
   - The production bundle does not include the Lighthouse addon code

## Environment Variables

- `STORYBOOK_LIGHTHOUSE_ENABLED`: Set to `'true'` in development, `'false'` in production
- Automatically managed by the Storybook configuration

## Benefits

1. **Reduced Bundle Size**: The addon code is not included in production builds
2. **Faster Load Times**: Less JavaScript to download and parse
3. **Development-Only Features**: Keeps development tools separate from production
