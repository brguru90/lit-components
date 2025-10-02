# Lighthouse Cache Behavior

## Overview

The Lighthouse API server implements smart caching to improve performance while allowing users to force fresh audits when needed.

## Default Behavior: Cache Enabled ✅

By default, the API **uses cache** to provide instant results for repeated audits.

### How It Works

1. **First Audit** - Runs Lighthouse, caches result for 5 minutes
2. **Subsequent Audits (< 5 min)** - Returns cached result instantly
3. **After 5 Minutes** - Cache expires, runs fresh audit

### Benefits

- ⚡ **Instant Results** - < 100ms for cached audits
- 💰 **Resource Efficient** - No unnecessary Chrome launches
- 🔋 **Battery Friendly** - Reduces CPU/memory usage
- 📊 **Consistent Results** - Same metrics for same timeframe

## Cache Bypass: `skipCache` Parameter

### Use Cases

When you need fresh metrics:
- 🔄 User clicks "Re-run Audit" button
- 🛠️ After making code changes
- 🧪 Testing performance improvements
- 📈 Comparing before/after metrics

### API Parameter

```typescript
POST /api/lighthouse
Content-Type: application/json

{
  "url": "http://localhost:6006/...",
  "skipCache": true  // ← Set to true to bypass cache
}
```

### Panel Implementation

```typescript
// Initial run - uses cache (skipCache = false)
<Button onClick={() => runLighthouse(false)}>
  Run Lighthouse Audit
</Button>

// Re-run - bypasses cache (skipCache = true)
<Button onClick={() => runLighthouse(true)}>
  Re-run Audit
</Button>
```

## Behavior Comparison

| Scenario | Cache Used? | Duration | Chrome Launch |
|----------|-------------|----------|---------------|
| **First audit** | ❌ No cache exists | 7-15 seconds | ✅ Yes |
| **Second audit (< 5 min)** | ✅ Uses cache | < 100ms | ❌ No |
| **After 5 minutes** | ❌ Cache expired | 7-15 seconds | ✅ Yes |
| **With skipCache: true** | ❌ Forced bypass | 7-15 seconds | ✅ Yes |

## Examples

### Example 1: Normal Usage (Cache Enabled)

```bash
# First audit at 10:00 AM
POST /api/lighthouse { "url": "..." }
# Response: Fresh audit, 10 seconds
# Cache: Stored until 10:05 AM

# Second audit at 10:02 AM
POST /api/lighthouse { "url": "..." }
# Response: Cached result, < 100ms
# Log: "📦 Cached result (120s old)"

# Third audit at 10:06 AM
POST /api/lighthouse { "url": "..." }
# Response: Fresh audit, 10 seconds (cache expired)
# Cache: Stored until 10:11 AM
```

### Example 2: Force Fresh Audit

```bash
# Initial audit
POST /api/lighthouse { "url": "..." }
# Response: Fresh audit, 10 seconds

# Immediately re-run (skipping cache)
POST /api/lighthouse { 
  "url": "...", 
  "skipCache": true 
}
# Response: Fresh audit, 10 seconds
# Log: "🔄 Skipping cache - running fresh audit"
# Cache: Updated with new results
```

### Example 3: Different URLs

```bash
# Audit story 1
POST /api/lighthouse { "url": "...story-1..." }
# Cache key: "...story-1..._[]"

# Audit story 2
POST /api/lighthouse { "url": "...story-2..." }
# Cache key: "...story-2..._[]"
# Result: Different URL = different cache entry
```

## Cache Key Generation

The cache key is generated from:

```javascript
const cacheKey = `${url}_${JSON.stringify(options)}`;
```

### Cache Key Examples

```javascript
// Story 1, default options
"http://localhost:6006/iframe.html?id=button--default_{}"

// Story 1, custom options
"http://localhost:6006/iframe.html?id=button--default_{\"onlyCategories\":[\"performance\"]}"

// Story 2, default options
"http://localhost:6006/iframe.html?id=card--default_{}"
```

**Note:** Different options create different cache entries.

## Console Logs

### Cached Result
```
🔦 Running Lighthouse audit for: http://localhost:6006/...
📦 Cached result (45s old)
```

### Fresh Audit
```
🔦 Running Lighthouse audit for: http://localhost:6006/...
✅ Audit complete - Performance: 85
```

### Skipped Cache
```
🔦 Running Lighthouse audit for: http://localhost:6006/... (forcing fresh audit)
🔄 Skipping cache - running fresh audit
🔦 Running Lighthouse audit for: http://localhost:6006/...
✅ Audit complete - Performance: 87
```

## Response Format

### Cached Response
```json
{
  "scores": { ... },
  "metrics": { ... },
  "audits": [ ... ],
  "timestamp": "2025-10-02T12:00:00.000Z",
  "cached": true,        // ← Indicates cached result
  "cacheAge": 45000      // ← Age in milliseconds
}
```

### Fresh Response
```json
{
  "scores": { ... },
  "metrics": { ... },
  "audits": [ ... ],
  "timestamp": "2025-10-02T12:05:00.000Z"
  // No "cached" or "cacheAge" fields
}
```

## Cache Management

### View Cache Size
```bash
GET /api/lighthouse/health

Response:
{
  "status": "ok",
  "service": "lighthouse-api",
  "version": "1.0.0",
  "cacheSize": 5  // ← Number of cached results
}
```

### Clear Cache
```bash
DELETE /api/lighthouse/cache

Response:
{
  "message": "Cache cleared",
  "previousSize": 5,
  "currentSize": 0
}
```

## Cache Limits

### Time Limit
- **Expiration:** 5 minutes
- **Rationale:** Performance can change, but not that quickly
- **Configurable:** Change `5 * 60 * 1000` in server.mjs

### Size Limit
- **Max Entries:** 50 audits
- **Eviction:** FIFO (First In, First Out)
- **Configurable:** Change `MAX_CACHE_SIZE` in server.mjs

```javascript
// Current settings
const MAX_CACHE_SIZE = 50;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Custom settings example
const MAX_CACHE_SIZE = 100;      // 100 audits
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
```

## UI Behavior

### Initial State
- Shows: "No Lighthouse Results"
- Button: "Run Lighthouse Audit"
- Behavior: Uses cache if available

### After First Run
- Shows: Metrics + timestamp
- Button: "Re-run Audit"
- Behavior: **Skips cache** to force fresh audit

### While Running
- Button: "Running..." (disabled)
- Shows: Loading spinner
- Logs: Progress in console

## Best Practices

### For Users

✅ **DO:** Use "Run Lighthouse Audit" for quick checks
- Fast results if recently audited
- Good for browsing different stories

✅ **DO:** Use "Re-run Audit" after changes
- Forces fresh measurement
- Accurate performance impact

❌ **DON'T:** Spam the Re-run button
- Each run takes 7-15 seconds
- Launches Chrome each time
- Resource intensive

### For Developers

✅ **DO:** Keep cache TTL reasonable (5 min)
- Balance freshness vs performance
- Consider your use case

✅ **DO:** Monitor cache size
- Check `/api/lighthouse/health`
- Adjust `MAX_CACHE_SIZE` if needed

✅ **DO:** Clear cache during development
- Use `DELETE /api/lighthouse/cache`
- Ensures fresh results

## Configuration

### Environment Variables

```bash
# Change cache TTL (in milliseconds)
LIGHTHOUSE_CACHE_TTL=600000 npm run storybook  # 10 minutes

# Change max cache size
LIGHTHOUSE_CACHE_SIZE=100 npm run storybook

# Disable auto-start (manual server start)
STORYBOOK_LIGHTHOUSE_AUTO_START=false npm run storybook
```

### Code Configuration

Edit `.storybook/addons/lighthouse/server.mjs`:

```javascript
// Cache settings
const MAX_CACHE_SIZE = 50;           // Maximum cached audits
const CACHE_TTL = 5 * 60 * 1000;    // Time to live in ms

// Check cache
if (age < CACHE_TTL) {
  return res.json({ ...cachedResult, cached: true });
}
```

## Troubleshooting

### Cache Not Working

**Symptoms:**
- Every audit takes 7-15 seconds
- Never see "📦 Cached result" log

**Solutions:**
1. Check if `skipCache: true` is set (should be `false` or omitted)
2. Verify cache TTL hasn't expired (< 5 minutes)
3. Check if URL/options changed (different cache key)

### Stale Results

**Symptoms:**
- Metrics don't reflect recent changes
- Timestamp is old

**Solutions:**
1. Click "Re-run Audit" button (forces fresh audit)
2. Wait 5 minutes for cache to expire
3. Clear cache: `DELETE /api/lighthouse/cache`

### Memory Issues

**Symptoms:**
- High memory usage
- Server slow

**Solutions:**
1. Reduce `MAX_CACHE_SIZE` (default 50)
2. Reduce `CACHE_TTL` (default 5 min)
3. Clear cache regularly

## Summary

✅ **Default:** Cache enabled for fast results
✅ **Re-run:** `skipCache: true` forces fresh audit  
✅ **Expiration:** 5 minutes TTL
✅ **Limit:** 50 cached audits max
✅ **Smart:** Different URLs = different cache entries

**Perfect for:** Quick checks with option to force fresh results! 🎯
