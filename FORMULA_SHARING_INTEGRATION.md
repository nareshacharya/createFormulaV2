# Formula Sharing Feature - Integration Guide

## Overview
This document provides instructions for integrating the Formula Sharing feature into WorkArea.tsx or the main application component.

## Files Created

### 1. Types & Interfaces
- **`src/types/user.ts`** - User type definitions and sharing interfaces
- **Extended `src/services/pega.ts`** - Added sharing fields to Formula interface:
  - `isShared?: boolean`
  - `sharedWith?: string[]`
  - `sharedBy?: string`
  - `sharedDate?: string`
  - `isReadOnly?: boolean`

### 2. Services
- **`src/services/userService.ts`** - User management and sharing API service
  - `getUserList()` - Fetch users (currently mock data)
  - `shareFormula()` - Share formula with users
  - `unshareFormula()` - Revoke formula access
  - `getCurrentUserId()` - Get current user

### 3. Components
- **`src/components/ShareFormulaModal.tsx`** - Modal for sharing formulas
  - Search input for filtering users
  - User list with checkboxes
  - Share/Cancel actions
  - Loading states

### 4. Hooks
- **`src/hooks/useFormulaSharing.ts`** - Custom hook for sharing logic
  - `openShareModal()` - Open share modal
  - `closeShareModal()` - Close share modal
  - `shareFormula()` - Execute share operation
  - `isFormulaOwner()` - Check ownership
  - `canEditFormula()` - Check edit permissions
  - `getShareStatusText()` - Get share status display

### 5. UI Components Updated
- **`src/components/DataGrid/components/BulkActionsToolbar.tsx`**
  - Added `onShare` prop
  - Added `canShare` prop
  - Added Share button with icon

- **`src/components/DataGrid/components/headers/ColumnHeaderCell.tsx`**
  - Added `onShareFormula` prop
  - Added Share menu item in formula column actions

## Integration Steps for WorkArea.tsx

### Step 1: Import Dependencies

```typescript
import { useFormulaSharing } from '../../hooks/useFormulaSharing';
import ShareFormulaModal from '../../components/ShareFormulaModal';
import { UserService } from '../../services/userService';
```

### Step 2: Initialize Sharing Hook

```typescript
const {
  shareState,
  openShareModal,
  closeShareModal,
  shareFormula,
  isFormulaOwner,
  canEditFormula,
  getShareStatusText
} = useFormulaSharing();
```

### Step 3: Create Share Handler Functions

```typescript
// Handle share from bulk toolbar
const handleShareFromToolbar = () => {
  // Get the active formula or selected formula
  const formulaToShare = getActiveFormula(); // Implement based on your logic
  
  if (!formulaToShare) {
    toast.error('Please select a formula to share');
    return;
  }
  
  if (!isFormulaOwner(formulaToShare)) {
    toast.error('You can only share formulas you own');
    return;
  }
  
  openShareModal(formulaToShare);
};

// Handle share from column menu
const handleShareFromMenu = (columnId: string) => {
  const formula = getFormulaByColumnId(columnId); // Implement based on your logic
  
  if (!formula) {
    toast.error('Formula not found');
    return;
  }
  
  if (!isFormulaOwner(formula)) {
    toast.error('You can only share formulas you own');
    return;
  }
  
  openShareModal(formula);
};

// Execute share operation
const handleShare = async (formulaId: string, userIds: string[]) => {
  try {
    await shareFormula(formulaId, userIds);
    
    // Update formula in state with sharing info
    updateFormula(formulaId, {
      isShared: true,
      sharedWith: userIds,
      sharedBy: UserService.getCurrentUserId(),
      sharedDate: new Date().toISOString()
    });
    
    // Reload formulas or refresh state
    // await loadFormulas();
  } catch (error) {
    console.error('Share error:', error);
    throw error; // Let modal handle the error
  }
};
```

### Step 4: Update BulkActionsToolbar Props

```typescript
<BulkActionsToolbar
  selectedCount={selectedCount}
  onBulkDelete={handleBulkDelete}
  onClearSelection={clearSelection}
  onAddFormula={handleAddFormula}
  onMergeDuplicates={handleMergeDuplicates}
  onNormalize={handleNormalize}
  onSend={handleSend}
  onShare={handleShareFromToolbar}  // ← Add this
  onUndo={handleUndo}
  onComplianceCheck={handleComplianceCheck}
  onExport={handleExport}
  canUndo={canUndo}
  undoCount={undoCount}
  canSend={canSend}
  canShare={canShareFormula()}  // ← Add this - check if selected formula is owned
  canComplianceCheck={canComplianceCheck}
/>
```

### Step 5: Update ColumnHeaderCell Props

```typescript
<ColumnHeaderCell
  column={column}
  formulas={formulas}
  availableFormulas={availableFormulas}
  index={index}
  // ... other props
  onSendForCompounding={handleSendForCompoundingFromMenu}
  onShareFormula={handleShareFromMenu}  // ← Add this
  onEditFormulaDetails={handleEditFormulaDetails}
  // ... other props
/>
```

### Step 6: Add ShareFormulaModal Component

```typescript
return (
  <>
    {/* ... existing JSX */}
    
    {/* Share Formula Modal */}
    <ShareFormulaModal
      isOpen={shareState.isShareModalOpen}
      onClose={closeShareModal}
      formula={shareState.selectedFormula}
      onShare={handleShare}
    />
    
    {/* ... rest of JSX */}
  </>
);
```

### Step 7: Implement Read-Only Enforcement

```typescript
// In your edit/delete handlers, check permissions
const handleEditFormula = (formula: Formula) => {
  if (!canEditFormula(formula)) {
    toast.error('This formula is read-only. You cannot edit shared formulas.');
    return;
  }
  
  // Proceed with edit
  // ...
};

// Display lock icon for shared formulas
const renderFormulaStatus = (formula: Formula) => {
  const statusText = getShareStatusText(formula);
  
  if (statusText) {
    return (
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <span className="material-symbols-rounded text-xs">
          {formula.isReadOnly ? 'lock' : 'share'}
        </span>
        <span>{statusText}</span>
      </div>
    );
  }
  
  return null;
};
```

### Step 8: Helper Function for Permission Check

```typescript
// Check if current formula can be shared
const canShareFormula = (): boolean => {
  const activeFormula = getActiveFormula();
  
  if (!activeFormula) return false;
  
  // Only owner can share
  return isFormulaOwner(activeFormula);
};
```

## Testing Checklist

- [ ] Share button appears in BulkActionsToolbar
- [ ] Share option appears in formula column menu
- [ ] Share button only enabled for owned formulas
- [ ] Share modal opens with user list
- [ ] Search functionality filters users correctly
- [ ] Multiple users can be selected
- [ ] Share operation updates formula state
- [ ] Shared formulas show lock icon
- [ ] Read-only enforcement prevents edits
- [ ] Share status displayed correctly
- [ ] Error handling works properly

## Future Enhancements

1. **Pega Integration**
   - Replace mock user data with actual Pega Data Page
   - Implement real share API endpoint
   - Add user context from Pega

2. **Notifications**
   - Notify users when formula is shared with them
   - Email notifications (optional)

3. **Share Management**
   - View list of shared users
   - Revoke access from specific users
   - Transfer ownership

4. **Audit Trail**
   - Log sharing events
   - Track access history
   - Compliance reporting

## Notes

- All user data is currently mocked in `userService.ts`
- The share operation uses mock API calls
- Current user ID is hardcoded as 'current_user'
- Update these when Pega integration is available
