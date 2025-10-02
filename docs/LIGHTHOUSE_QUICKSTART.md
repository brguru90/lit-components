# Lighthouse Integration - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Start Storybook

```bash
npm run storybook
```

Leave this running in one terminal.

### Step 2: Run Lighthouse Tests

Open a new terminal and run:

```bash
npm run test-storybook
```

You'll see output like this:

```
📊 Lighthouse Report for: Components/Button/Primary
────────────────────────────────────────────────────────────
✓ performance       : 92% (threshold: 70%)
✓ accessibility     : 100% (threshold: 90%)
✓ best-practices    : 95% (threshold: 80%)
✓ seo              : 85% (threshold: 70%)

✅ All thresholds passed!
```

### Step 3: Customize Thresholds (Optional)

Add Lighthouse configuration to your stories:

```typescript
export const MyStory: Story = {
  args: { /* your args */ },
  parameters: {
    lighthouse: {
      thresholds: {
        performance: 90,      // Require 90% or higher
        accessibility: 100,   // Perfect accessibility score
        'best-practices': 85,
        seo: 75,
      },
    },
  },
};
```

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run test-storybook` | Run Lighthouse on all stories |
| `npm run test-storybook:watch` | Run in watch mode |
| `npm run lighthouse` | Run full CI audit (builds Storybook first) |

## 🎯 Common Use Cases

### Skip Lighthouse for a Story

```typescript
export const LoadingState: Story = {
  parameters: {
    lighthouse: {
      enabled: false, // Skip this story
    },
  },
};
```

### High Performance Requirements

```typescript
export const CriticalComponent: Story = {
  parameters: {
    lighthouse: {
      thresholds: {
        performance: 95,
        accessibility: 100,
      },
    },
  },
};
```

### View Detailed Reports

After running Lighthouse CI:

```bash
npm run lighthouse
```

Reports are saved in `.lighthouseci/` directory.

## 🐛 Troubleshooting

**Issue**: "Cannot connect to Storybook"  
**Solution**: Make sure Storybook is running (`npm run storybook`)

**Issue**: Tests are slow  
**Solution**: Skip non-critical stories by adding `enabled: false`

**Issue**: Chrome won't launch  
**Solution**: On Linux, install Chrome dependencies:
```bash
sudo apt-get install -y libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 libgbm1
```

## 📚 Learn More

See the [full documentation](./LIGHTHOUSE.md) for:
- CI/CD integration
- Advanced configuration
- Understanding metrics
- Best practices

## 💡 Tips

- Start with default thresholds and increase gradually
- Focus on accessibility (aim for 100%)
- Use in CI/CD to catch performance regressions
- Test both light and dark themes
- Monitor trends over time

---

**Next Steps:**
1. Run your first Lighthouse audit
2. Review the results
3. Set appropriate thresholds for your components
4. Add to your CI/CD pipeline
