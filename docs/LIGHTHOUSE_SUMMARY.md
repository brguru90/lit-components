# Lighthouse Integration Summary

## What Was Implemented

This section can be added to your main README.md to document the Lighthouse integration.

---

## 🔦 Lighthouse Integration

This project includes Google Chrome Lighthouse integration for automated performance, accessibility, best practices, and SEO auditing of Storybook components.

### Quick Start

1. **Start Storybook:**
   ```bash
   npm run storybook
   ```

2. **Run Lighthouse audits:**
   ```bash
   npm run test-storybook
   ```

3. **Run CI audit:**
   ```bash
   npm run lighthouse
   ```

### Features

- ✅ Automated Lighthouse audits for each story
- ✅ Configurable thresholds per story
- ✅ Continuous Integration support
- ✅ Detailed performance metrics
- ✅ Accessibility scoring
- ✅ Summary reports

### Configuration

Configure Lighthouse thresholds in your stories:

```typescript
export const MyStory: Story = {
  parameters: {
    lighthouse: {
      thresholds: {
        performance: 90,
        accessibility: 100,
        'best-practices': 85,
        seo: 75,
      },
    },
  },
};
```

### Documentation

- [Quick Start Guide](./docs/LIGHTHOUSE_QUICKSTART.md)
- [Full Documentation](./docs/LIGHTHOUSE.md)
- [CI/CD Integration](./.github/workflows/lighthouse.yml)

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run test-storybook` | Run Lighthouse on all stories |
| `npm run test-storybook:watch` | Run in watch mode |
| `npm run lighthouse` | Run full CI audit |
| `npm run lighthouse:server` | Start Lighthouse CI server |

---

## Files Created/Modified

### New Files
1. `.storybook/test-runner.ts` - Test runner with Lighthouse integration
2. `lighthouserc.json` - Lighthouse CI configuration
3. `docs/LIGHTHOUSE.md` - Comprehensive documentation
4. `docs/LIGHTHOUSE_QUICKSTART.md` - Quick start guide
5. `.github/workflows/lighthouse.yml` - GitHub Actions workflow

### Modified Files
1. `package.json` - Added Lighthouse scripts and dependencies
2. `stories/Button.stories.ts` - Added example Lighthouse configurations
3. `.gitignore` - Added Lighthouse output directories

### Dependencies Added
- `@storybook/test-runner` - Storybook test runner
- `lighthouse` - Google Lighthouse
- `chrome-launcher` - Chrome automation
- `@lhci/cli` - Lighthouse CI CLI

## Example Output

```
📊 Lighthouse Report for: Components/Button/Primary
────────────────────────────────────────────────────────────
✓ performance       : 92% (threshold: 90%)
✓ accessibility     : 100% (threshold: 100%)
✓ best-practices    : 95% (threshold: 90%)
✓ seo              : 85% (threshold: 80%)

✅ All thresholds passed!
```
