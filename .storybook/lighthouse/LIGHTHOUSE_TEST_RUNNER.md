# Lighthouse Test Runner Integration

## Overview

The Lighthouse integration in the Storybook test runner provides automated performance audits for each story. Tests will **fail** if performance metrics don't meet the configured thresholds.

## How It Works

1. **test-runner.ts** - Main test runner configuration that integrates with Storybook's test infrastructure
2. **lighthouse-runner.mjs** - Standalone Node.js script that runs Lighthouse audits outside of Jest's context
3. **lighthouse-config.ts** - Shared configuration for thresholds and types

### Architecture

```
Jest Test Runner (CommonJS)
    ↓
test-runner.ts (execSync)
    ↓
lighthouse-runner.mjs (ES Module)
    ↓
Lighthouse + Chrome Launcher
    ↓
Returns JSON results
    ↓
Test passes/fails based on thresholds
```

## Why This Architecture?

Jest's test runner uses CommonJS and cannot directly import ES modules like Lighthouse. To work around this:

- Lighthouse runs in a **separate Node.js process** via `lighthouse-runner.mjs`
- Results are passed back as **JSON** via stdout
- The test runner parses results and **throws errors** to fail tests when thresholds aren't met

## Configuration

### Default Thresholds (lighthouse-config.ts)

```typescript
{
  // Category scores (0-100, higher is better)
  performance: 90,
  accessibility: 95,
  'best-practices': 90,
  seo: 80,
  
  // Core Web Vitals (lower is better)
  'first-contentful-paint': 1000,      // ≤ 1.0s
  'largest-contentful-paint': 1500,    // ≤ 1.5s
  'cumulative-layout-shift': 0.05,     // ≤ 0.05
  'total-blocking-time': 100,          // ≤ 100ms
  'speed-index': 1500,                 // ≤ 1.5s
  interactive: 2000,                   // ≤ 2.0s
}
```

### Per-Story Configuration

Disable Lighthouse for specific stories:

```typescript
export const MyStory = {
  parameters: {
    lighthouse: {
      enabled: false,
    },
  },
};
```

Custom thresholds for a story:

```typescript
export const MyStory = {
  parameters: {
    lighthouse: {
      thresholds: {
        performance: 80,  // Relax performance threshold
        'first-contentful-paint': 2000,  // Allow slower FCP
      },
    },
  },
};
```

## Test Output

When running tests, you'll see detailed Lighthouse reports:

```
📊 Lighthouse Report for: Components/Dropdown
────────────────────────────────────────────────────────────

🎯 Category Scores (0-100):
✗ performance         : 60% (threshold: 90%)
✓ accessibility       : 100% (threshold: 95%)
✓ best-practices      : 96% (threshold: 90%)
✓ seo                 : 90% (threshold: 80%)

⚡ Core Web Vitals:
✗ first-contentful-paint      : 5032ms (threshold: 1000ms)
✗ largest-contentful-paint    : 8861ms (threshold: 1500ms)
✓ cumulative-layout-shift     : 0.000 (threshold: 0.050)
✗ total-blocking-time         : 161ms (threshold: 100ms)
✗ speed-index                 : 5032ms (threshold: 1500ms)
✗ interactive                 : 8861ms (threshold: 2000ms)

❌ Failed thresholds:
   - performance: 60 < 90
   - first-contentful-paint: 5032 > 1000
   - largest-contentful-paint: 8861 > 1500
   - total-blocking-time: 161 > 100
   - speed-index: 5032 > 1500
   - interactive: 8861 > 2000
```

## Running Tests

```bash
# Run all tests with Lighthouse
npm run test

# Run specific story
npx test-storybook stories/Dropdown.stories.ts

# Run without coverage (faster)
npx test-storybook
```

## Troubleshooting

### Tests are too slow

- Lighthouse audits take time (5-10 seconds per story)
- Consider disabling for some stories using `lighthouse: { enabled: false }`
- Run tests in parallel if possible

### All tests failing with low performance

- Default thresholds are **very strict** for isolated components
- Adjust thresholds in `lighthouse-config.ts` or per-story
- Consider that full Storybook app includes framework overhead

### Module errors

- Ensure `lighthouse-runner.mjs` is executable: `chmod +x .storybook/lighthouse-runner.mjs`
- Check that `lighthouse` and `chrome-launcher` packages are installed

## Benefits

✅ **Automated performance testing** - Catch regressions early  
✅ **Fails CI/CD on performance issues** - Enforces quality standards  
✅ **Detailed metrics** - Know exactly what needs improvement  
✅ **Per-story configuration** - Flexible thresholds  
✅ **No Jest conflicts** - Works around module system issues  

## Maintenance

- Update thresholds as needed in `lighthouse-config.ts`
- Keep Lighthouse version updated for latest audits
- Review failing tests regularly to ensure thresholds remain realistic
