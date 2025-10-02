# Story Navigation Fix

## Problem

When running a Lighthouse audit on one story and then navigating to a different story, the panel was showing stale results from the previous story instead of clearing or updating.

### Example Issue

```
1. Navigate to "Button - Default"
2. Click "Run Lighthouse Audit"
   → Shows metrics for Button Default
   
3. Navigate to "Card - Default"
   → Still shows metrics for Button Default ❌
   → Should clear or show empty state
```

## Root Cause

The `LighthousePanel` component was not tracking story changes. The `results` state persisted across navigation, showing outdated data.

## Solution

Added story change detection using Storybook's state management:

### 1. Import Storybook State Hook

```typescript
import { useStorybookApi, useStorybookState } from 'storybook/manager-api';
```

### 2. Track Current Story ID

```typescript
const [currentStoryId, setCurrentStoryId] = useState<string | null>(null);
const state = useStorybookState();
```

### 3. Listen for Story Changes

```typescript
useEffect(() => {
  const storyId = state.storyId;
  
  // If story changed, clear the old results
  if (currentStoryId && storyId && storyId !== currentStoryId) {
    console.log(`📖 Story changed (${currentStoryId} → ${storyId}), clearing results`);
    setResults(null);
    setError(null);
  }
  
  if (storyId) {
    setCurrentStoryId(storyId);
  }
}, [state.storyId, currentStoryId]);
```

## Behavior After Fix

### Scenario 1: Navigate to Different Story

```
1. Story: "Button - Default"
   Run audit → Shows Button metrics ✅

2. Navigate to "Card - Default"
   → Clears results ✅
   → Shows empty state: "No Lighthouse Results" ✅
   → Button: "Run Lighthouse Audit" ✅

3. Click "Run Lighthouse Audit"
   → Shows Card metrics ✅
```

### Scenario 2: Navigate Back to Audited Story

```
1. Story: "Button - Default"
   Run audit → Shows Button metrics

2. Navigate to "Card - Default"
   → Clears results (empty state)

3. Navigate back to "Button - Default"
   → Empty state ✅
   → Must re-run audit
   → Can use cache if < 5 minutes old
```

### Scenario 3: Stay on Same Story

```
1. Story: "Button - Default"
   Run audit → Shows metrics

2. Click "Re-run Audit"
   → Updates metrics for same story ✅
   → Does NOT clear results
```

## Console Logs

When navigating between stories:

```
📖 Story changed (components-button--default → components-card--default), clearing previous Lighthouse results
```

## Alternative Approaches Considered

### Option 1: Keep Results Across Navigation ❌

**Pros:**
- Results persist
- Less confusion if navigating accidentally

**Cons:**
- Shows wrong data for current story
- Misleading metrics
- Confusing for users

**Decision:** Rejected - data accuracy is critical

### Option 2: Auto-Run Audit on Story Change ❌

**Pros:**
- Always up-to-date
- No manual re-run needed

**Cons:**
- Triggers audit on every navigation (slow)
- Consumes resources unnecessarily
- Users may not want audit for every story

**Decision:** Rejected - too aggressive

### Option 3: Clear Results on Story Change ✅ (Implemented)

**Pros:**
- No stale data shown
- Clear empty state prompts user to run audit
- Uses cache if re-running within 5 min
- User has full control

**Cons:**
- Must click button again for new story

**Decision:** Accepted - best balance

## Edge Cases Handled

### 1. Initial Load
```typescript
if (currentStoryId && storyId && storyId !== currentStoryId) {
  // Only clear if we had a previous story
}
```

### 2. Same Story
```typescript
if (storyId !== currentStoryId) {
  // Only clear if story actually changed
}
```

### 3. Null/Undefined Story ID
```typescript
if (currentStoryId && storyId && storyId !== currentStoryId) {
  // Check both exist before comparing
}
```

## Testing

### Test Case 1: Basic Navigation
```
1. Story A → Run audit → See metrics
2. Navigate to Story B → Empty state ✅
3. Run audit → See new metrics ✅
```

### Test Case 2: Navigate Back
```
1. Story A → Run audit → See metrics
2. Navigate to Story B → Empty state
3. Navigate back to Story A → Empty state ✅
4. Run audit → Uses cache (if < 5 min) ✅
```

### Test Case 3: Multiple Navigations
```
1. Story A → Run audit
2. Navigate B → C → D → A
3. Story A shows empty state ✅
```

### Test Case 4: Re-run on Same Story
```
1. Story A → Run audit → See metrics
2. Click "Re-run Audit"
3. Metrics update, no clear ✅
```

## Future Enhancements

### Possible Improvement 1: Store Results Per Story

```typescript
const [resultsMap, setResultsMap] = useState<Map<string, LighthouseResults>>(new Map());

// Store results keyed by story ID
const runLighthouse = async (skipCache = false) => {
  // ... run audit
  setResultsMap(prev => new Map(prev).set(storyId, data));
};

// Restore results when navigating back
useEffect(() => {
  if (resultsMap.has(storyId)) {
    setResults(resultsMap.get(storyId)!);
  } else {
    setResults(null);
  }
}, [storyId]);
```

**Pros:**
- Results persist when navigating back
- No need to re-run audit

**Cons:**
- More memory usage
- May show outdated results
- Complex state management

### Possible Improvement 2: Show Story Name in Results

```typescript
<Title>Lighthouse Metrics - {storyName}</Title>
```

**Pros:**
- User knows which story results are for
- Less confusion

**Cons:**
- Requires story name lookup
- More UI space needed

### Possible Improvement 3: Auto-Run Option

Add checkbox: "Auto-run audit on story change"

```typescript
const [autoRun, setAutoRun] = useState(false);

useEffect(() => {
  if (autoRun && storyId !== currentStoryId) {
    runLighthouse(false); // Use cache
  }
}, [storyId]);
```

**Pros:**
- Power user feature
- Convenient for auditing multiple stories

**Cons:**
- Can be slow
- Resource intensive

## Summary

✅ **Fixed:** Results now clear when navigating to different story  
✅ **Detection:** Uses `useStorybookState()` to track story changes  
✅ **Console Log:** Shows when clearing: `📖 Story changed`  
✅ **Empty State:** Prompts user to run audit for new story  
✅ **Cache:** Still works when re-running audit  
✅ **Same Story:** Re-run button updates without clearing  

**Result:** Accurate, story-specific Lighthouse metrics! 🎯
