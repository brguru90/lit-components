# Lighthouse Architecture Explained

## Why Can't Lighthouse Run in the Browser Like Storybook Tests?

### Key Difference: Test Execution Context

**Storybook Interactions/Tests:**
```
┌─────────────────────────────────────┐
│  Current Browser Window             │
│  ├─ Storybook UI                    │
│  ├─ Component Already Rendered      │
│  └─ Tests Run Here ✅               │
│     • Use existing DOM              │
│     • Interact with rendered UI     │
│     • No page reload needed         │
└─────────────────────────────────────┘
```

**Lighthouse Audits:**
```
┌─────────────────────────────────────┐
│  Current Browser Window             │
│  ├─ Storybook UI                    │
│  └─ Cannot run Lighthouse here ❌   │
│     • Already loaded/rendered       │
│     • Metrics would be meaningless  │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  NEW Chrome Instance (Headless)     │
│  ├─ Fresh page load                 │
│  ├─ Measure from scratch            │
│  └─ Lighthouse runs here ✅         │
│     • Clean state                   │
│     • Real performance metrics      │
│     • Proper timing measurements    │
└─────────────────────────────────────┘
```

## Why Lighthouse Needs a Separate Chrome Instance

### Performance Metrics Require Fresh Page Load

Lighthouse measures:

1. **First Contentful Paint (FCP)**
   - Time from navigation START to first content
   - ❌ Can't measure on already-loaded page
   - ✅ Needs fresh navigation

2. **Largest Contentful Paint (LCP)**
   - Time to largest content element
   - ❌ Already rendered in current browser
   - ✅ Needs to observe initial render

3. **Time to Interactive (TTI)**
   - When page becomes fully interactive
   - ❌ Current page is already interactive
   - ✅ Needs to measure from navigation start

4. **Total Blocking Time (TBT)**
   - Main thread blocking during load
   - ❌ Loading already finished
   - ✅ Needs to observe initial load

### Technical Limitations

```typescript
// ❌ This CANNOT work in browser (preview.ts):
import lighthouse from 'lighthouse';        // Node.js module, not browser-compatible
import chromeLauncher from 'chrome-launcher'; // Cannot launch Chrome from within Chrome

// Lighthouse is fundamentally a Node.js tool that:
// 1. Requires file system access
// 2. Spawns child processes (Chrome)
// 3. Uses Node.js APIs (net, fs, child_process)
// 4. Connects via Chrome DevTools Protocol
```

## Current Architecture (The Right Way)

### Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    Browser (Client Side)                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Storybook UI                                          │  │
│  │  - Components rendered                                 │  │
│  │  - Lighthouse addon panel visible                     │  │
│  │  - preview.ts (client code)                           │  │
│  └─────────────────┬──────────────────────────────────────┘  │
└────────────────────┼──────────────────────────────────────────┘
                     │
                     │ HTTP POST /api/lighthouse
                     │ { url: "http://localhost:6006/..." }
                     ↓
┌──────────────────────────────────────────────────────────────┐
│                    Node.js Server                             │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Lighthouse API (.storybook/addons/lighthouse/server.mjs) │
│  │  - Receives audit request                              │  │
│  │  - Launches headless Chrome                           │  │
│  │  - Navigates to URL fresh                             │  │
│  │  - Runs Lighthouse audit                              │  │
│  │  - Returns metrics as JSON                            │  │
│  └────────────────┬───────────────────────────────────────┘  │
└──────────────────┼──────────────────────────────────────────┘
                   │
                   │ Launches
                   ↓
┌──────────────────────────────────────────────────────────────┐
│          Headless Chrome Instance (Isolated)                  │
│  - Fresh browser profile                                      │
│  - Navigates to URL from scratch                             │
│  - Lighthouse measures everything                            │
│  - Chrome closes after audit                                 │
└──────────────────────────────────────────────────────────────┘
```

### File Structure

```
.storybook/
├── addons/
│   └── lighthouse/
│       ├── Panel.tsx           # UI component (renders in browser)
│       ├── register.tsx        # Registers addon with Storybook
│       ├── preview.ts          # Client-side logic (browser)
│       │   └── Sends HTTP request to server
│       └── server.mjs          # Node.js server (NEW!)
│           ├── Starts with Storybook
│           ├── Launches Chrome
│           └── Runs Lighthouse
└── main.ts                     # Storybook config
    └── viteFinal() imports and starts server.mjs
```

## How Auto-Start Works

### 1. Storybook Starts

```typescript
// .storybook/main.ts
async viteFinal(config, { configType }) {
  if (configType === 'DEVELOPMENT') {
    // Import the server module
    const { startLighthouseServer } = await import('./addons/lighthouse/server.mjs');
    
    // Start the API server
    await startLighthouseServer();
  }
  return config;
}
```

### 2. Server Starts Automatically

```typescript
// .storybook/addons/lighthouse/server.mjs
export async function startLighthouseServer() {
  const app = express();
  const PORT = 9002;
  
  app.post('/api/lighthouse', async (req, res) => {
    // 1. Launch Chrome
    const chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless'],
    });
    
    // 2. Run Lighthouse
    const results = await lighthouse(url, { port: chrome.port });
    
    // 3. Return metrics
    res.json(results);
    
    // 4. Close Chrome
    await chrome.kill();
  });
  
  server = app.listen(PORT);
  console.log('🔦 Lighthouse API started at http://localhost:9002');
}
```

### 3. Panel Calls API

```typescript
// .storybook/addons/lighthouse/preview.ts
async function runLighthouseAudit(url: string) {
  const response = await fetch('http://localhost:9002/api/lighthouse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  
  return await response.json();
}
```

## Benefits of This Architecture

### ✅ Automatic Startup
- No need to run `npm run lighthouse:api` manually
- Server starts when Storybook starts
- Server stops when Storybook stops

### ✅ Accurate Metrics
- Fresh Chrome instance for each audit
- Clean browser state
- Real performance measurements
- No interference from existing page

### ✅ Caching
- Results cached for 5 minutes
- Instant results for repeated audits
- Reduces Chrome launches

### ✅ Error Handling
- Graceful fallback if server fails
- Clear error messages in UI
- Automatic retry on next request

## Comparison with Storybook Tests

| Feature | Storybook Tests | Lighthouse Audits |
|---------|----------------|-------------------|
| **Where they run** | Current browser window | Separate Chrome instance |
| **What they test** | Component behavior | Page performance |
| **Page state** | Already loaded | Fresh page load |
| **Requires reload** | ❌ No | ✅ Yes (fresh load) |
| **Backend needed** | ❌ No | ✅ Yes (Node.js) |
| **Metrics type** | Functional (clicks, inputs) | Performance (FCP, LCP) |
| **Chrome DevTools** | Uses current instance | Launches headless Chrome |

## Why Not Run Lighthouse in Current Browser?

### Attempted Approach (Doesn't Work)

```typescript
// ❌ This is fundamentally impossible
import lighthouse from 'lighthouse'; // Cannot import in browser

// Even if you could import it:
await lighthouse(window.location.href); // ❌ Would give wrong metrics

// Why wrong?
// - Page already loaded (no fresh FCP measurement)
// - Resources already cached (no real network timing)
// - JavaScript already parsed (no real TTI)
// - Current browser state affects results
```

### Why Current Architecture Is Correct

```typescript
// ✅ Correct approach
const response = await fetch('http://localhost:9002/api/lighthouse', {
  method: 'POST',
  body: JSON.stringify({ url: 'http://localhost:6006/story' }),
});

// Server will:
// 1. Launch fresh Chrome instance
// 2. Navigate to URL with clean state
// 3. Measure real performance from scratch
// 4. Return accurate metrics
```

## Performance Considerations

### Single Audit
```
User clicks "Run Audit"
↓
preview.ts sends HTTP request (< 10ms)
↓
Server receives request (< 5ms)
↓
Launch Chrome instance (~ 1-2 seconds)
↓
Navigate to URL and run Lighthouse (~ 5-10 seconds)
↓
Close Chrome (< 500ms)
↓
Return results to browser (< 50ms)
↓
Panel displays metrics
───────────────────────────
Total: 7-15 seconds
```

### Cached Audit (< 5 minutes old)
```
User clicks "Run Audit"
↓
preview.ts sends HTTP request (< 10ms)
↓
Server finds cached result (< 1ms)
↓
Return cached results (< 50ms)
↓
Panel displays metrics
───────────────────────────
Total: < 100ms
```

## Alternative Approaches (Why They Don't Work)

### ❌ Approach 1: Run Lighthouse in Browser
```typescript
// Cannot work - Lighthouse is Node.js only
import lighthouse from 'lighthouse'; // ❌ Not browser-compatible
```

### ❌ Approach 2: Use Chrome DevTools API from Browser
```typescript
// Cannot work - Security restrictions
chrome.debugger.attach(); // ❌ Requires extension permissions
```

### ❌ Approach 3: Measure Already-Loaded Page
```typescript
// Would give meaningless metrics
performance.timing.navigationStart; // ❌ Already happened
```

### ✅ Approach 4: Node.js Server (Current)
```typescript
// This is the only approach that works correctly
const lighthouse = require('lighthouse');
const chrome = await chromeLauncher.launch();
const results = await lighthouse(url, { port: chrome.port });
```

## Summary

**The current architecture is not just one approach - it's the ONLY correct approach for running Lighthouse in Storybook.**

1. **Lighthouse MUST run in Node.js** (it's a Node.js library)
2. **Lighthouse MUST launch a fresh Chrome** (for accurate metrics)
3. **Browser CANNOT do these things** (security and technical limitations)
4. **Server-client architecture is required** (HTTP API bridge)

The only improvement we made is **auto-starting** the server with Storybook, so you don't need to run it manually. The fundamental architecture remains the same because it's the only way that works correctly.
