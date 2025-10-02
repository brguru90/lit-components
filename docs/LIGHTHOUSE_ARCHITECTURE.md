# Lighthouse Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         STORYBOOK STORIES                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Button     │  │    Card      │  │   Input      │  ...        │
│  │   Stories    │  │   Stories    │  │   Stories    │             │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │
│         │                 │                 │                       │
│         │    Lighthouse   │    Lighthouse   │    Lighthouse         │
│         │    Parameters   │    Parameters   │    Parameters         │
│         └─────────────────┴─────────────────┘                       │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        │         LIGHTHOUSE INTEGRATION        │
        │                                       │
        └───────────────────┬───────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
   ┌────▼────┐                          ┌──────▼──────┐
   │  TEST   │                          │ LIGHTHOUSE  │
   │ RUNNER  │                          │     CI      │
   │         │                          │             │
   └────┬────┘                          └──────┬──────┘
        │                                      │
        │ Development Mode                     │ CI/CD Mode
        │ (npm run test-storybook)             │ (npm run lighthouse)
        │                                      │
   ┌────▼──────────────────────┐         ┌────▼──────────────────────┐
   │  1. Start Storybook       │         │  1. Build Storybook       │
   │  2. Visit each story      │         │  2. Start static server   │
   │  3. Run Lighthouse        │         │  3. Run Lighthouse        │
   │  4. Check thresholds      │         │  4. Generate reports      │
   │  5. Report results        │         │  5. Upload results        │
   └───────────┬───────────────┘         └───────────┬───────────────┘
               │                                     │
               │                                     │
        ┌──────▼──────────────────────────────────────▼──────┐
        │                                                     │
        │               LIGHTHOUSE CHROME                     │
        │                                                     │
        │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
        │  │Performance│  │Accessibility│  │Best      │        │
        │  │  Score    │  │   Score    │  │Practices │        │
        │  └──────────┘  └──────────┘  └──────────┘        │
        │                                                     │
        │  ┌──────────┐  ┌──────────────────────────────┐  │
        │  │   SEO    │  │     Core Web Vitals:         │  │
        │  │  Score   │  │  - LCP, FID, CLS, FCP, TBT   │  │
        │  └──────────┘  └──────────────────────────────┘  │
        │                                                     │
        └──────────┬──────────────────────────────────────────┘
                   │
                   │
        ┌──────────▼──────────────────────────────────────────┐
        │                                                      │
        │                    RESULTS                           │
        │                                                      │
        │  ┌────────────────┐      ┌────────────────┐        │
        │  │   Console      │      │    Reports     │        │
        │  │   Output       │      │   (.html/.json)│        │
        │  └────────────────┘      └────────────────┘        │
        │                                                      │
        │  ┌────────────────┐      ┌────────────────┐        │
        │  │  Test Pass/    │      │   CI Upload    │        │
        │  │     Fail       │      │  (Artifacts)   │        │
        │  └────────────────┘      └────────────────┘        │
        │                                                      │
        └──────────────────────────────────────────────────────┘
```

## Flow Diagram

### Development Workflow
```
Developer writes story
       ↓
Adds lighthouse parameters (optional)
       ↓
Runs `npm run test-storybook`
       ↓
Test runner visits each story
       ↓
Lighthouse audits each story
       ↓
Results printed to console
       ↓
Test passes/fails based on thresholds
```

### CI/CD Workflow
```
Push code to repository
       ↓
GitHub Actions triggered
       ↓
Install dependencies
       ↓
Build Storybook (static)
       ↓
Run Lighthouse CI
       ↓
Generate detailed reports
       ↓
Upload artifacts
       ↓
Comment on PR (optional)
       ↓
Pass/Fail CI check
```

## Component Integration

```typescript
// stories/Button.stories.ts

export const Primary: Story = {
  args: { variant: 'primary' },
  parameters: {
    lighthouse: {                    // ← Lighthouse configuration
      thresholds: {                  // ← Custom thresholds
        performance: 90,             // ← Must score 90% or higher
        accessibility: 100,          // ← Perfect accessibility
        'best-practices': 85,        // ← 85% or higher
        seo: 75                      // ← 75% or higher
      }
    }
  }
}
```

## File Structure

```
lit-components/
├── .storybook/
│   ├── test-runner.ts          # Test runner with Lighthouse integration
│   └── lighthouse.d.ts          # TypeScript definitions
├── .github/
│   └── workflows/
│       └── lighthouse.yml       # GitHub Actions workflow
├── docs/
│   ├── LIGHTHOUSE.md            # Full documentation
│   ├── LIGHTHOUSE_QUICKSTART.md # Quick start guide
│   └── LIGHTHOUSE_SUMMARY.md    # Implementation summary
├── lighthouserc.json            # Lighthouse CI configuration
└── package.json                 # Scripts and dependencies
```

## Configuration Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                    Global Defaults                          │
│         (.storybook/test-runner.ts)                         │
│                                                             │
│  performance: 70, accessibility: 90,                        │
│  best-practices: 80, seo: 70                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Can be overridden by ↓
                       │
┌──────────────────────▼──────────────────────────────────────┐
│               Per-Story Configuration                        │
│            (parameters.lighthouse)                           │
│                                                             │
│  Story-specific thresholds take precedence                  │
│  Can disable Lighthouse for specific stories                │
└─────────────────────────────────────────────────────────────┘
```

## Metrics Flow

```
Story Rendered
     ↓
Lighthouse Chrome Launches
     ↓
┌────────────────────────────────┐
│   Lighthouse Audit Phases      │
├────────────────────────────────┤
│ 1. Navigation                  │
│    └─ Load the story URL       │
├────────────────────────────────┤
│ 2. Gathering                   │
│    └─ Collect metrics          │
│       └─ Network requests      │
│       └─ JavaScript execution  │
│       └─ DOM analysis          │
│       └─ Accessibility checks  │
├────────────────────────────────┤
│ 3. Auditing                    │
│    └─ Run performance audits   │
│    └─ Check accessibility      │
│    └─ Validate best practices  │
│    └─ SEO checks               │
├────────────────────────────────┤
│ 4. Scoring                     │
│    └─ Calculate scores (0-100) │
└────────────────────────────────┘
     ↓
Compare with thresholds
     ↓
Generate report
     ↓
Pass/Fail decision
```
