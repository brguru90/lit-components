# Chrome Flags for Lighthouse Testing

## Overview

Chrome flags control browser behavior during Lighthouse audits. The right flags ensure consistent, reliable performance measurements.

## Current Configuration

```javascript
chrome = await chromeLauncher.launch({
  chromeFlags: [
    // Essential flags
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    
    // Performance & consistency
    '--disable-dev-shm-usage',
    '--disable-extensions',
    '--disable-background-networking',
    '--disable-sync',
    '--disable-translate',
    '--disable-default-apps',
    
    // Network & caching
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
    '--disable-ipc-flooding-protection',
    
    // Memory & stability
    '--disable-hang-monitor',
    '--disable-prompt-on-repost',
    '--disable-domain-reliability',
    '--disable-client-side-phishing-detection',
    
    // Viewport
    '--window-size=1920,1080',
  ],
});
```

---

## Flag Categories

### 🎯 **Essential Flags (Must Have)**

#### `--headless`
- **Purpose**: Run Chrome without a visible UI
- **Why**: Required for server/CI environments, faster execution
- **Impact**: Reduces overhead, no GUI rendering

#### `--disable-gpu`
- **Purpose**: Disable GPU hardware acceleration
- **Why**: More consistent results, especially in headless mode
- **Impact**: Prevents GPU-related crashes in some environments

#### `--no-sandbox`
- **Purpose**: Disable Chrome's sandbox security feature
- **Why**: Required in Docker containers and some CI environments
- **Security Note**: ⚠️ Only use in controlled testing environments
- **Impact**: Allows Chrome to run with fewer permissions

---

### 🚀 **Performance & Consistency Flags**

#### `--disable-dev-shm-usage`
- **Purpose**: Use /tmp instead of /dev/shm for shared memory
- **Why**: Prevents "Out of Memory" crashes in Docker/limited environments
- **Impact**: More stable in constrained environments

#### `--disable-extensions`
- **Purpose**: Disable all Chrome extensions
- **Why**: Extensions can interfere with performance measurements
- **Impact**: Clean baseline without extension overhead

#### `--disable-background-networking`
- **Purpose**: Prevent background network requests
- **Why**: Accurate network performance measurements
- **Impact**: No interference from update checks, telemetry

#### `--disable-sync`
- **Purpose**: Disable Chrome sync features
- **Why**: Removes background sync operations
- **Impact**: More predictable resource usage

#### `--disable-translate`
- **Purpose**: Disable automatic translation prompts
- **Why**: Prevents popup interference
- **Impact**: Cleaner test execution

#### `--disable-default-apps`
- **Purpose**: Don't load default Chrome apps
- **Why**: Reduces startup overhead
- **Impact**: Faster Chrome launch

---

### 🌐 **Network & Caching Flags**

#### `--disable-background-timer-throttling`
- **Purpose**: Prevent timer throttling in background tabs
- **Why**: Consistent JavaScript timer behavior
- **Impact**: More accurate performance timing

#### `--disable-renderer-backgrounding`
- **Purpose**: Don't throttle background renderers
- **Why**: Consistent rendering performance
- **Impact**: Prevents false performance degradation

#### `--disable-backgrounding-occluded-windows`
- **Purpose**: Keep occluded windows active
- **Why**: Maintains full rendering pipeline
- **Impact**: Accurate visual metrics

#### `--disable-ipc-flooding-protection`
- **Purpose**: Allow high-frequency inter-process communication
- **Why**: Prevents throttling during intensive operations
- **Impact**: Accurate timing for rapid operations

---

### 💾 **Memory & Stability Flags**

#### `--disable-hang-monitor`
- **Purpose**: Don't kill unresponsive renderer processes
- **Why**: Prevents premature test termination
- **Impact**: More patient with slow pages

#### `--disable-prompt-on-repost`
- **Purpose**: Don't show form resubmission warnings
- **Why**: Automated testing needs no user interaction
- **Impact**: Smoother test execution

#### `--disable-domain-reliability`
- **Purpose**: Disable error reporting to Google
- **Why**: No background network activity
- **Impact**: Cleaner network profile

#### `--disable-client-side-phishing-detection`
- **Purpose**: Skip phishing detection checks
- **Why**: Faster page loads, no unnecessary checks
- **Impact**: Reduced startup overhead

---

### 📐 **Viewport & Display Flags**

#### `--window-size=1920,1080`
- **Purpose**: Set consistent window dimensions
- **Why**: Consistent viewport for responsive testing
- **Impact**: Predictable layout rendering
- **Note**: Lighthouse can override this with its own viewport settings

---

## Alternative Configurations

### **Minimal (Fastest, Less Consistent)**
```javascript
chromeFlags: [
  '--headless',
  '--disable-gpu',
  '--no-sandbox',
]
```
- ✅ Fast execution
- ⚠️ Less consistent results
- 🎯 Good for: Quick checks

### **Standard (Balanced)**
```javascript
chromeFlags: [
  '--headless',
  '--disable-gpu',
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--disable-extensions',
  '--disable-background-networking',
  '--window-size=1920,1080',
]
```
- ✅ Good balance of speed and consistency
- ✅ Works in most environments
- 🎯 Good for: Development testing

### **Maximum Consistency (Slowest, Most Reliable)**
```javascript
chromeFlags: [
  // All flags from current configuration
  // Plus additional flags for extreme consistency:
  '--disable-features=TranslateUI',
  '--disable-features=BlinkGenPropertyTrees',
  '--disable-breakpad',
  '--disable-backing-store-limit',
  '--metrics-recording-only',
  '--no-first-run',
  '--safebrowsing-disable-auto-update',
]
```
- ✅ Maximum consistency
- ⚠️ Slower execution
- 🎯 Good for: CI/CD pipelines, official audits

---

## Environment-Specific Flags

### **Docker/Container Environments**
**Must have:**
```javascript
'--no-sandbox',              // Required for containers
'--disable-dev-shm-usage',  // Prevents memory issues
'--disable-setuid-sandbox',  // Additional sandbox bypass
```

### **CI/CD Environments**
**Recommended:**
```javascript
'--disable-gpu',
'--no-sandbox',
'--disable-dev-shm-usage',
'--disable-extensions',
'--disable-background-networking',
'--single-process',         // Sometimes needed in CI
```

### **Local Development**
**Optional:**
```javascript
'--headless',              // Can run with UI for debugging
'--disable-extensions',
'--window-size=1920,1080',
```

---

## Debugging Flags

### **When Tests Fail Mysteriously**
```javascript
'--enable-logging',
'--v=1',                   // Verbose logging level
'--log-level=0',           // Show all logs
```

### **Visual Debugging (Run with UI)**
```javascript
// Remove '--headless' and add:
'--auto-open-devtools-for-tabs',  // Open DevTools automatically
'--remote-debugging-port=9222',   // Enable remote debugging
```

---

## Performance Testing Considerations

### **For Accurate Performance Metrics**
✅ **Do:**
- Use consistent flags across all tests
- Disable all background activity flags
- Set consistent viewport size
- Run in isolated environment

❌ **Don't:**
- Change flags between test runs
- Run with extensions enabled
- Use different Chrome versions
- Test on machine under heavy load

### **For Faster Test Execution**
✅ **Do:**
- Use minimal essential flags
- Cache Lighthouse results
- Run tests in parallel (different URLs)

❌ **Don't:**
- Add unnecessary debugging flags
- Run with verbose logging in production

---

## Common Issues & Solutions

### **Issue: "Out of Memory" Errors**
**Solution:** Add `--disable-dev-shm-usage`

### **Issue: Chrome Won't Start in Docker**
**Solution:** Add `--no-sandbox` and `--disable-setuid-sandbox`

### **Issue: Inconsistent Performance Results**
**Solution:** Add all consistency flags (background networking, timer throttling, etc.)

### **Issue: Tests Hang**
**Solution:** Add `--disable-hang-monitor` and set Lighthouse timeout

### **Issue: Network Timing Varies**
**Solution:** Disable background networking and use consistent network throttling

---

## Lighthouse-Specific Configuration

The Chrome flags work alongside Lighthouse options:

```javascript
const lighthouseOptions = {
  // Lighthouse controls its own settings
  throttling: {
    rttMs: 150,
    throughputKbps: 1600,
    cpuSlowdownMultiplier: 4,
  },
  screenEmulation: {
    mobile: false,
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  },
  emulatedUserAgent: '...',
};
```

**Note:** Lighthouse overrides some Chrome settings for consistency.

---

## Recommended Configuration by Use Case

### **Component Testing (Current Use Case)**
```javascript
chromeFlags: [
  '--headless',
  '--disable-gpu',
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--disable-extensions',
  '--disable-background-networking',
  '--disable-sync',
  '--window-size=1920,1080',
]
```

### **Full Page Audits**
```javascript
// Same as above, plus:
'--disable-background-timer-throttling',
'--disable-renderer-backgrounding',
'--disable-ipc-flooding-protection',
```

### **CI/CD Pipeline**
```javascript
// All flags from current configuration
// Plus environment-specific flags as needed
```

---

## References

- [Chrome Command Line Switches](https://peter.sh/experiments/chromium-command-line-switches/)
- [Lighthouse Chrome Launcher](https://github.com/GoogleChrome/chrome-launcher)
- [Lighthouse Configuration](https://github.com/GoogleChrome/lighthouse/blob/main/docs/configuration.md)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)

---

## Monitoring Flag Impact

To test if flags make a difference:

1. **Run baseline test** with minimal flags
2. **Run test with new flags** 
3. **Compare results** (especially variance between runs)
4. **Keep flags that reduce variance**

Track metrics like:
- Standard deviation of performance scores
- Consistency of Core Web Vitals
- Test execution time
- Failure rate
