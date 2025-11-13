/**
 * Icon mapping utility for Material Symbols (Rounded, Weight 300)
 * 
 * Migration from Remix Icon (ri-*) to Material Symbols
 * Date: October 17, 2025
 * Reference: docs/ICON_MIGRATION_TO_MATERIAL_SYMBOLS.md
 * 
 * All icons use:
 * - Style: Rounded
 * - Weight: 300 (Light)
 * - Size: Variable (16px to 36px via Tailwind classes)
 * 
 * Usage:
 *   import { iconMap } from '../utils/iconMap';
 *   <span className="material-symbols-rounded">{iconMap.beaker}</span>
 */

export const iconMap = {
    // Navigation & UI
    close: "close",
    add: "add",
    deleteOutline: "delete_outline",
    expandMore: "expand_more",
    arrowBack: "arrow_back",
    edit: "edit",
    contentCopy: "content_copy",
    moreVert: "more_vert",
    folder: "folder",
    arrowUp: "arrow_upward",
    arrowDown: "arrow_downward",
    unfoldMore: "unfold_more",

    // Flask & Formula
    beaker: "beaker", // Main ingredient/formula icon
    science: "science", // Alternative for formulas/lab
    bomb: "bomb", // Explode functionality
    callMerge: "call_merge", // Merge duplicates

    // Actions & Controls
    send: "send", // Send for compounding
    save: "save", // Save workspace/state
    undo: "undo", // Undo operation
    redo: "redo", // Redo (future)
    balance: "balance", // Normalize

    // Status & Feedback
    info: "info",
    warning: "warning",
    checkCircle: "check_circle",
    error: "error",
    check: "check",

    // UI Elements
    tune: "tune", // Filter
    search: "search",
    visibility: "visibility",
    visibilityOff: "visibility_off",
    checklist: "checklist",
    dragIndicator: "drag_indicator",
    lock: "lock",
    lockOpen: "lock_open",

    // Physical Properties
    thermostat: "thermostat", // Temperature hot
    acUnit: "ac_unit", // Temperature cold
    localFireDepartment: "local_fire_department", // Flash point/fire
    waterDrop: "water_drop", // Solubility/liquid
    lens: "lens", // Refraction/optical
    opacity: "opacity", // Water percent/transparency

    // Files & Documents
    pictureAsPdf: "picture_as_pdf",
    description: "description", // Word/text files
    tableChart: "table_chart", // Excel/spreadsheet
    download: "download",
    upload: "upload",
    eyeSmall: "eye",

    // Logistics & Business
    localShipping: "local_shipping", // Suppliers/shipping
    shoppingBag: "shopping_bag", // Product
    person: "person", // User/created by
    calendarToday: "calendar_today", // Date/timestamp
    localOffer: "local_offer", // Price/tag
    attachMoney: "attach_money", // Currency/cost
    tag: "tag", // Tag/hashtag
    mail: "mail", // Email/contact

    // Communication & Info
    chatBubble: "chat_bubble",
    infoSmall: "info",

    // Formulas (Advanced)
    flask2: "science", // Alternative flask
    moleculeProfile: "atom", // Molecular/chemistry
    labProfile: "labs", // Laboratory
} as const;

/**
 * Type-safe icon name
 */
export type IconName = keyof typeof iconMap;

/**
 * Icon size options
 */
export type IconSize = "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";

/**
 * Map icon size to Tailwind text class
 */
export const IconSizeMap: Record<IconSize, string> = {
    xs: "text-xs", // 16px
    sm: "text-sm", // 18px
    base: "text-base", // 20px
    lg: "text-lg", // 22px
    xl: "text-xl", // 24px (default)
    "2xl": "text-2xl", // 28px
    "3xl": "text-3xl", // 32px
    "4xl": "text-4xl", // 36px
} as const;

/**
 * Props for Icon component
 */
export interface IconProps {
    name: IconName;
    className?: string;
    size?: IconSize;
    title?: string;
    ariaLabel?: string;
}

/**
 * Helper function to get Material Symbols icon name
 */
export const getIconName = (iconName: IconName): string => {
    return iconMap[iconName];
};

/**
 * Helper to create icon HTML string
 * Useful for contexts where JSX is not available
 */
export const createIconHTML = (
    name: IconName,
    className = ""
): string => {
    return `<span class="material-symbols-rounded ${className}">${iconMap[name]}</span>`;
};

/**
 * Common icon combinations/aliases
 */
export const iconAliases = {
    // Action pairs
    addRemove: { add: "add", remove: "delete_outline" },
    showHide: { show: "visibility", hide: "visibility_off" },
    expandCollapse: { expand: "expand_more", collapse: "unfold_more" },

    // Formula operations
    formula: {
        add: "beaker",
        merge: "call_merge",
        explode: "bomb",
        normalize: "balance",
    },

    // Navigation
    navigation: {
        back: "arrow_back",
        forward: "arrow_forward",
        up: "arrow_upward",
        down: "arrow_downward",
    },

    // Status
    status: {
        success: "check_circle",
        error: "error",
        warning: "warning",
        info: "info",
    },

    // File types
    fileTypes: {
        pdf: "picture_as_pdf",
        document: "description",
        spreadsheet: "table_chart",
        text: "description",
    },
} as const;

/**
 * Migration notes from Remix Icon:
 * 
 * Key changes:
 * 1. ri-flask-line → beaker
 * 2. ri-test-tube-line → science (or beaker)
 * 3. ri-git-merge-line → call_merge
 * 4. ri-scales-3-line → balance
 * 5. ri-send-plane-line → send
 * 6. ri-close-line → close
 * 7. ri-add-line → add
 * 8. ri-draggable → drag_indicator
 * 9. ri-folder-3-line → folder
 * 10. ri-file-copy-line → content_copy
 * 
 * All Material Symbols use:
 * - Font family: 'Material Symbols Rounded'
 * - Font weight: 300 (Light)
 * - Available sizes: 16px to 36px (via Tailwind text-* classes)
 * 
 * Benefits:
 * - Smaller font file (~50KB vs ~150KB)
 * - Faster loading time
 * - Modern, professional appearance
 * - Consistent rounded style
 * - Better typography
 */
