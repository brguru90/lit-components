# Lighthouse Panel Implementation with Shared Thresholds

## Overview

The Lighthouse Panel now fully respects and displays the `DEFAULT_THRESHOLDS` from `.storybook/lighthouse-config.ts`, providing visual feedback on whether metrics pass or fail against the configured thresholds.

## Key Features

### 1. **Shared Threshold Configuration**
- Imports `DEFAULT_THRESHOLDS` from `../../lighthouse-config`
- Falls back to shared config if API response doesn't include thresholds
- Supports per-story threshold overrides via API

```typescript
// Use thresholds from results if available, otherwise use DEFAULT_THRESHOLDS
const activeThresholds = results.thresholds || DEFAULT_THRESHOLDS;
```

### 2. **Category Scores with Threshold Validation**

Each category (Performance, Accessibility, Best Practices, SEO) displays:
- ✅ **Score value** (0-100)
- ✅ **Color coding** based on score:
  - 🟢 Green (≥90): Excellent
  - 🟠 Orange (50-89): Needs improvement
  - 🔴 Red (<50): Poor
- ✅ **Threshold comparison**: Shows ✓ or ✗ based on `score >= threshold`
- ✅ **Threshold value** displayed for reference

**Example:**
```
Performance
92
Threshold: 90 ✓
```

### 3. **Core Web Vitals with Threshold Validation**

Each Core Web Vital metric displays:
- ✅ **Metric name** (formatted from kebab-case)
- ✅ **Actual value** with appropriate units (ms or unitless for CLS)
- ✅ **Pass/Fail indicator** (✓ or ✗)
- ✅ **Threshold value** in parentheses
- ✅ **Visual feedback**: Green border for pass, red for fail

**Validation Logic:**
```typescript
const passed = threshold !== undefined ? value <= threshold : true;
```

**Display Format:**
```
First Contentful Paint
✓ 850ms (threshold: 1000ms)

Cumulative Layout Shift
✗ 0.075 (threshold: 0.050)
```

### 4. **Cache Status Display**

Shows if results are from cache:
```
Last run: 10/2/2025, 2:30:45 PM • Cached (42s old)
```

## Component-Level Thresholds

The panel uses strict component-level thresholds defined in `lighthouse-config.ts`:

| Metric | Threshold | Logic |
|--------|-----------|-------|
| **Performance** | ≥90 | score >= 90 |
| **Accessibility** | ≥95 | score >= 95 |
| **Best Practices** | ≥90 | score >= 90 |
| **SEO** | ≥80 | score >= 80 |
| **FCP** | ≤1000ms | value <= 1000 |
| **LCP** | ≤1500ms | value <= 1500 |
| **CLS** | ≤0.05 | value <= 0.05 |
| **TBT** | ≤100ms | value <= 100 |
| **Speed Index** | ≤1500ms | value <= 1500 |
| **Interactive** | ≤2000ms | value <= 2000 |

## Visual Feedback System

### Category Scores
- **Left border color**: Green/Orange/Red based on score
- **Score color**: Same as border
- **Threshold indicator**: ✓ (green) or ✗ (red)

### Core Web Vitals
- **Pass (✓)**: Green icon, green left border
- **Fail (✗)**: Red icon, red left border
- **Always visible**: Both passing and failing metrics shown

## Implementation Details

### TypeScript Interface
```typescript
interface LighthouseResults {
  scores: { performance, accessibility, best-practices, seo };
  thresholds?: LighthouseThresholds;  // Optional, falls back to DEFAULT_THRESHOLDS
  metrics?: { fcp, lcp, cls, tbt, speed-index, interactive };
  cached?: boolean;
  cacheAge?: number;
  // ...
}
```

### Threshold Resolution Priority
1. **Per-story thresholds** from API response (`results.thresholds`)
2. **Global thresholds** from shared config (`DEFAULT_THRESHOLDS`)

This allows stories to override thresholds via parameters while maintaining a consistent default.

### Special Formatting

**Cumulative Layout Shift (CLS):**
- Value: `.toFixed(3)` → "0.075"
- Threshold: ".050" for consistency
- No unit suffix

**Time Metrics (ms):**
- Value: `Math.round()` → "850"
- Unit suffix: "ms"
- Threshold: Plain number → "1000"

## Server Integration

The server (`server.mjs`) already includes all required metrics:
```javascript
const metricsToExtract = [
  'first-contentful-paint',
  'largest-contentful-paint',
  'cumulative-layout-shift',
  'total-blocking-time',
  'speed-index',
  'interactive',
];
```

## Benefits

✅ **Consistent Standards**: Same thresholds in UI and test runner
✅ **Visual Clarity**: Immediate feedback on pass/fail status
✅ **Component Focus**: Strict thresholds appropriate for component testing
✅ **Flexible**: Support for per-story threshold customization
✅ **Maintainable**: Single source of truth for all thresholds

## Future Enhancements

- [ ] Summary indicator showing total pass/fail count
- [ ] Highlight which specific thresholds failed
- [ ] Historical comparison with previous runs
- [ ] Trend charts for metrics over time
- [ ] Export results with threshold pass/fail data
