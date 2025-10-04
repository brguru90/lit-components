# Lighthouse Thresholds Configuration

## Shared Configuration

The Lighthouse thresholds are defined in a shared configuration file to keep them in sync across:

- **Test Runner** (`test-runner.ts`) - Automated testing with Storybook test runner
- **Storybook Addon Panel** (`Panel.tsx`) - Visual display in Storybook UI

### Location

```
.storybook/lighthouse-config.ts
```

### Usage

```typescript
import { DEFAULT_THRESHOLDS, type LighthouseThresholds } from './lighthouse-config';
```

## Component-Level Thresholds

Since we're testing individual components (not full pages), our thresholds are **stricter** than Google's recommended "Good" thresholds for complete web pages.

### Rationale

Components should achieve excellent performance because:
- ✅ No routing overhead
- ✅ Smaller bundles (isolated components)
- ✅ Fewer resources (minimal CSS/JS)
- ✅ No API calls in most stories
- ✅ No complex application state

### Current Thresholds

#### Category Scores (0-100)
- **Performance**: 90 (vs 70 for pages)
- **Accessibility**: 95 (vs 90 for pages)
- **Best Practices**: 90 (vs 80 for pages)
- **SEO**: 80 (moderate - less relevant for components)

#### Core Web Vitals
- **FCP** (First Contentful Paint): ≤ 1000ms (vs 2000ms for pages)
- **LCP** (Largest Contentful Paint): ≤ 1500ms (vs 2500ms for pages)
- **CLS** (Cumulative Layout Shift): ≤ 0.05 (vs 0.1 for pages)
- **TBT** (Total Blocking Time): ≤ 100ms (vs 200ms for pages)
- **Speed Index**: ≤ 1500ms (vs 3400ms for pages)
- **TTI** (Time to Interactive): ≤ 2000ms (vs 3800ms for pages)

## Customizing Per Story

You can override thresholds for specific stories:

```typescript
export default {
  title: 'Components/ComplexComponent',
  parameters: {
    lighthouse: {
      thresholds: {
        'largest-contentful-paint': 2000,  // Relax for complex components
        performance: 85,                   // Slightly lower if needed
      }
    }
  }
};
```

## Modifying Global Thresholds

To change the global thresholds:

1. Edit `.storybook/lighthouse-config.ts`
2. Changes automatically apply to:
   - Test runner audits
   - Storybook addon panel UI
   - Any future integrations

## Benefits of Shared Config

✅ **Single Source of Truth** - One place to update thresholds
✅ **Consistency** - Test runner and UI always use same values
✅ **Type Safety** - Shared TypeScript interface
✅ **Maintainability** - Easier to adjust as project evolves
