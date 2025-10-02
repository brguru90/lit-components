# Lighthouse Addon - Auto-Start Setup Complete! 🎉

## What Changed?

The Lighthouse API server now **starts automatically** when you run Storybook! 

### Before (Manual)
```bash
# Terminal 1: Start Storybook
npm run storybook

# Terminal 2: Start Lighthouse API (had to remember this!)
npm run lighthouse:api
```

### Now (Automatic) ✨
```bash
# Just start Storybook - that's it!
npm run storybook

# Output:
# 🔦 Lighthouse API server started at http://localhost:9002
# Storybook 9.1.10 for web-components-vite started
# ✅ Both running!
```

## How It Works

### Architecture
```
┌──────────────────────────────────┐
│  You run: npm run storybook      │
└───────────────┬──────────────────┘
                ↓
┌──────────────────────────────────┐
│  Storybook starts                │
│  (.storybook/main.ts)            │
└───────────────┬──────────────────┘
                ↓
┌──────────────────────────────────┐
│  viteFinal() hook runs           │
│  Imports server.mjs              │
└───────────────┬──────────────────┘
                ↓
┌──────────────────────────────────┐
│  Lighthouse API server starts    │
│  on port 9002                    │
└───────────────┬──────────────────┘
                ↓
┌──────────────────────────────────┐
│  ✅ Everything ready!            │
│  • Storybook UI: :6006           │
│  • Lighthouse API: :9002         │
└──────────────────────────────────┘
```

### Files Changed

1. **`.storybook/addons/lighthouse/server.mjs`** (NEW)
   - Express server for Lighthouse API
   - Launches Chrome and runs audits
   - Has caching (5 min)

2. **`.storybook/main.ts`** (UPDATED)
   - Added `viteFinal()` hook
   - Imports and starts `server.mjs`
   - Only in development mode

3. **`.storybook/addons/lighthouse/preview.ts`** (UPDATED)
   - Removed simulated data fallback
   - Now shows real errors if API is down

## Usage

### 1. Start Storybook
```bash
npm run storybook
```

You'll see:
```
🔦 Lighthouse API server started at http://localhost:9002

Storybook 9.1.10 for web-components-vite started
http://localhost:6006/
```

### 2. Open Storybook in Browser
Navigate to http://localhost:6006

### 3. Select Any Story
Example: Components → Button → Default

### 4. Click "Lighthouse" Tab
In the addons panel at the bottom

### 5. Click "Run Lighthouse Audit"
Watch it work:
```
🔦 Running Lighthouse audit for: http://localhost:6006/...
✅ Audit complete - Performance: 95, Accessibility: 98
```

### 6. View Results
- **Scores**: Performance, Accessibility, Best Practices, SEO
- **Metrics**: FCP, LCP, CLS, TBT, Speed Index
- **Failed Audits**: Issues to fix

## Features

### ✅ Automatic Startup
- No manual server start needed
- Starts with Storybook
- Stops with Storybook

### ✅ Smart Caching
- Results cached for 5 minutes
- Instant repeat audits
- Reduces Chrome launches

### ✅ Error Handling
- Clear error messages
- Shows how to fix issues
- Graceful degradation

### ✅ Real Metrics
- Fresh Chrome instance per audit
- Accurate performance data
- Clean browser state

## API Endpoints

The server exposes these endpoints:

### Run Audit
```bash
POST http://localhost:9002/api/lighthouse
Content-Type: application/json

{
  "url": "http://localhost:6006/?path=/story/components-button--default"
}
```

### Health Check
```bash
GET http://localhost:9002/api/lighthouse/health
```

### Clear Cache
```bash
DELETE http://localhost:9002/api/lighthouse/cache
```

## Troubleshooting

### Port Already in Use
If you see:
```
⚠️ Port 9002 already in use - Lighthouse API may already be running
```

**Solution**: Kill the process using port 9002
```bash
# Find process
lsof -i :9002

# Kill it
kill -9 <PID>

# Restart Storybook
npm run storybook
```

### Chrome Launch Fails
If audits fail with Chrome errors:

**Solution**: Install Chrome/Chromium
```bash
# Ubuntu/Debian
sudo apt install chromium-browser

# macOS
brew install --cask google-chrome

# Or use the chrome-launcher with custom path
```

### Audit Takes Too Long
If audits timeout:

**Possible causes**:
- Heavy page (lots of assets)
- Slow network
- Limited system resources

**Solutions**:
- Use cached results (< 5 min old)
- Optimize component bundle size
- Close other Chrome instances

## Manual Server Start (Optional)

If you want to run the server separately:

```bash
# Option 1: Using npm script (old way)
npm run lighthouse:api

# Option 2: Direct node execution
node scripts/lighthouse-api.mjs

# Option 3: Using the new server file
node .storybook/addons/lighthouse/server.mjs
```

## Architecture Details

See [LIGHTHOUSE_ARCHITECTURE_EXPLAINED.md](./LIGHTHOUSE_ARCHITECTURE_EXPLAINED.md) for:
- Why Lighthouse needs a separate Chrome instance
- Why it can't run in the browser like tests
- How the auto-start mechanism works
- Performance considerations
- Comparison with Storybook interaction tests

## What's Next?

### Improvements You Can Make

1. **Custom Thresholds**
   - Configure per-component score requirements
   - Fail builds if scores drop below threshold

2. **CI Integration**
   - Run audits in CI/CD pipeline
   - Track performance over time
   - Generate reports

3. **Multiple URLs**
   - Test different component variations
   - Compare performance across stories
   - Batch audit runner

4. **Advanced Options**
   - Custom Lighthouse config
   - Different device emulation
   - Network throttling
   - CPU throttling

## Summary

🎉 **You're all set!** The Lighthouse addon now works seamlessly with Storybook. Just run `npm run storybook` and start auditing your components!

**No more manual server startup needed.**
