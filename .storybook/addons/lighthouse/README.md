# Lighthouse Storybook Addon

A custom Storybook addon that displays Google Lighthouse metrics directly in the Storybook UI, similar to the Interactions panel.

## Features

- 🔦 **Visual Lighthouse Metrics**: Display performance, accessibility, best practices, and SEO scores
- 📊 **Interactive Panel**: Run audits on-demand from within Storybook
- 🎨 **Beautiful UI**: Color-coded scores with thresholds
- ⚡ **Core Web Vitals**: Display FCP, LCP, CLS, TBT, and Speed Index
- ❌ **Failed Audits**: Show which audits failed and why
- 🔄 **Real-time**: Re-run audits anytime with a single click
- 🔁 **Smart Caching**: Cached results with 5-minute TTL, option to skip cache
- 📐 **Shared Thresholds**: Synced thresholds between test runner and UI panel
- 🚀 **Auto-start**: API server starts automatically with Storybook

## Configuration

### Shared Thresholds

Lighthouse thresholds are defined in a shared configuration file:

```
.storybook/lighthouse-config.ts
```

This ensures consistency between:
- **Test Runner** (`test-runner.ts`) - Automated testing
- **Storybook Addon Panel** (`Panel.tsx`) - Visual display

**Component-level thresholds** (stricter than Google's page-level recommendations):
- Performance: 90 (vs 70 for pages)
- Accessibility: 95 (vs 90 for pages)
- Best Practices: 90 (vs 80 for pages)
- FCP: ≤ 1000ms (vs 2000ms for pages)
- LCP: ≤ 1500ms (vs 2500ms for pages)
- CLS: ≤ 0.05 (vs 0.1 for pages)

See [THRESHOLDS.md](./THRESHOLDS.md) for detailed explanation.

### Customizing Per Story

Override thresholds for specific stories:

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

## How It Works

The addon consists of three main parts:

1. **Panel.tsx**: The React component that displays the Lighthouse metrics in the Storybook UI
2. **register.tsx**: Registers the addon panel with Storybook
3. **preview.ts**: Handles running Lighthouse audits and communicating with the panel

## Installation

The addon is already installed and configured in this project!

## Usage

### Viewing Lighthouse Metrics

1. Open any story in Storybook
2. Look for the "Lighthouse" tab in the addons panel (bottom panel, next to "Actions", "Controls", etc.)
3. Click "Run Lighthouse Audit" to run an audit on the current story
4. View the results:
   - **Core Metrics**: Performance, Accessibility, Best Practices, SEO scores
   - **Performance Metrics**: FCP, LCP, CLS, TBT, Speed Index
   - **Failed Audits**: List of audits that didn't pass

### Running Audits

- **Manual**: Click the "Run Lighthouse Audit" button in the panel
- **Re-run**: Click "Re-run Audit" to refresh the metrics

## Current Implementation

### Demo Mode

Currently, the addon is running in **demo mode** with simulated Lighthouse results. This allows you to see how the UI works without requiring a backend service.

The simulated results include:
- Random scores between 70-100 for performance
- Random scores between 80-100 for accessibility
- Random Core Web Vitals metrics
- Occasional failed audits for demonstration

### Production Mode

To use real Lighthouse audits, you need to set up a backend service:

#### Option 1: Create a Backend API

Create an endpoint at `/api/lighthouse` that:
1. Receives a POST request with `{ url: string }`
2. Runs Lighthouse using `lighthouse` npm package
3. Returns the results in the expected format

Example Node.js/Express endpoint:

```javascript
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

app.post('/api/lighthouse', async (req, res) => {
  const { url } = req.body;
  
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless']
  });
  
  const options = {
    logLevel: 'info',
    output: 'json',
    port: chrome.port,
  };
  
  const runnerResult = await lighthouse(url, options);
  const { lhr } = runnerResult;
  
  const results = {
    scores: {
      performance: Math.round(lhr.categories.performance.score * 100),
      accessibility: Math.round(lhr.categories.accessibility.score * 100),
      'best-practices': Math.round(lhr.categories['best-practices'].score * 100),
      seo: Math.round(lhr.categories.seo.score * 100),
    },
    metrics: {
      'first-contentful-paint': lhr.audits['first-contentful-paint'].numericValue,
      'largest-contentful-paint': lhr.audits['largest-contentful-paint'].numericValue,
      // ... more metrics
    },
    timestamp: new Date().toISOString(),
    url,
  };
  
  await chrome.kill();
  res.json(results);
});
```

#### Option 2: Use Lighthouse CI Server

Integrate with your existing Lighthouse CI server to fetch historical results.

## UI Components

### Core Metrics Grid
Displays the four main Lighthouse categories with color-coded scores:
- 🟢 Green (90-100): Good
- 🟠 Orange (50-89): Needs Improvement
- 🔴 Red (0-49): Poor

### Performance Metrics
Shows detailed Core Web Vitals:
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Total Blocking Time (TBT)
- Speed Index

### Failed Audits
Lists audits that didn't pass with:
- ✗ Red indicator for failures
- ✓ Green indicator for passes
- Description of what needs to be fixed

## Customization

### Modify Thresholds

Update the thresholds in `preview.ts`:

```typescript
thresholds: {
  performance: 90,      // Your threshold
  accessibility: 100,   // Your threshold
  'best-practices': 85,
  seo: 80,
}
```

### Customize UI

Modify `Panel.tsx` to change:
- Colors: Update the color logic in `MetricScore` and `MetricCard`
- Layout: Change the `MetricsGrid` columns
- Content: Add or remove sections

## File Structure

```
.storybook/
├── lighthouse-config.ts           # Shared thresholds configuration
├── test-runner.ts                 # Uses shared thresholds for testing
└── addons/lighthouse/
    ├── Panel.tsx                  # Main UI component (uses shared thresholds)
    ├── register.tsx               # Addon registration
    ├── server.mjs                 # Express API server with caching
    ├── THRESHOLDS.md             # Threshold documentation
    └── README.md                  # This file
```

## Troubleshooting

### Panel doesn't appear
- Check that the addon is registered in `.storybook/main.ts`
- Ensure preview.ts is imported in `.storybook/preview.tsx`
- Restart Storybook

### "Run Lighthouse Audit" does nothing
- Check browser console for errors
- Verify the channel communication is working
- In demo mode, results should appear immediately

### Backend API not working
- Check the `/api/lighthouse` endpoint is accessible
- Verify CORS is configured if API is on a different domain
- Check that Lighthouse dependencies are installed on the backend

## Future Enhancements

- [ ] Real-time Lighthouse integration
- [ ] Historical trend charts
- [ ] Comparison between stories
- [ ] Export results
- [ ] Integration with Lighthouse CI server
- [ ] Custom audit configuration per story
- [ ] Automated audits on story changes

## Contributing

To improve this addon:

1. **Add more metrics**: Extend `LighthouseResults` interface
2. **Enhance UI**: Add charts, graphs, or visualizations
3. **Backend integration**: Connect to real Lighthouse service
4. **Performance**: Cache results to avoid re-running audits
5. **Configuration**: Add per-story audit configuration

## License

Same as the main project.
