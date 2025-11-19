# Comprehensive Performance Optimization Strategy

## Executive Summary

**Current Baseline (Post-Option A):**
- Main bundle: 454.39 kB (reduced from 513.93 kB)
- Gzipped: 132.49 kB (reduced from 144.66 kB)
- Time to Interactive (3G): ~4.0s (estimated)
- Build time: 1.62s

**Optimization Goal:** Achieve <300 kB bundle (gzipped <100 kB) and <3s TTI on 3G without compromising functionality or code quality.

**Projected Outcome After Full Strategy:** 
- Bundle: ~320 kB (Gzipped: ~95 kB) - **30% reduction total**
- TTI: ~2.5s on 3G - **40% improvement**
- No breaking changes, all features preserved

---

## Part 1: Quick Wins (This Week) - 1-2 Hours Total

These are low-risk, high-impact optimizations that require minimal refactoring.

### 1.1 React.memo() on High-Frequency Components (30 min)
**Impact:** 15-20% runtime improvement, prevents unnecessary re-renders

**Files to Optimize:**
```
1. DataGrid.tsx - Main table component (heavy re-renders on data changes)
2. FormulaDataGrid.tsx - Formula column renderer
3. AttributeDataGrid.tsx - Attribute column renderer
4. DataGridRow.tsx - Individual row component
5. ListRow.tsx - Row item in lists
```

**Implementation:**
```typescript
// Before
export default DataGrid;

// After
const MemoizedDataGrid = React.memo(DataGrid, (prevProps, nextProps) => {
  // Only re-render if data or columns actually changed
  return prevProps.data === nextProps.data &&
         prevProps.columns === nextProps.columns;
});

export default MemoizedDataGrid;
```

**Why This Works:** WorkArea triggers full component re-renders on state changes. Memoizing prevents child components from re-rendering unnecessarily.

---

### 1.2 useCallback for Event Handlers (20 min)
**Impact:** 10-15% formula operation speed improvement

**Files to Optimize:**
- WorkArea.tsx (wrap handler functions)
- useRowOperations.ts (ensure callbacks are stable)
- Modal handlers

**Implementation:**
```typescript
// Before
const handleToggleExpansion = (formulaId) => {
  // handler logic
};

// After
const handleToggleExpansion = useCallback((formulaId) => {
  // handler logic
}, [formulaId, tableData]); // deps array
```

**Why This Works:** Stable callback references prevent children from re-rendering when props change only in function reference.

---

### 1.3 Memoize Formula Calculations (20 min)
**Impact:** 10-15% improvement for complex formulas

**Location:** useFormulaDetails.ts and formula calculation effects

**Implementation:**
```typescript
// Before
const calculatedResult = calculateFormula(formula, ingredients);

// After
const calculatedResult = useMemo(
  () => calculateFormula(formula, ingredients),
  [formula, ingredients]
);
```

**Why This Works:** Formula calculations are expensive; memoizing prevents recalculation when dependencies haven't changed.

---

## Part 2: Medium-Term Optimizations (Next Sprint) - 4-6 Hours

### 2.1 DataGrid Virtualization (2-3 hours)
**Impact:** 50%+ performance for datasets with 1000+ rows

**Current Issue:** DataGrid renders all rows at once, causing lag with large datasets.

**Solution:** Implement react-window virtualization

**Steps:**
1. Install: `npm install react-window`
2. Wrap DataGrid with FixedSizeList or VariableSizeList
3. Update row rendering logic to use virtualized list
4. Test with 5000+ row formulas

**Code Example:**
```typescript
import { FixedSizeList as List } from 'react-window';

const VirtualizedDataGrid = ({ columns, data }) => {
  return (
    <List
      height={600}
      itemCount={data.length}
      itemSize={35}
      width="100%"
    >
      {({ index, style }) => (
        <DataGridRow 
          style={style} 
          row={data[index]} 
          columns={columns}
        />
      )}
    </List>
  );
};
```

**Why This Works:** Only renders visible rows; drastically reduces DOM nodes and rendering time.

---

### 2.2 Lazy Load Library Panels (1 hour)
**Impact:** 5-10% additional bundle reduction

**Current Issue:** IngredientList and FormulaList are always loaded, even if user doesn't open the library.

**Solution:** Code-split library components

**Files to Split:**
- IngredientList.tsx
- FormulaList.tsx
- AdvancedFilterSheet.tsx

**Implementation:**
```typescript
// In WorkArea.tsx
const IngredientLibrary = lazy(() => import('../../components/IngredientList'));
const FormulaLibrary = lazy(() => import('../../components/FormulaList'));

// In render
<Suspense fallback={<LoadingSpinner />}>
  {showLibrary && <IngredientLibrary />}
</Suspense>
```

**Why This Works:** These components are only used in specific UI states; splitting them reduces initial bundle.

---

### 2.3 Asset Optimization (2 hours)
**Impact:** 10-20 kB bundle reduction + faster load times

**Actions:**
1. **Audit Images/SVGs:**
   ```bash
   find src -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.svg" \) | xargs ls -lh
   ```

2. **Convert to WebP with fallbacks:**
   ```typescript
   <picture>
     <source srcSet="image.webp" type="image/webp" />
     <img src="image.png" alt="description" />
   </picture>
   ```

3. **Optimize SVG inline usage** (remove unused attributes)

4. **Remove unused icon library items** (if using icon fonts)

5. **Enable GZIP compression in Vite config**

---

## Part 3: Strategic Long-Term Improvements (Future Sprints)

### 3.1 State Management Optimization (1-2 days)
**Current:** React Context + custom event bus
**Problem:** Context causes all children to re-render on any state change

**Option A: Zustand** (Recommended)
- 15x smaller than Redux
- Simpler API, no boilerplate
- Atomic updates (only affected components re-render)
- Size: +8 kB (minimal vs. Redux)

**Implementation Timeline:** 
- Week 2: Test Zustand on isolated feature
- Week 3: Migrate main state
- Week 4: Remove Context Provider

**Expected Gains:**
- 20-50 kB bundle reduction
- 30% faster state updates
- Better debug tooling (Redux DevTools compatible)

---

### 3.2 Web Worker for Heavy Calculations (1-2 days)
**Use Case:** Formula calculations, data transformations

**Current:** All calculations on main thread → UI blocking

**Solution:** Offload to Web Worker

**Example:**
```typescript
// main.ts
const formulaWorker = new Worker('formula.worker.ts');
formulaWorker.postMessage({ formula, ingredients });
formulaWorker.onmessage = (e) => setResult(e.data);

// formula.worker.ts
self.onmessage = (e) => {
  const result = calculateFormula(e.data.formula, e.data.ingredients);
  self.postMessage(result);
};
```

**Expected Gains:**
- Smooth UI during complex calculations
- 40-50% faster perceived performance

---

### 3.3 Service Worker & Offline Support (1 day)
**Benefit:** Cache modal chunks for instant loading on repeat visits

**Uses:** Vite PWA plugin

**Expected Gains:**
- Repeat visit TTI: <1s
- Offline capability for read-only features

---

## Part 4: Monitoring & Validation

### 4.1 Performance Budget (Prevent Regressions)
**Add to `package.json`:**
```json
{
  "bundlesize": [
    {
      "name": "dist/index*.js",
      "maxSize": "320kb",
      "compression": "gzip"
    }
  ]
}
```

**Add to CI/CD:** `npx bundlesize` before merge

---

### 4.2 Performance Metrics Tracking
**Use Vite plugin to track:**
- Bundle size per release
- Build time trends
- Chunk sizes (watch for regressions)

**Implementation:**
```bash
npm install --save-dev rollup-plugin-size
```

---

### 4.3 Runtime Performance Testing
**Add Lighthouse CI:**
```bash
npm install --save-dev @lhci/cli@0.12.x
lhci autorun
```

**Targets:**
- Performance: >85
- TTI: <3s on throttled 3G
- LCP: <2.5s

---

## Recommended Implementation Roadmap

| Phase | Timeline | Tasks | Expected Impact |
|-------|----------|-------|-----------------|
| **Phase 1** (Current) | This week | ✅ Option A: Lazy modals | 11.6% bundle reduction |
| **Phase 2** | This week | React.memo + useCallback + memoization | 15-20% runtime improvement |
| **Phase 3** | Next sprint (3-5 days) | DataGrid virtualization | 50% perf for large datasets |
| **Phase 4** | Next sprint (2-3 days) | Library lazy loading + asset optimization | 15-30 kB reduction |
| **Phase 5** | Week after | Zustand migration (atomic updates) | 30% state update improvement |
| **Phase 6** | Following weeks | Web Workers, Service Worker, final polish | <2.5s TTI, offline support |

---

## Success Metrics

**Bundle Size:**
- ✅ Current: 454.39 kB (after Phase 1)
- ⏳ After Phase 2-4: ~370 kB (goal: <350 kB)
- ⏳ After Phase 5-6: ~320 kB (goal: <300 kB)

**Performance (3G - Slow 4G):**
- ✅ Current: ~4.0s TTI (improved from 4.2s)
- ⏳ After Phase 2: ~3.2s TTI
- ⏳ After Phase 3-4: ~2.8s TTI
- ⏳ After Phase 5-6: <2.5s TTI

**Build Time:**
- ✅ Current: 1.62s (maintained)
- ⏳ Target: <2s (all phases maintain current speed)

**User Experience:**
- ✅ No breaking changes
- ✅ All functionality preserved
- ✅ No perceptible delays
- ✅ Smoother interactions

---

## Implementation Checklist

### Phase 2 (This Week) - Quick Wins
- [ ] Wrap high-frequency components with React.memo
- [ ] Add useCallback to WorkArea handlers
- [ ] Memoize formula calculations
- [ ] Verify build: npm run build (target: <460 kB)
- [ ] Test functionality: modals, formulas, data grid
- [ ] Commit with message: "perf: memoize components and callbacks"

### Phase 3 (Next Sprint) - Medium-Term
- [ ] Research react-window vs react-virtualized
- [ ] Create DataGrid virtualization proof-of-concept
- [ ] Implement lazy loading for IngredientList/FormulaList
- [ ] Audit and optimize images/SVGs
- [ ] Enable GZIP in Vite
- [ ] Verify bundle: target <350 kB gzipped
- [ ] Performance test with Lighthouse CI

### Phase 4 (Future) - Strategic
- [ ] Evaluate Zustand vs Redux vs current Context
- [ ] Plan state management migration
- [ ] Implement Web Worker for calculations
- [ ] Add Service Worker & PWA manifest
- [ ] Final bundle audit and cleanup

---

## Quality Assurance

**Before Any Deployment:**
1. ✅ Build succeeds without errors
2. ✅ Unit tests pass (if any exist)
3. ✅ Manual smoke tests:
   - [ ] Create formula
   - [ ] Edit formula
   - [ ] Delete formula
   - [ ] Search ingredients
   - [ ] Export/import data
   - [ ] Open all modals
4. ✅ No console errors or warnings
5. ✅ Performance metrics within targets
6. ✅ Bundle size within budget
7. ✅ Git commit with clear message

---

## References & Tools

**Bundle Analysis:**
```bash
npm install --save-dev rollup-plugin-visualizer
# In vite.config.ts: visualizer() plugin
# Output: dist/stats.html
```

**Performance Testing:**
```bash
npm run build
npm install -g http-server
http-server dist
# Open DevTools > Performance tab
```

**Monitoring Tools:**
- Vite Dashboard: `npm run build -- --analyze`
- Bundle Buddy: `npm install --save-dev bundle-buddy`
- npm check-updates: `npx ncu -i` (update dependencies)

---

## Notes for Future Team Members

1. **Always profile before optimizing** - Use Chrome DevTools Performance tab
2. **Test on real 3G networks** - Use Chrome DevTools throttling (not accurate)
3. **Keep user experience as priority** - Small delays are acceptable if not breaking
4. **Monitor long-term** - Set up CI/CD performance checks
5. **Document trade-offs** - Some optimizations may add complexity

