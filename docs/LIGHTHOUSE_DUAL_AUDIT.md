# Lighthouse Dual Audit Support (Desktop & Mobile)

## Overview

The Lighthouse runner now supports running audits for both **desktop** and **mobile** form factors in a single test run. This provides comprehensive performance metrics across different device types.

## Changes Made

### 1. lighthouse-runner.mjs
- **Updated imports**: Now imports `LIGHTHOUSE_OPTIONS_DESKTOP` and `LIGHTHOUSE_OPTIONS_MOBILE` from lighthouse-config.cjs
- **Dual audit execution**: Runs Lighthouse twice per URL - once for desktop and once for mobile
- **Extracted helper functions**:
  - `extractMetrics(lhr)`: Extracts scores, metrics, and failed audits from Lighthouse report
  - `checkThresholds(allMetrics, thresholds)`: Validates metrics against thresholds
  - `printReport(...)`: Prints formatted report for a specific form factor
- **Enhanced output**: 
  - Displays separate reports for desktop (🖥️) and mobile (📱)
  - Shows overall pass/fail status (both must pass)
  - Returns JSON with nested desktop/mobile results

### 2. test-runner-utils.ts
- **Updated result parsing**: Extracts both `desktop` and `mobile` results from the runner output
- **Enhanced result storage**: Stores separate scores for desktop and mobile
- **Improved caching**: Caches both desktop and mobile results properly

## Usage

### Basic Usage (Same thresholds for both)
```typescript
// In your .storybook/test-runner.ts or story file
await runLighthouse({
  url: 'http://localhost:6006/iframe.html?id=story-id',
  thresholds: {
    performance: 90,
    accessibility: 95,
    'best-practices': 90,
  }
});
```

### Advanced Usage (Different thresholds)
```typescript
await runLighthouse({
  url: 'http://localhost:6006/iframe.html?id=story-id',
  thresholds: {
    desktop: {
      performance: 90,
      'first-contentful-paint': 1000,
    },
    mobile: {
      performance: 75,
      'first-contentful-paint': 1800,
    }
  }
});
```

## Output Structure

### Console Output
```
🔍 Running Lighthouse audits...

🖥️  Desktop Lighthouse Report
────────────────────────────────────────────────────────────
🎯 Category Scores (0-100):
✓ performance        : 95% (threshold: 90%)
✓ accessibility      : 98% (threshold: 95%)
...

📱 Mobile Lighthouse Report
────────────────────────────────────────────────────────────
🎯 Category Scores (0-100):
✓ performance        : 78% (threshold: 75%)
✓ accessibility      : 98% (threshold: 95%)
...

════════════════════════════════════════════════════════════
✅ Overall Result: PASSED (Desktop & Mobile)
════════════════════════════════════════════════════════════
```

### JSON Output
```json
{
  "passed": true,
  "desktop": {
    "passed": true,
    "scores": {
      "performance": 95,
      "accessibility": 98,
      "first-contentful-paint": 850,
      ...
    },
    "failures": [],
    "audits": [...]
  },
  "mobile": {
    "passed": true,
    "scores": {
      "performance": 78,
      "accessibility": 98,
      "first-contentful-paint": 1650,
      ...
    },
    "failures": [],
    "audits": [...]
  },
  "lighthouseVersion": "11.x.x",
  "fetchTime": "2025-10-03T...",
  "url": "http://..."
}
```

## Configuration

The lighthouse-config.cjs exports the following configurations:

### LIGHTHOUSE_OPTIONS_DESKTOP
- **formFactor**: `desktop`
- **throttling**: Minimal (fast network, no CPU throttling)
- **screenEmulation**: 1350x940, deviceScaleFactor: 1
- **emulatedUserAgent**: Default desktop UA

### LIGHTHOUSE_OPTIONS_MOBILE
- **formFactor**: `mobile`
- **throttling**: 4G network (RTT: 150ms, throughput: ~1.6 Mbps), 4x CPU slowdown
- **screenEmulation**: 360x640, deviceScaleFactor: 2
- **emulatedUserAgent**: Android mobile device

## Default Thresholds

### Desktop (DEFAULT_THRESHOLDS)
- Performance: 90
- Accessibility: 95
- Best Practices: 90
- SEO: 80
- FCP: ≤ 1000ms
- LCP: ≤ 1500ms
- CLS: ≤ 0.05
- TBT: ≤ 100ms
- Speed Index: ≤ 1500ms
- TTI: ≤ 2000ms

### Mobile (DEFAULT_THRESHOLDS_MOBILE)
- Performance: 75
- Accessibility: 95
- Best Practices: 90
- SEO: 80
- FCP: ≤ 1800ms
- LCP: ≤ 2500ms
- CLS: ≤ 0.1
- TBT: ≤ 200ms
- Speed Index: ≤ 3400ms
- TTI: ≤ 3800ms

## Benefits

1. **Comprehensive Testing**: Single test run provides metrics for both desktop and mobile
2. **Realistic Conditions**: Desktop uses fast network, mobile uses throttled 4G
3. **Flexible Thresholds**: Can set different thresholds for desktop vs mobile
4. **Better Caching**: Caches both results, reducing redundant runs
5. **Clear Reporting**: Visual distinction between desktop and mobile results

## Migration Notes

For existing tests:
- If you pass flat thresholds (e.g., `{ performance: 90 }`), they'll be applied to both desktop and mobile
- To use different thresholds, nest them under `desktop` and `mobile` keys
- The runner now takes ~2x longer since it runs two audits, but caching mitigates this for unchanged stories

## Example Test

```typescript
import { test, expect } from '@playwright/test';

test.describe('Button Component Lighthouse', () => {
  test('should pass Lighthouse audits for desktop and mobile', async ({ page }) => {
    const result = await runLighthouse({
      url: 'http://localhost:6006/iframe.html?id=components-button--primary',
      thresholds: {
        desktop: {
          performance: 90,
          accessibility: 95,
        },
        mobile: {
          performance: 75,
          accessibility: 95,
        }
      }
    });

    expect(result.passed).toBe(true);
    expect(result.scores.desktop.performance).toBeGreaterThanOrEqual(90);
    expect(result.scores.mobile.performance).toBeGreaterThanOrEqual(75);
  });
});
```

## Troubleshooting

### Both audits fail
- Check if Storybook is running and accessible
- Verify the URL is correct
- Check if Chrome can be launched in headless mode

### Desktop passes but mobile fails
- This is expected due to mobile throttling
- Consider relaxing mobile thresholds
- Optimize for mobile performance specifically

### Tests take too long
- Ensure caching is enabled (it is by default)
- Run tests only on changed stories
- Consider running mobile audits separately for faster feedback
