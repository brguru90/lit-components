# Lighthouse Integration - Summary

## What You Wanted

> "can't it be part of .storybook/addons/lighthouse/preview.ts and chrome instance should start along with storybook?, similer to tests run in storybooks interactions panel"

## The Answer: Partially Yes! ✅

### What We Did

1. **✅ Chrome starts with Storybook** - The Lighthouse API server (which launches Chrome) now starts automatically when you run `npm run storybook`

2. **❌ Cannot run in preview.ts (browser)** - Lighthouse MUST run in Node.js because it's a Node.js library that launches Chrome

3. **✅ Simplified to single command** - No more manual server startup needed!

## Why Lighthouse Is Different from Storybook Tests

### Storybook Interaction Tests
```typescript
// Runs IN the current browser window
export const LoginTest = {
  play: async ({ canvas, userEvent }) => {
    // ✅ Uses the already-open browser
    // ✅ Tests the already-rendered component
    // ✅ No page reload needed
    await userEvent.click(canvas.getByRole('button'));
    await expect(canvas.getByRole('dialog')).toBeInTheDocument();
  }
};
```

**Why it works in the browser:**
- Tests behavior, not performance
- Doesn't need fresh page load
- Uses existing DOM
- No special metrics to measure

### Lighthouse Audits
```typescript
// Must run in Node.js + separate Chrome
const chrome = await chromeLauncher.launch();
const results = await lighthouse(url, { port: chrome.port });

// ❌ Cannot run in browser because:
// - Lighthouse is a Node.js module
// - Needs to launch a fresh Chrome instance
// - Measures performance from navigation start
// - Requires DevTools Protocol access
```

**Why it needs Node.js + separate Chrome:**
- Measures performance metrics (FCP, LCP, TTI)
- Needs fresh page load (not already-loaded page)
- Requires clean browser state
- Uses Chrome DevTools Protocol

## The Architecture (Final)

```
┌─────────────────────────────────────────────┐
│  Terminal: npm run storybook               │
└─────────────────┬───────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────┐
│  Storybook starts                           │
│  - Webpack/Vite builds                      │
│  - Opens http://localhost:6006              │
│  - viteFinal() hook runs                    │
└─────────────────┬───────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────┐
│  Lighthouse API server starts (auto)        │
│  - .storybook/addons/lighthouse/server.mjs  │
│  - Express server on port 9002              │
│  - Ready to launch Chrome on demand         │
└─────────────────┬───────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────┐
│  Both running!                              │
│  ✅ Storybook UI: http://localhost:6006    │
│  ✅ Lighthouse API: http://localhost:9002  │
└─────────────────────────────────────────────┘
```

### When User Clicks "Run Lighthouse Audit"

```
┌─────────────────────────────────────────────┐
│  Browser: Storybook UI                      │
│  - User clicks "Run Lighthouse Audit"       │
│  - preview.ts sends HTTP POST               │
└─────────────────┬───────────────────────────┘
                  │
                  ↓ HTTP POST /api/lighthouse
┌─────────────────────────────────────────────┐
│  Node.js: Lighthouse API Server             │
│  - Receives { url: "..." }                  │
│  - Launches headless Chrome                 │
└─────────────────┬───────────────────────────┘
                  │
                  ↓ Launches
┌─────────────────────────────────────────────┐
│  Headless Chrome (new instance)             │
│  - Navigates to URL fresh                   │
│  - Lighthouse measures everything           │
│  - Returns metrics                          │
└─────────────────┬───────────────────────────┘
                  │
                  ↓ Results
┌─────────────────────────────────────────────┐
│  Browser: Lighthouse Panel                  │
│  - Displays scores and metrics              │
│  - Shows in Addons panel                    │
└─────────────────────────────────────────────┘
```

## Key Files

### 1. Browser-Side (Client)

```typescript
// .storybook/addons/lighthouse/preview.ts
// Runs IN the browser
async function runLighthouseAudit(url: string) {
  const response = await fetch('http://localhost:9002/api/lighthouse', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
  return await response.json();
}
```

### 2. Server-Side (Node.js)

```typescript
// .storybook/addons/lighthouse/server.mjs
// Runs in Node.js process
export async function startLighthouseServer() {
  const app = express();
  
  app.post('/api/lighthouse', async (req, res) => {
    const chrome = await chromeLauncher.launch();
    const results = await lighthouse(url, { port: chrome.port });
    await chrome.kill();
    res.json(results);
  });
  
  app.listen(9002);
}
```

### 3. Integration Point

```typescript
// .storybook/main.ts
async viteFinal(config, { configType }) {
  if (configType === 'DEVELOPMENT') {
    // Import and start the server
    const { startLighthouseServer } = await import('./addons/lighthouse/server.mjs');
    await startLighthouseServer();
  }
  return config;
}
```

## Comparison with Your Original Request

| Feature | You Wanted | What We Did | Why |
|---------|-----------|-------------|-----|
| **Start with Storybook** | ✅ Yes | ✅ Auto-starts | Added viteFinal() hook |
| **Single command** | ✅ Yes | ✅ Just `npm run storybook` | Server starts automatically |
| **In preview.ts** | ✅ Yes | ❌ No, in server.mjs | Lighthouse is Node.js only |
| **Use Storybook's Chrome** | ✅ Yes | ❌ No, launches new Chrome | Needs fresh page load for metrics |
| **Similar to tests** | ✅ Yes | ⚠️  Similar UI, different tech | Tests can run in browser, Lighthouse cannot |

## Why We Can't Put It All in preview.ts

### Technical Impossibilities

```typescript
// ❌ This code CANNOT exist in preview.ts:

// 1. Cannot import Node.js modules in browser
import lighthouse from 'lighthouse';        // ❌ Node.js only
import chromeLauncher from 'chrome-launcher'; // ❌ Node.js only

// 2. Cannot use Node.js APIs in browser
import fs from 'fs';                        // ❌ Browser has no filesystem
import { spawn } from 'child_process';      // ❌ Browser cannot spawn processes

// 3. Cannot launch Chrome from within Chrome
const chrome = await chromeLauncher.launch(); // ❌ Security violation

// 4. Measuring already-loaded page gives wrong metrics
const fcp = performance.timing.navigationStart; // ❌ Already happened
```

### What preview.ts CAN Do

```typescript
// ✅ This code WORKS in preview.ts:

// 1. Call the API server
const response = await fetch('http://localhost:9002/api/lighthouse', {
  method: 'POST',
  body: JSON.stringify({ url: window.location.href }),
});

// 2. Display results in UI
channel.emit(LIGHTHOUSE_EVENT, await response.json());
```

## The Final Solution

### Before (Manual - 2 commands)
```bash
# Terminal 1
npm run storybook

# Terminal 2 (had to remember!)
npm run lighthouse:api
```

### After (Automatic - 1 command)
```bash
# Just this!
npm run storybook

# Output:
# 🔦 Lighthouse API server started at http://localhost:9002
# Storybook 9.1.10 for web-components-vite started
```

## What You Get

✅ **Single command** - Just `npm run storybook`
✅ **Automatic startup** - Server starts with Storybook
✅ **Automatic shutdown** - Server stops with Storybook
✅ **Real metrics** - Fresh Chrome instance per audit
✅ **Smart caching** - 5-minute cache for repeat audits
✅ **Clean UI** - Beautiful panel in Storybook addons
✅ **Error handling** - Clear messages if something fails

## What's Not Possible (and Why)

❌ **Run in preview.ts** - Lighthouse is Node.js only
❌ **Use Storybook's Chrome** - Needs fresh page load
❌ **Measure current page** - Metrics would be meaningless
❌ **Avoid separate server** - Bridge between browser and Node.js needed

## Summary

Your idea was brilliant - and we implemented the **spirit** of it:

1. ✅ **Single command to start everything**
2. ✅ **Chrome launches automatically** (when audit runs)
3. ✅ **Clean integration** with Storybook UI

But we had to use a **client-server architecture** because:

1. ❌ Lighthouse cannot run in the browser
2. ❌ Performance metrics need fresh page loads
3. ❌ Chrome DevTools Protocol requires Node.js

The result is the **best possible solution** that balances your requirements with technical constraints.

## Next Steps

To test the auto-start feature:

```bash
# 1. Start Storybook (server starts automatically)
npm run storybook

# 2. Open http://localhost:6006

# 3. Go to any story (e.g., Components → Button → Default)

# 4. Click "Lighthouse" tab in addons panel

# 5. Click "Run Lighthouse Audit"

# 6. Watch real metrics appear! 🎉
```

## Documentation

- **[LIGHTHOUSE_AUTO_START.md](./LIGHTHOUSE_AUTO_START.md)** - How auto-start works
- **[LIGHTHOUSE_ARCHITECTURE_EXPLAINED.md](./LIGHTHOUSE_ARCHITECTURE_EXPLAINED.md)** - Why this architecture is required
- **[LIGHTHOUSE_SETUP_COMPLETE.md](./LIGHTHOUSE_SETUP_COMPLETE.md)** - Original setup guide
