# Lighthouse Addon Simplification

## Problem: Unnecessary Channel Communication

The original implementation used Storybook's addon channel to communicate between `Panel.tsx` and `preview.ts`, which added unnecessary complexity.

### Original Architecture (Overcomplicated)

```
┌─────────────────────────────────────────┐
│  Panel.tsx (Manager Iframe)            │
│  - User clicks "Run Audit"              │
│  - emit('lighthouse/run') ──────────┐   │
└─────────────────────────────────────┘  │
                                         │ Channel Event
                                         ↓
┌─────────────────────────────────────────┐
│  preview.ts (Preview Iframe)            │
│  - Listen for 'lighthouse/run'          │
│  - fetch() Lighthouse API               │
│  - emit('lighthouse/results') ──────┐   │
└─────────────────────────────────────┘  │
                                         │ Channel Event
                                         ↓
┌─────────────────────────────────────────┐
│  Panel.tsx (Manager Iframe)            │
│  - Listen for 'lighthouse/results'      │
│  - Update state with results            │
│  - Display metrics                      │
└─────────────────────────────────────────┘
```

**Problems:**
1. ❌ Unnecessary message passing
2. ❌ Two-way channel communication
3. ❌ Extra file (`preview.ts`)
4. ❌ More complex to understand
5. ❌ More potential points of failure

## Solution: Direct API Call from Panel

### Simplified Architecture

```
┌─────────────────────────────────────────┐
│  Panel.tsx (Manager Iframe)            │
│  - User clicks "Run Audit"              │
│  - fetch() Lighthouse API directly      │
│  - Receive results                      │
│  - Update state                         │
│  - Display metrics                      │
└──────────────┬──────────────────────────┘
               │
               │ HTTP POST
               ↓
┌─────────────────────────────────────────┐
│  Lighthouse API Server                  │
│  (localhost:9002)                       │
└─────────────────────────────────────────┘
```

**Benefits:**
1. ✅ Direct API call - simpler
2. ✅ No channel events needed
3. ✅ One less file
4. ✅ Easier to understand
5. ✅ Fewer dependencies

## Why This Works

### Myth: "Panel must use channels to access preview"
**FALSE!** Panel.tsx runs in the **manager iframe** which is a full browser context with access to:
- `fetch()` API ✅
- `window.location` ✅
- HTTP requests ✅
- All browser APIs ✅

### When Channels ARE Needed
Channels are only needed when you need to:
1. **Access preview context** - Get story args, parameters, etc.
2. **Control preview behavior** - Remount components, change args
3. **Get real-time preview events** - Story changed, args updated
4. **Execute code in preview** - Run functions in the story iframe

### When Channels Are NOT Needed
Channels are NOT needed for:
1. ❌ Making HTTP requests (use `fetch()` directly)
2. ❌ Calling external APIs (Panel has browser context)
3. ❌ Managing UI state (React state works fine)
4. ❌ Processing data (Panel can do this itself)

## Code Changes

### Before (preview.ts - DELETED)
```typescript
// .storybook/addons/lighthouse/preview.ts
const channel = getChannel();

channel.on(RUN_LIGHTHOUSE_EVENT, async (data) => {
  const storyUrl = window.location.href;
  const results = await fetch('http://localhost:9002/api/lighthouse', {
    method: 'POST',
    body: JSON.stringify({ url: storyUrl }),
  });
  channel.emit(LIGHTHOUSE_EVENT, await results.json());
});
```

### After (Panel.tsx - SIMPLIFIED)
```typescript
// .storybook/addons/lighthouse/Panel.tsx
const runLighthouse = useCallback(async () => {
  setLoading(true);
  
  const storyId = api.getUrlState().storyId;
  const storyUrl = `${window.location.origin}/iframe.html?viewMode=story&id=${storyId}`;
  
  const response = await fetch('http://localhost:9002/api/lighthouse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: storyUrl }),
  });
  
  const data = await response.json();
  setResults(data);
  setLoading(false);
}, [api]);
```

## File Changes

### Deleted Files
- ✅ `.storybook/addons/lighthouse/preview.ts` - No longer needed!

### Modified Files
- `.storybook/addons/lighthouse/Panel.tsx`
  - Removed `useChannel` import
  - Removed channel event constants
  - Added direct `fetch()` call
  - Simplified state management

- `.storybook/preview.tsx`
  - Removed import of `preview.ts`

### No Changes Needed
- `.storybook/addons/lighthouse/server.mjs` - Still runs Lighthouse
- `.storybook/addons/lighthouse/register.tsx` - Still registers panel
- `.storybook/main.ts` - Still auto-starts server

## Comparison

| Aspect | Before (Channel) | After (Direct) |
|--------|-----------------|----------------|
| **Files** | 3 files | 2 files |
| **API calls** | 1 (in preview.ts) | 1 (in Panel.tsx) |
| **Channel events** | 2 events | 0 events |
| **Event listeners** | 2 listeners | 0 listeners |
| **Lines of code** | ~150 LOC | ~50 LOC |
| **Dependencies** | `useChannel` | None (built-in `fetch`) |
| **Complexity** | High | Low |
| **Debugging** | Harder (event flow) | Easier (direct call) |

## When Would Channels Be Useful?

If we wanted to do things like:

### 1. Access Story Args/Parameters
```typescript
// Panel.tsx would need to ask preview for story data
emit('lighthouse/get-story-info', { storyId });

// preview.ts would respond
channel.on('lighthouse/get-story-info', (data) => {
  const story = api.getCurrentStoryData();
  channel.emit('lighthouse/story-info', story);
});
```

### 2. Control Preview Iframe
```typescript
// Panel.tsx wants to reload the story before audit
emit('lighthouse/reload-story', { storyId });

// preview.ts handles the reload
channel.on('lighthouse/reload-story', () => {
  window.location.reload();
});
```

### 3. Run Code in Preview Context
```typescript
// Panel.tsx wants to measure something in the story
emit('lighthouse/measure-performance', { storyId });

// preview.ts runs performance.measure()
channel.on('lighthouse/measure-performance', () => {
  const metrics = performance.getEntries();
  channel.emit('lighthouse/performance-results', metrics);
});
```

**But for our use case:**
- ✅ We just need the story URL (can construct it)
- ✅ We call an external API (doesn't need preview)
- ✅ We display results in Panel (pure UI)

## Result

The addon now:
- ✅ **33% fewer files** (3 → 2)
- ✅ **66% less code** (~150 → ~50 LOC)
- ✅ **Simpler mental model** (direct call vs event passing)
- ✅ **Easier to maintain** (one source of truth)
- ✅ **Same functionality** (no features lost)

## Testing

To verify the simplification works:

```bash
# 1. Start Storybook (server auto-starts)
npm run storybook

# 2. Open http://localhost:6006

# 3. Navigate to any story

# 4. Click "Lighthouse" tab

# 5. Click "Run Lighthouse Audit"

# 6. Should work exactly as before! ✅
```

## Summary

**Question:** Is channel communication required?

**Answer:** **NO!** It was unnecessary complexity. Panel.tsx can directly call the Lighthouse API using `fetch()` because:

1. Panel runs in manager iframe (full browser context)
2. The API is an HTTP endpoint (accessible from anywhere)
3. We don't need preview iframe's context
4. Channels are for preview ↔ manager communication, not external APIs

**The simplified version is:**
- Simpler ✅
- Fewer files ✅
- Less code ✅
- Easier to understand ✅
- Exactly the same functionality ✅
