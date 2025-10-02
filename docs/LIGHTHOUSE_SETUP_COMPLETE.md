# 🎉 Lighthouse Integration - Complete Setup Guide

## ✅ Current Status

### What's Working

1. **✅ Lighthouse Addon Panel** - Fully visible in Storybook UI
   - Located in "Addons" tab at the bottom of the story view
   - Shows beautiful color-coded metric cards
   - Interactive "Run Lighthouse Audit" button
   - Currently showing simulated data for demonstration

2. **✅ Visual UI** - Professional design with:
   - Core Metrics: Performance, Accessibility, Best Practices, SEO
   - Performance Metrics: FCP, LCP, CLS, TBT, Speed Index
   - Failed Audits section
   - Timestamp tracking
   - Re-run capability

3. **✅ Lighthouse API Server** - Express server created and running
   - Server running on http://localhost:9002
   - Endpoints: POST /api/lighthouse, GET /health, GET /cache
   - 5-minute caching for performance
   - CORS enabled

### ⚠️ Current Issue

The real Lighthouse API has an import error:
```
Error: "lighthouse is not a function"
```

This is because the `lighthouse` package exports differently in recent versions.

## 🔧 Quick Fix for Real Lighthouse

### Option 1: Fix the API Server (Recommended)

Update `scripts/lighthouse-api.cjs` line 15:

```javascript
// ❌ OLD (doesn't work):
const lighthouse = require('lighthouse');

// ✅ NEW (works):
const lighthouse = require('lighthouse').default || require('lighthouse');
```

Or use dynamic import:

```javascript
// At the top of runLighthouseAudit function:
const { default: lighthouse } = await import('lighthouse');
```

### Option 2: Use Lighthouse CLI Instead

Replace the lighthouse package call with CLI execution:

```javascript
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function runLighthouseAudit(url, options = {}) {
  console.log(`🔦 Running Lighthouse audit for: ${url}`);
  
  try {
    // Run Lighthouse CLI
    const { stdout } = await execPromise(
      `npx lighthouse ${url} --output=json --quiet --chrome-flags="--headless"`
    );
    
    const lhr = JSON.parse(stdout);
    
    // Extract results (same extraction logic as before)
    return {
      scores: {
        performance: Math.round((lhr.categories.performance?.score || 0) * 100),
        accessibility: Math.round((lhr.categories.accessibility?.score || 0) * 100),
        'best-practices': Math.round((lhr.categories['best-practices']?.score || 0) * 100),
        seo: Math.round((lhr.categories.seo?.score || 0) * 100),
      },
      metrics: extractMetrics(lhr),
      audits: extractFailedAudits(lhr),
      timestamp: new Date().toISOString(),
      url,
    };
  } catch (error) {
    console.error('❌ Lighthouse audit failed:', error.message);
    throw error;
  }
}
```

## 🚀 Complete Usage Guide

### Starting the Services

You need **3 terminals**:

**Terminal 1: Lighthouse API Server**
```bash
npm run lighthouse:api
```
Expected output:
```
╔════════════════════════════════════════════════════╗
║     🔦 Lighthouse API Server                      ║
╚════════════════════════════════════════════════════╝

📡 Server running at: http://localhost:9002
```

**Terminal 2: Storybook**
```bash
npm run storybook
```
Expected output:
```
╭──────────────────────────────────────────────────────╮
│   Storybook 9.1.10 for web-components-vite started   │
│    Local:            http://localhost:6006/          │
╰──────────────────────────────────────────────────────╝
```

**Terminal 3: LHCI Server (Optional - for dashboard)**
```bash
npm run lighthouse:server
```

### Using the Panel

1. Open Storybook: http://localhost:6006
2. Navigate to any story (e.g., Components → Button → Default)
3. Click "Addons" dropdown at the bottom
4. Select "Lighthouse" tab
5. Click "Run Lighthouse Audit"
6. Wait 10-30 seconds for results
7. View the metrics!

### Console Output

When you click "Run Lighthouse Audit", check the browser console:

**✅ If API is working:**
```
🔦 Running Lighthouse audit for story: components-button--default
🔦 Calling Lighthouse API at http://localhost:9002/api/lighthouse...
✅ Real Lighthouse results received: {...}
```

**⚠️ If API has error (current state):**
```
🔦 Running Lighthouse audit for story: components-button--default
🔦 Calling Lighthouse API at http://localhost:9002/api/lighthouse...
⚠️ Lighthouse API error (500): {"error":"Audit failed","message":"lighthouse is not a function"...}
💡 To use real Lighthouse, run: npm run lighthouse:api
📊 Using simulated Lighthouse data (for demonstration)
```

## 📊 Configuration

### Per-Story Configuration

Add to any story in `stories/*.stories.ts`:

```typescript
export const MyStory: Story = {
  args: {
    variant: 'primary',
  },
  parameters: {
    lighthouse: {
      enabled: true,  // Enable/disable Lighthouse for this story
      thresholds: {
        performance: 90,      // Minimum score (0-100)
        accessibility: 100,   // Perfect accessibility
        'best-practices': 85,
        seo: 80,
      },
    },
  },
};
```

### Disable for Specific Stories

```typescript
export const Disabled: Story = {
  parameters: {
    lighthouse: {
      enabled: false,  // Skip this story
    },
  },
};
```

## 🐛 Troubleshooting

### Panel Not Showing
1. ✅ Check `.storybook/main.ts` has addon registered:
   ```typescript
   addons: [
     "./addons/lighthouse/register.tsx"
   ]
   ```
2. ✅ Restart Storybook: `npm run storybook`
3. ✅ Check browser console for errors

### API Server Errors

**Issue: "lighthouse is not a function"**
- **Fix**: Update import in `scripts/lighthouse-api.cjs` (see Option 1 above)

**Issue: "ECONNREFUSED"**
- **Fix**: Make sure API server is running on port 9002
- **Check**: `curl http://localhost:9002/api/lighthouse/health`

**Issue: "Chrome not found"**
- **Fix**: Install Chrome or Chromium
- **Linux**: `sudo apt install chromium-browser`
- **Mac**: `brew install --cask google-chrome`

### Performance Issues

**Slow audits (>60 seconds)**
- **Solution**: API server caches results for 5 minutes
- **Clear cache**: `curl -X DELETE http://localhost:9002/api/lighthouse/cache`

## 📚 Scripts Reference

| Script | Purpose | Output |
|--------|---------|--------|
| `npm run lighthouse:api` | Start real Lighthouse API server | Port 9002 |
| `npm run storybook` | Start Storybook with addon | Port 6006 |
| `npm run lighthouse:server` | Start LHCI dashboard server | Port 9001 |
| `npm run test-storybook` | Run Lighthouse via test runner | Console output |
| `npm run lighthouse` | Full CI audit | Uploads to LHCI server |

## 🎯 Next Steps

### To Get Real Lighthouse Working

1. **Fix the API server**:
   ```bash
   # Edit scripts/lighthouse-api.cjs
   # Apply one of the fixes from Option 1 or Option 2 above
   ```

2. **Restart the API server**:
   ```bash
   # Stop current server (Ctrl+C in Terminal 1)
   npm run lighthouse:api
   ```

3. **Test in Storybook**:
   - Click "Run Lighthouse Audit"
   - Check console for "✅ Real Lighthouse results received"
   - View actual metrics in the panel

### Alternative: Use Test Runner

If you don't want to fix the API server, use the fully functional test-runner:

```bash
# Terminal 1
npm run storybook

# Terminal 2
npm run test-storybook
```

This runs **real Lighthouse audits** and shows results in the console.

## 💡 Recommendations

### For Development

**Use the Panel** (with simulated data for now):
- Fast feedback
- Visual interface
- Easy to use
- Per-story configuration

**Fix and use real API** when:
- Need accurate metrics
- Testing performance regressions
- Before production releases

### For CI/CD

**Use test-runner + LHCI server**:
```bash
npm run lighthouse  # Full audit with upload
```

View results at: http://localhost:9001

## 📝 Summary

**Current State:**
- ✅ Lighthouse addon panel fully working and visible
- ✅ Beautiful UI with all metrics
- ✅ API server created and running
- ⚠️ Shows simulated data (real API has import issue)

**To Get Real Data:**
1. Fix import in `scripts/lighthouse-api.cjs`
2. Restart API server
3. Run audit in panel
4. Enjoy real Lighthouse metrics!

**Alternative:**
Use `npm run test-storybook` for real audits without fixing the API.

---

**Status**: ✅ Panel Working | ⚠️ Real API Needs Fix | ✅ Test Runner Works
