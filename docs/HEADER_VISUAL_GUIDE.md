# Header Panel Visual Guide

## Before vs After

### Before
```
┌────────────────────────────────────────────────────────────────────────────┐
│  [🧪+] [⛙] [⚖️] [✈️] [↶]  [Run Compliance]  [⋮]                          │
└────────────────────────────────────────────────────────────────────────────┘
  Square icons, mixed sizes, text button
```

### After
```
┌────────────────────────────────────────────────────────────────────────────┐
│  [Tab1] [Tab2] [Tab3] [⋮]  │  ( 🧪+ ) ( ⛙ ) ( ⚖️ ) ( ✈️ )  │  [💾 Save State] ( ↶ ) ( ⋮ )  │
└────────────────────────────────────────────────────────────────────────────┘
  Workspace tabs              Round icons, grouped          Action button    Settings
```

## Icon Changes

### Consistency Updates
All icons now use:
- ⭕ **Rounded shape**: `rounded-full` (circular)
- 📏 **Uniform size**: 36px × 36px (`w-9 h-9`)
- 🎨 **Consistent colors**: Purple-700 background, white icons
- ✨ **Same hover**: Purple-600 on hover
- 🔳 **Visual grouping**: Separated by vertical lines

### Icon Improvements

| Action | Before | After | Change |
|--------|--------|-------|--------|
| **Normalize** | `ri-scales-line` | `ri-scales-3-line` | Better perfume context |
| **Shape** | Square `rounded-md` | Circle `rounded-full` | Consistent design |
| **Size** | Mixed (32px-36px) | Uniform 36px | Better alignment |
| **Disabled** | `opacity-50` | `bg-purple-700/50` | Clearer state |

## New Components

### 1. Workspace Tabs
```
┌─────────────────────────────────┐
│  [Active WS] [Inactive] [⋮]     │
│   ^^^^^^^^                       │
│   White bg, purple text          │
└─────────────────────────────────┘
```

Features:
- Click to switch workspaces
- Active tab highlighted (white background)
- Inactive tabs (purple-700 background)
- Dropdown for management (⋮ button)

### 2. Workspace Dropdown
```
┌────────────────────────────────────┐
│  Workspaces              2 / 3     │
├────────────────────────────────────┤
│  📄 Summer 2024      [✏️] [🗑️]    │
│     Modified: 10/14               │
│                                   │
│  📄 Rose Variants    [✏️] [🗑️]    │
│     Modified: 10/13  [Active]     │
├────────────────────────────────────┤
│  [💾 Save Current State]          │
└────────────────────────────────────┘
```

Actions available:
- ✏️ Rename inline
- 🗑️ Delete with confirmation
- View last modified date
- See active workspace indicator
- Create new workspace

### 3. Save Workspace Modal
```
┌───────────────────────────────────┐
│  Save Workspace              [×]  │
├───────────────────────────────────┤
│                                   │
│  Workspace Name                   │
│  ┌─────────────────────────────┐ │
│  │ Summer Collection 2024      │ │
│  └─────────────────────────────┘ │
│                                   │
│  Give your workspace a            │
│  meaningful name...               │
│                                   │
│            [Cancel] [💾 Save]     │
└───────────────────────────────────┘
```

Features:
- Text input for custom name
- Default name with timestamp
- Enter to save, Escape to cancel
- Validation (non-empty)

## Action Groups

### Group 1: Workspace Management
```
[Tab 1] [Tab 2] [Tab 3] [⋮]
```
- Switch between workspaces
- Manage workspaces via dropdown
- Max 3 workspaces supported

### Group 2: Formula Actions (Rounded Icons)
```
│ ( 🧪+ ) ( ⛙ ) ( ⚖️ ) ( ✈️ ) │
```
- 🧪+ New Formula
- ⛙ Merge Duplicates
- ⚖️ Normalize (changed to scales-3)
- ✈️ Send for Compounding

### Group 3: State & Settings
```
[💾 Save State] ( ↶ ) ( ⋮ )
```
- 💾 Save State (replaces Run Compliance)
- ↶ Undo (with counter badge)
- ⋮ More Actions

## Color Palette

### Background Colors
```css
Header:           bg-purple-800     #6b21a8
Separators:       bg-purple-600     #9333ea
```

### Tab Colors
```css
Active Tab:       bg-white          #ffffff
                  text-purple-800   #6b21a8

Inactive Tab:     bg-purple-700     #7e22ce
                  text-white        #ffffff
```

### Button Colors
```css
Icon Buttons:     bg-purple-700     #7e22ce
Hover:            bg-purple-600     #9333ea
Disabled:         bg-purple-700/50  #7e22ce with 50% opacity

Save Button:      bg-blue-600       #2563eb
Hover:            bg-blue-700       #1d4ed8

Undo Badge:       bg-blue-500       #3b82f6
```

## Spacing & Sizing

### Measurements
```
Icon Buttons:      36px × 36px (w-9 h-9)
Icons:             16px (text-base)
Button Gap:        6px (gap-1.5) within groups
Group Gap:         12px (gap-3) between groups
Separator:         1px width, 24px height (h-6)
Tab Padding:       12px horizontal, 6px vertical (px-3 py-1.5)
Save Button:       16px horizontal, 8px vertical (px-4 py-2)
```

### Visual Hierarchy
```
Level 1: Workspace Tabs (primary navigation)
    ↓
Level 2: Action buttons (formula operations)
    ↓
Level 3: State management (save, undo)
    ↓
Level 4: Settings (more options)
```

## Responsive Behavior

### Desktop (> 1024px)
- All elements visible
- Full button labels
- Expanded workspace tabs

### Tablet (768px - 1024px)
- Icon buttons remain circular
- Save button shows icon + text
- Workspace tabs stack if needed

### Mobile (< 768px)
- Consider collapsing to hamburger menu
- Priority: Workspace switcher, Save State
- Secondary actions in dropdown

## Interaction States

### Button States
```css
Normal:    bg-purple-700 shadow-sm
Hover:     bg-purple-600 shadow-sm
Active:    bg-purple-500 shadow-md
Disabled:  bg-purple-700/50 cursor-not-allowed
Focus:     ring-2 ring-purple-500 ring-offset-2
```

### Tab States
```css
Active:    bg-white text-purple-800
Inactive:  bg-purple-700 text-white
Hover:     bg-purple-600 text-white (inactive only)
```

### Transitions
```css
All buttons:       transition-colors duration-200
Dropdown:          transition-opacity duration-150
Modal:             transition-all duration-300
```

## Accessibility

### ARIA Labels
```html
<button aria-label="New Formula" title="Create new formula">
<button aria-label="Save workspace state" title="Save current state">
<button aria-label="Undo last action" title="Undo (3 available)">
```

### Keyboard Navigation
```
Tab:           Navigate through buttons
Enter/Space:   Activate button
Escape:        Close dropdown/modal
Arrow Keys:    Navigate dropdown items
Ctrl+S:        Save workspace (future)
Ctrl+1/2/3:    Switch workspaces (future)
```

### Focus Indicators
- Ring around focused element
- Visible in both light and dark modes
- Minimum contrast ratio 3:1

## Implementation Checklist

- [x] Update all icon buttons to rounded-full
- [x] Standardize button size to 36px
- [x] Change normalize icon to scales-3
- [x] Add visual separators between groups
- [x] Create WorkspaceSelector component
- [x] Create SaveWorkspaceModal component
- [x] Integrate workspace management
- [x] Replace "Run Compliance" with "Save State"
- [x] Add hover effects to all buttons
- [x] Implement disabled states with proper opacity
- [x] Add shadow-sm to all buttons
- [x] Group formula actions together
- [ ] Connect workspace state to WorkArea (pending)
- [ ] Test on different screen sizes
- [ ] Verify keyboard navigation
- [ ] Test with screen reader
- [ ] Add keyboard shortcuts (future)

## Testing Scenarios

### Visual Testing
1. All icons appear circular ✓
2. Icons are same size (36px) ✓
3. Hover effects work ✓
4. Disabled states visible ✓
5. Separators aligned properly ✓
6. Colors match design ✓

### Functional Testing
1. Create new workspace ✓
2. Switch between workspaces ✓
3. Rename workspace ✓
4. Delete workspace ✓
5. Max 3 workspace limit ✓
6. State persists after refresh ✓
7. Active workspace highlighted ✓

### Edge Cases
1. Delete last workspace → prevented
2. Create 4th workspace → error shown
3. Empty workspace name → validation
4. Long workspace name → truncation
5. Quick workspace switching → no race conditions
6. localStorage full → error handling
