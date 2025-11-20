# Integration Testing Guide - Pega DX API

This document provides comprehensive testing scenarios for the Pega DX API integration, covering fallback mechanisms, error handling, and feature flag switching.

## Test Environment Setup

### Prerequisites
- Feature flags accessible in `src/config/featureFlags.ts`
- Browser DevTools Console open for monitoring
- Network throttling tools available (for offline testing)

### Key Feature Flags
```typescript
// Enable/disable DX API
featureFlags.api.useDxApi = true / false

// Enable verbose logging
featureFlags.developer.enableVerboseLogging = true

// Cache configuration
featureFlags.api.enableCaching = true
featureFlags.api.enableBatchRequests = true
```

---

## Test Scenarios

### 1. Fallback to Mock Data

**Objective:** Verify that the application automatically falls back to mock data when DX API is unavailable.

#### Test 1.1: Disable DX API Flag
```
Steps:
1. Open DevTools Console
2. Execute: featureFlags.api.useDxApi = false
3. Refresh the application
4. Navigate to Library Panel
5. Search for an ingredient

Expected Result:
✅ Data loads from mock (instant, no network delay)
✅ Console shows: "[API Service] Using mock data"
✅ Library panel displays mock ingredients
✅ Performance metrics show 0 network requests
```

#### Test 1.2: Enable DX API Flag
```
Steps:
1. Execute: featureFlags.api.useDxApi = true
2. Refresh the application
3. Navigate to Library Panel
4. Search for an ingredient

Expected Result:
✅ Data attempts to load from DX API
✅ Console shows DX API configuration
✅ Network tab shows API calls
✅ If API fails, automatically falls back to mock
```

#### Test 1.3: Network Error Fallback
```
Steps:
1. Enable DX API flag: featureFlags.api.useDxApi = true
2. Open Network tab in DevTools
3. Enable offline mode (or throttle to simulate failure)
4. Navigate to Library Panel
5. Try to search for ingredients

Expected Result:
✅ API call fails
✅ Console shows error retry attempts (up to 3)
✅ Application automatically falls back to mock data
✅ User sees data (from mock) without errors
✅ Graceful degradation - no broken UI
```

---

### 2. Error Handling & Recovery

#### Test 2.1: API Timeout Handling
```
Steps:
1. Enable DX API: featureFlags.api.useDxApi = true
2. Set network throttling to 'Slow 3G'
3. Click compliance check button
4. Observe behavior

Expected Result:
✅ Request retries up to 3 times
✅ Exponential backoff applied (1s, 2s, 4s)
✅ Loading state displayed during retries
✅ After 3 failures, graceful error message
✅ User can retry manually
```

#### Test 2.2: Invalid Response Handling
```
Steps:
1. Enable DX API: featureFlags.api.useDxApi = true
2. Open Network tab
3. Search for ingredients
4. In Network tab, intercept response and corrupt it
5. Observe error handling

Expected Result:
✅ Error is caught and logged
✅ Console shows: "[DxApiService] Error response"
✅ Falls back to mock data if available
✅ User sees reasonable error message
✅ No application crash
```

#### Test 2.3: Missing Authentication
```
Steps:
1. Clear auth token: localStorage.removeItem('pega_auth_token')
2. Enable DX API: featureFlags.api.useDxApi = true
3. Navigate to Library Panel
4. Try any operation

Expected Result:
✅ Application attempts to refresh token
✅ Token refresh endpoint called
✅ If refresh fails, returns meaningful error
✅ User prompted to log in again (if applicable)
```

---

### 3. Cache Behavior Testing

#### Test 3.1: Cache Hit
```
Steps:
1. Execute in console: cacheManager.resetMetrics()
2. Open Library Panel
3. Search for ingredient "Jasmine"
4. Clear search, search again for "Jasmine"
5. Execute: console.log(cacheManager.getStats())

Expected Result:
✅ First search: hits=0, misses=1
✅ Second search: hits=1, misses=1
✅ hitRate = 50%
✅ Second request completes instantly (from cache)
✅ No network request for second search
```

#### Test 3.2: Cache Expiration
```
Steps:
1. Execute: cacheManager.resetMetrics()
2. Search for an ingredient
3. Execute: cacheManager.getStats() - note TTL value
4. Wait for TTL to expire (usually 5 minutes)
5. Search for same ingredient again

Expected Result:
✅ Cache entry removed after TTL expires
✅ New network request made
✅ Second search hits network, not cache
✅ Data is fresh and up-to-date
```

#### Test 3.3: Cache Size Management
```
Steps:
1. Execute: cacheManager.getStats()
2. Add many ingredients to workspace
3. Perform multiple searches
4. Execute: cacheManager.getStats()
5. Monitor size growth

Expected Result:
✅ Size increases as items added
✅ Never exceeds 50MB limit
✅ When limit approached, LRU eviction triggered
✅ Least recently used items removed first
✅ Most important data retained in cache
```

---

### 4. Request Deduplication Testing

#### Test 4.1: Duplicate Requests
```
Steps:
1. Execute: requestBatcher.resetMetrics()
2. Rapidly click "Get Formulas" button 5 times
3. Wait for requests to complete
4. Execute: console.log(requestBatcher.getStats())

Expected Result:
✅ totalRequests = 5
✅ deduplicatedRequests = 4 (4 duplicates merged into 1)
✅ deduplicationRate = 80%
✅ Only 1 actual network request made
✅ All 5 promises resolved with same data
```

#### Test 4.2: Different Requests (No Dedup)
```
Steps:
1. Execute: requestBatcher.resetMetrics()
2. Search for "Jasmine"
3. Search for "Rose"
4. Search for "Lavender"
5. Execute: console.log(requestBatcher.getStats())

Expected Result:
✅ totalRequests = 3
✅ deduplicatedRequests = 0
✅ deduplicationRate = 0%
✅ 3 unique network requests made
✅ Each gets unique data
```

#### Test 4.3: Batching Performance
```
Steps:
1. Disable caching: featureFlags.api.enableCaching = false
2. Execute: requestBatcher.resetMetrics()
3. Rapidly perform 10 similar searches
4. Time how long it takes
5. Compare with batching disabled

Expected Result:
✅ With batching: Much faster (300ms debounce + parallel)
✅ Without batching: Slower (individual requests)
✅ Deduplication stats show significant savings
✅ Network tab shows fewer total requests
```

---

### 5. Feature Flag Switching

#### Test 5.1: Toggle DX API at Runtime
```
Steps:
1. Open Library Panel with DX API enabled
2. Search for ingredient (loads from API)
3. Execute: featureFlags.api.useDxApi = false
4. Search for different ingredient
5. Execute: featureFlags.api.useDxApi = true
6. Search again

Expected Result:
✅ Toggle works without page refresh
✅ Step 2: Data from API
✅ Step 4: Data from mock (instant)
✅ Step 6: Data from API again
✅ No errors or data inconsistency
```

#### Test 5.2: Toggle Caching
```
Steps:
1. Execute: cacheManager.resetMetrics()
2. Caching enabled: featureFlags.api.enableCaching = true
3. Search 5 times for same ingredient
4. Check metrics: hitRate should be high
5. Execute: featureFlags.api.enableCaching = false
6. Search 5 times for same ingredient
7. Check metrics: hitRate should be 0

Expected Result:
✅ With caching: hitRate > 80%
✅ Without caching: hitRate = 0%
✅ Toggle takes effect immediately
✅ Toggle doesn't cause errors
```

#### Test 5.3: Toggle Batching
```
Steps:
1. Execute: requestBatcher.resetMetrics()
2. Batching enabled: featureFlags.api.enableBatchRequests = true
3. Rapidly perform 5 searches
4. Check deduplication rate
5. Execute: featureFlags.api.enableBatchRequests = false
6. Rapidly perform 5 searches
7. Check deduplication rate

Expected Result:
✅ With batching: deduplicationRate > 60%
✅ Without batching: deduplicationRate = 0%
✅ Network requests behave differently
✅ No errors with toggle
```

---

### 6. Compliance & Submission Testing

#### Test 6.1: Compliance Check with API
```
Steps:
1. Enable DX API: featureFlags.api.useDxApi = true
2. Create formula with valid data
3. Click "Compliance Check" button
4. Observe results

Expected Result:
✅ API call to compliance endpoint
✅ Results show in compliance panel
✅ Status: "Compliant" or error details
✅ No crashes, graceful error handling
```

#### Test 6.2: Compliance Check with Mock
```
Steps:
1. Disable DX API: featureFlags.api.useDxApi = false
2. Create formula with valid data
3. Click "Compliance Check" button
4. Observe results

Expected Result:
✅ Returns mock compliance data instantly
✅ Shows as "Compliant: true"
✅ Same UI behavior as DX API
✅ No visual difference to user
```

#### Test 6.3: Formula Submission
```
Steps:
1. Create formula with valid data (total = 100%)
2. Set as active formula
3. Click "Send for Compounding"
4. Observe toast notifications

Expected Result:
✅ Loading toast shown
✅ Formula validated before submission
✅ If valid: Success notification
✅ If invalid: Error notification with details
✅ Submission recorded in undo history
```

---

### 7. Workspace Persistence Testing

#### Test 7.1: Save Workspace
```
Steps:
1. Create workspace with formulas and data
2. Click "Save Workspace" button
3. Enter workspace name
4. Verify save notification

Expected Result:
✅ Workspace saved successfully
✅ Data persisted to API (or localStorage)
✅ Can be retrieved later
✅ All state preserved: formulas, columns, data
```

#### Test 7.2: Load Workspace
```
Steps:
1. Open workspace selector
2. Select previously saved workspace
3. Verify all data loads correctly

Expected Result:
✅ All formulas load
✅ All columns restore
✅ All data intact
✅ Ready to continue work
```

#### Test 7.3: Workspace with API Failure
```
Steps:
1. Enable offline mode
2. Try to save workspace
3. Observe behavior

Expected Result:
✅ Saves to localStorage first
✅ Shows notification about local storage
✅ Will sync to API when connection restored
✅ Data not lost
```

---

### 8. Performance Metrics Testing

#### Test 8.1: Check Cache Metrics
```
JavaScript:
const stats = cacheManager.getStats();
console.table(stats);
```

Expected Metrics:
```
size: 1,234,567 (bytes)
maxSize: 52,428,800 (50MB)
entries: 156
utilizationPercent: 2.35%
hits: 234
misses: 45
hitRate: 83.92%
evictions: 0
```

#### Test 8.2: Check Batcher Metrics
```
JavaScript:
const stats = requestBatcher.getStats();
console.table(stats);
```

Expected Metrics:
```
totalRequests: 1,250
deduplicatedRequests: 875
deduplicationRate: 70%
batchesProcessed: 25
currentQueueSize: 0
```

#### Test 8.3: Compare Performance
```
Steps:
1. Measure with all optimizations enabled
2. Measure with optimizations disabled
3. Compare response times and network usage

Expected Result:
✅ With optimizations: Faster load times
✅ With optimizations: Reduced network traffic
✅ High cache hit rates (>80%)
✅ Significant deduplication (>60%)
```

---

## Automated Testing Scenarios

### Console Test Script
```javascript
// Run all tests programmatically
async function runIntegrationTests() {
  console.log('=== Integration Test Suite ===');
  
  // Test 1: Cache functionality
  console.log('\n1. Testing Cache...');
  cacheManager.resetMetrics();
  cacheManager.set('test-key', { data: 'test' }, 5000);
  const cached = cacheManager.get('test-key');
  console.log('Cache set/get:', cached ? '✓ PASS' : '✗ FAIL');
  
  // Test 2: Request batcher
  console.log('\n2. Testing Request Batcher...');
  requestBatcher.resetMetrics();
  const stats = requestBatcher.getStats();
  console.log('Batcher initialized:', stats.totalRequests === 0 ? '✓ PASS' : '✗ FAIL');
  
  // Test 3: API Service routing
  console.log('\n3. Testing API Service...');
  const apiMode = ApiService.getApiMode();
  console.log('API mode:', apiMode);
  
  // Test 4: Feature flags
  console.log('\n4. Testing Feature Flags...');
  console.log('DX API enabled:', featureFlags.api.useDxApi);
  console.log('Caching enabled:', featureFlags.api.enableCaching);
  
  console.log('\n=== Tests Complete ===');
}

// Execute
runIntegrationTests();
```

---

## Troubleshooting

### Cache Not Working
```
1. Check: cacheManager.getStats() shows hits > 0
2. Verify: featureFlags.api.enableCaching = true
3. Check: TTL not expired (age < ttl in getEntries())
```

### Batching Not Deduplicating
```
1. Check: requestBatcher.getStats() shows deduplicationRate > 0
2. Verify: featureFlags.api.enableBatchRequests = true
3. Ensure: Requests made with same key within 300ms
```

### Fallback Not Triggering
```
1. Disable network in DevTools
2. Set featureFlags.api.useDxApi = true
3. Make API request
4. Should fall back to mock
```

### Auth Token Issues
```
1. Clear: localStorage.removeItem('pega_auth_token')
2. Check: DxApiService attempts refresh
3. Verify: New token obtained or error handled
```

---

## Success Criteria

✅ **All fallback scenarios** execute without errors
✅ **Cache hit rate** > 80% in normal usage
✅ **Request deduplication** saves > 60% of requests
✅ **API failures** gracefully fall back to mock
✅ **Feature flags** toggle at runtime
✅ **No data loss** on failures or toggles
✅ **All operations** work with and without DX API
✅ **Performance metrics** accurate and accessible

---

## Next Steps

1. **Automated Testing**: Create Jest/Vitest test files
2. **Load Testing**: Test with simulated high traffic
3. **Regression Testing**: Verify after each deployment
4. **User Acceptance Testing**: Real-world usage validation
5. **Performance Profiling**: Monitor production metrics
