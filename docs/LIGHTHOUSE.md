# Lighthouse Integration with Storybook

This project integrates Google Chrome Lighthouse metrics into Storybook, allowing you to audit performance, accessibility, best practices, and SEO for each component story.

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Running Lighthouse Tests](#running-lighthouse-tests)
- [Configuration](#configuration)
- [Per-Story Configuration](#per-story-configuration)
- [CI/CD Integration](#cicd-integration)
- [Understanding Results](#understanding-results)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The Lighthouse integration provides two main approaches:

1. **Test Runner Integration** - Run Lighthouse audits on individual stories during testing
2. **Lighthouse CI** - Batch audit multiple stories for CI/CD pipelines

## 🚀 Quick Start

### Prerequisites

Make sure Storybook is running:

```bash
npm run storybook
```

### Run Lighthouse on All Stories

In a new terminal, run the test runner with Lighthouse:

```bash
npm run test-storybook
```

This will:
- Open each story in a headless Chrome browser
- Run Lighthouse audits on each story
- Compare scores against configured thresholds
- Print detailed reports for each story
- Generate a summary report at the end

## 🧪 Running Lighthouse Tests

### Option 1: Test Runner (Development)

Run Lighthouse audits on all stories:

```bash
npm run test-storybook
```

Run in watch mode (re-run on file changes):

```bash
npm run test-storybook:watch
```

### Option 2: Lighthouse CI (Production/CI)

Run full Lighthouse CI audit:

```bash
npm run lighthouse
```

This will:
1. Build your Storybook (`npm run build-storybook`)
2. Run Lighthouse audits on configured URLs
3. Generate detailed reports
4. Upload results to temporary storage

## ⚙️ Configuration

### Global Configuration

Default thresholds are set in `.storybook/test-runner.ts`:

```typescript
const DEFAULT_THRESHOLDS = {
  performance: 70,
  accessibility: 90,
  'best-practices': 80,
  seo: 70,
};
```

### Lighthouse CI Configuration

Edit `lighthouserc.json` to customize CI behavior:

```json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:6006/iframe.html?id=components-button--primary"
      ]
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", {"minScore": 0.8}],
        "categories:accessibility": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

## 📝 Per-Story Configuration

### Custom Thresholds

Set custom thresholds for specific stories:

```typescript
export const Primary: Story = {
  args: {
    variant: 'primary',
  },
  parameters: {
    lighthouse: {
      thresholds: {
        performance: 90,
        accessibility: 100,
        'best-practices': 90,
        seo: 80,
      },
    },
  },
};
```

### Skip Lighthouse for Specific Stories

Disable Lighthouse for certain stories:

```typescript
export const Loading: Story = {
  args: {
    loading: true,
  },
  parameters: {
    lighthouse: {
      enabled: false, // Skip Lighthouse for this story
    },
  },
};
```

### Example: Button Component

```typescript
export const AccessibleButton: Story = {
  args: {
    variant: 'primary',
  },
  render: (args) => html`
    <vg-button 
      variant="${args.variant}"
      aria-label="Click me"
    >
      Accessible Button
    </vg-button>
  `,
  parameters: {
    lighthouse: {
      thresholds: {
        accessibility: 100, // Strict accessibility requirement
        performance: 95,    // High performance requirement
      },
      printReport: true,    // Print detailed report
    },
  },
};
```

## 🔄 CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/lighthouse.yml`:

```yaml
name: Lighthouse CI

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build Storybook
        run: npm run build-storybook
        
      - name: Run Lighthouse CI
        run: npm run lighthouse
        
      - name: Upload Lighthouse Results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: lighthouse-results
          path: .lighthouseci/
```

### GitLab CI Example

Add to `.gitlab-ci.yml`:

```yaml
lighthouse:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm run build-storybook
    - npm run lighthouse
  artifacts:
    paths:
      - .lighthouseci/
    expire_in: 1 week
```

## 📊 Understanding Results

### Console Output

For each story, you'll see a report like:

```
📊 Lighthouse Report for: Components/Button/Primary
────────────────────────────────────────────────────────────
✓ performance       : 92% (threshold: 90%)
✓ accessibility     : 100% (threshold: 100%)
✓ best-practices    : 95% (threshold: 90%)
✓ seo              : 85% (threshold: 80%)

✅ All thresholds passed!
```

### Summary Report

At the end of all tests:

```
============================================================
📊 LIGHTHOUSE AUDIT SUMMARY
============================================================

Total Stories: 15
✅ Passed: 14
❌ Failed: 1

❌ Failed Stories:

  - Components/Card/WithImage
    performance: 68%
    accessibility: 92%
    best-practices: 85%
    seo: 75%

============================================================
```

### Metrics Explained

- **Performance (0-100)**: Load time, interactivity, visual stability
  - First Contentful Paint (FCP)
  - Largest Contentful Paint (LCP)
  - Total Blocking Time (TBT)
  - Cumulative Layout Shift (CLS)

- **Accessibility (0-100)**: ARIA labels, contrast ratios, keyboard navigation

- **Best Practices (0-100)**: HTTPS, console errors, deprecated APIs

- **SEO (0-100)**: Meta tags, crawlability, mobile-friendliness

## 🐛 Troubleshooting

### Issue: "Chrome failed to launch"

**Solution**: Install Chrome dependencies (Linux):

```bash
sudo apt-get install -y \
  libnss3 \
  libatk-bridge2.0-0 \
  libdrm2 \
  libxkbcommon0 \
  libgbm1 \
  libasound2
```

### Issue: "Port 6006 already in use"

**Solution**: Make sure Storybook is running:

```bash
npm run storybook
```

Then run tests in a separate terminal.

### Issue: Tests are slow

**Solution**: 

1. Reduce the number of stories being tested
2. Skip non-critical stories:

```typescript
parameters: {
  lighthouse: {
    enabled: false,
  },
}
```

3. Run tests on specific stories:

```bash
test-storybook --stories "components-button--*"
```

### Issue: Scores vary between runs

**Solution**: Lighthouse CI runs multiple iterations (default: 3) and averages results. Configure in `lighthouserc.json`:

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 5
    }
  }
}
```

### Issue: Low performance scores

**Common causes**:
- Large bundle sizes
- Unoptimized images
- Blocking scripts
- Missing caching headers

**Solution**: Check the detailed Lighthouse report for specific recommendations.

## 📚 Additional Resources

- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Storybook Test Runner](https://storybook.js.org/docs/react/writing-tests/test-runner)
- [Web Vitals](https://web.dev/vitals/)

## 🎯 Best Practices

1. **Set Realistic Thresholds**: Start with lower thresholds and gradually increase them
2. **Focus on Critical Stories**: Enable Lighthouse only for important user-facing components
3. **Monitor Trends**: Track scores over time to catch regressions
4. **Accessibility First**: Maintain 100% accessibility score for all components
5. **Performance Budget**: Set performance budgets early in development
6. **CI Integration**: Run Lighthouse on every PR to catch issues early

## 💡 Tips

- Use `printReport: true` during development for detailed metrics
- Create baseline reports before making changes
- Focus on Core Web Vitals (LCP, FID, CLS) for performance
- Use Lighthouse's suggestions to improve scores
- Test both light and dark themes if applicable
- Consider mobile performance with device emulation

## 🤝 Contributing

When adding new stories:

1. Add appropriate Lighthouse thresholds
2. Ensure accessibility score is 100%
3. Test on both desktop and mobile viewports
4. Document any threshold exceptions

## 📄 License

Same as the main project.
