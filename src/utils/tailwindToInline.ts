/**
 * Tailwind to Inline Styles Converter
 * Converts Tailwind class names to React inline style objects
 * for use in Pega environments where external CSS is restricted
 */

import type { CSSProperties } from 'react';

// Tailwind color palette
const colors = {
    // Gray scale
    'gray-50': '#f9fafb',
    'gray-100': '#f3f4f6',
    'gray-200': '#e5e7eb',
    'gray-300': '#d1d5db',
    'gray-400': '#9ca3af',
    'gray-500': '#6b7280',
    'gray-600': '#4b5563',
    'gray-700': '#374151',
    'gray-800': '#1f2937',
    'gray-900': '#111827',

    // Blue
    'blue-50': '#eff6ff',
    'blue-100': '#dbeafe',
    'blue-200': '#bfdbfe',
    'blue-300': '#93c5fd',
    'blue-400': '#60a5fa',
    'blue-500': '#3b82f6',
    'blue-600': '#2563eb',
    'blue-700': '#1d4ed8',
    'blue-800': '#1e40af',
    'blue-900': '#1e3a8a',

    // Red
    'red-50': '#fef2f2',
    'red-100': '#fee2e2',
    'red-200': '#fecaca',
    'red-300': '#fca5a5',
    'red-400': '#f87171',
    'red-500': '#ef4444',
    'red-600': '#dc2626',
    'red-700': '#b91c1c',
    'red-800': '#991b1b',
    'red-900': '#7f1d1d',

    // Green
    'green-50': '#f0fdf4',
    'green-100': '#dcfce7',
    'green-200': '#bbf7d0',
    'green-300': '#86efac',
    'green-400': '#4ade80',
    'green-500': '#22c55e',
    'green-600': '#16a34a',
    'green-700': '#15803d',
    'green-800': '#166534',
    'green-900': '#14532d',

    // Yellow
    'yellow-50': '#fefce8',
    'yellow-100': '#fef9c3',
    'yellow-200': '#fef08a',
    'yellow-300': '#fde047',
    'yellow-400': '#facc15',
    'yellow-500': '#eab308',
    'yellow-600': '#ca8a04',
    'yellow-700': '#a16207',
    'yellow-800': '#854d0e',
    'yellow-900': '#713f12',

    // Orange
    'orange-50': '#fff7ed',
    'orange-100': '#ffedd5',
    'orange-200': '#fed7aa',
    'orange-300': '#fdba74',
    'orange-400': '#fb923c',
    'orange-500': '#f97316',
    'orange-600': '#ea580c',
    'orange-700': '#c2410c',
    'orange-800': '#9a3412',
    'orange-900': '#7c2d12',

    // Pink
    'pink-50': '#fdf2f8',
    'pink-100': '#fce7f3',
    'pink-200': '#fbcfe8',
    'pink-300': '#f9a8d4',
    'pink-400': '#f472b6',
    'pink-500': '#ec4899',
    'pink-600': '#db2777',
    'pink-700': '#be185d',
    'pink-800': '#9d174d',
    'pink-900': '#831843',

    // Cyan
    'cyan-50': '#ecfeff',
    'cyan-100': '#cffafe',
    'cyan-200': '#a5f3fc',
    'cyan-300': '#67e8f9',
    'cyan-400': '#22d3ee',
    'cyan-500': '#06b6d4',
    'cyan-600': '#0891b2',
    'cyan-700': '#0e7490',
    'cyan-800': '#155e75',
    'cyan-900': '#164e63',

    // Purple
    'purple-50': '#faf5ff',
    'purple-100': '#f3e8ff',
    'purple-200': '#e9d5ff',
    'purple-300': '#d8b4fe',
    'purple-400': '#c084fc',
    'purple-500': '#a855f7',
    'purple-600': '#9333ea',
    'purple-700': '#7e22ce',
    'purple-800': '#6b21a8',
    'purple-900': '#581c87',

    // Indigo
    'indigo-50': '#eef2ff',
    'indigo-100': '#e0e7ff',
    'indigo-200': '#c7d2fe',
    'indigo-300': '#a5b4fc',
    'indigo-400': '#818cf8',
    'indigo-500': '#6366f1',
    'indigo-600': '#4f46e5',
    'indigo-700': '#4338ca',
    'indigo-800': '#3730a3',
    'indigo-900': '#312e81',

    // Utility colors
    'white': '#ffffff',
    'black': '#000000',
    'transparent': 'transparent',
    'current': 'currentColor',
};

// Spacing scale (in pixels)
const spacing = {
    '0': '0px',
    '0.5': '2px',
    '1': '4px',
    '1.5': '6px',
    '2': '8px',
    '2.5': '10px',
    '3': '12px',
    '3.5': '14px',
    '4': '16px',
    '5': '20px',
    '6': '24px',
    '7': '28px',
    '8': '32px',
    '9': '36px',
    '10': '40px',
    '11': '44px',
    '12': '48px',
    '14': '56px',
    '16': '64px',
    '20': '80px',
    '24': '96px',
    '28': '112px',
    '32': '128px',
    '36': '144px',
    '40': '160px',
    '44': '176px',
    '48': '192px',
    '52': '208px',
    '56': '224px',
    '60': '240px',
    '64': '256px',
    '72': '288px',
    '80': '320px',
    '96': '384px',
};

// Font sizes
const fontSize = {
    'xs': '0.75rem',
    'sm': '0.875rem',
    'base': '1rem',
    'lg': '1.125rem',
    'xl': '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
};

// Font weights
const fontWeight = {
    'thin': '100',
    'extralight': '200',
    'light': '300',
    'normal': '400',
    'medium': '500',
    'semibold': '600',
    'bold': '700',
    'extrabold': '800',
    'black': '900',
};

/**
 * Main conversion function
 * Converts Tailwind class names to React inline style object
 */
export function tw(...classNames: (string | undefined | null | false)[]): CSSProperties {
    const styles: CSSProperties = {};

    // Filter out falsy values and join classes
    const classes = classNames
        .filter(Boolean)
        .join(' ')
        .split(/\s+/)
        .filter(Boolean);

    // Check for gradient classes
    const gradientDirection = classes.find(c => c.startsWith('bg-gradient-to-'));
    const fromColor = classes.find(c => c.startsWith('from-'));
    const viaColor = classes.find(c => c.startsWith('via-'));
    const toColor = classes.find(c => c.startsWith('to-'));

    // Handle gradient if all required classes are present
    if (gradientDirection && fromColor && toColor) {
        const direction = gradientDirection.replace('bg-gradient-to-', '');
        const directionMap: Record<string, string> = {
            't': 'to top',
            'tr': 'to top right',
            'r': 'to right',
            'br': 'to bottom right',
            'b': 'to bottom',
            'bl': 'to bottom left',
            'l': 'to left',
            'tl': 'to top left',
        };

        const from = colors[fromColor.replace('from-', '') as keyof typeof colors];
        const to = colors[toColor.replace('to-', '') as keyof typeof colors];

        if (from && to && directionMap[direction]) {
            if (viaColor) {
                const via = colors[viaColor.replace('via-', '') as keyof typeof colors];
                if (via) {
                    styles.backgroundImage = `linear-gradient(${directionMap[direction]}, ${from}, ${via}, ${to})`;
                }
            } else {
                styles.backgroundImage = `linear-gradient(${directionMap[direction]}, ${from}, ${to})`;
            }
        }
    }

    classes.forEach(className => {
        const style = parseClassName(className);
        Object.assign(styles, style);
    });

    return styles;
}

/**
 * Parse individual class name and return style object
 */
function parseClassName(className: string): CSSProperties {
    const styles: CSSProperties = {};

    // Handle responsive prefixes (ignore for inline styles)
    const cleanClass = className.replace(/^(sm:|md:|lg:|xl:|2xl:)/, '');

    // Handle pseudo-class prefixes (hover, focus, etc.) - store for later
    if (cleanClass.includes('hover:') || cleanClass.includes('focus:') ||
        cleanClass.includes('active:') || cleanClass.includes('disabled:')) {
        return styles; // Skip pseudo-classes for base styles
    }

    // Display
    if (cleanClass === 'block') styles.display = 'block';
    if (cleanClass === 'inline-block') styles.display = 'inline-block';
    if (cleanClass === 'inline') styles.display = 'inline';
    if (cleanClass === 'flex') styles.display = 'flex';
    if (cleanClass === 'inline-flex') styles.display = 'inline-flex';
    if (cleanClass === 'grid') styles.display = 'grid';
    if (cleanClass === 'inline-grid') styles.display = 'inline-grid';
    if (cleanClass === 'hidden') styles.display = 'none';

    // Flexbox
    if (cleanClass === 'flex-row') styles.flexDirection = 'row';
    if (cleanClass === 'flex-col') styles.flexDirection = 'column';
    if (cleanClass === 'flex-wrap') styles.flexWrap = 'wrap';
    if (cleanClass === 'flex-nowrap') styles.flexWrap = 'nowrap';
    if (cleanClass === 'items-start') styles.alignItems = 'flex-start';
    if (cleanClass === 'items-center') styles.alignItems = 'center';
    if (cleanClass === 'items-end') styles.alignItems = 'flex-end';
    if (cleanClass === 'items-stretch') styles.alignItems = 'stretch';
    if (cleanClass === 'justify-start') styles.justifyContent = 'flex-start';
    if (cleanClass === 'justify-center') styles.justifyContent = 'center';
    if (cleanClass === 'justify-end') styles.justifyContent = 'flex-end';
    if (cleanClass === 'justify-between') styles.justifyContent = 'space-between';
    if (cleanClass === 'justify-around') styles.justifyContent = 'space-around';
    if (cleanClass === 'flex-1') styles.flex = '1 1 0%';
    if (cleanClass === 'flex-auto') styles.flex = '1 1 auto';
    if (cleanClass === 'flex-none') styles.flex = 'none';

    // Gap
    const gapMatch = cleanClass.match(/^gap-(\d+\.?\d*)$/);
    if (gapMatch) styles.gap = spacing[gapMatch[1] as keyof typeof spacing] || `${gapMatch[1]}px`;

    const gapXMatch = cleanClass.match(/^gap-x-(\d+\.?\d*)$/);
    if (gapXMatch) styles.columnGap = spacing[gapXMatch[1] as keyof typeof spacing] || `${gapXMatch[1]}px`;

    const gapYMatch = cleanClass.match(/^gap-y-(\d+\.?\d*)$/);
    if (gapYMatch) styles.rowGap = spacing[gapYMatch[1] as keyof typeof spacing] || `${gapYMatch[1]}px`;

    // Padding
    const pMatch = cleanClass.match(/^p-(\d+\.?\d*)$/);
    if (pMatch) styles.padding = spacing[pMatch[1] as keyof typeof spacing] || `${pMatch[1]}px`;

    const pxMatch = cleanClass.match(/^px-(\d+\.?\d*)$/);
    if (pxMatch) {
        const val = spacing[pxMatch[1] as keyof typeof spacing] || `${pxMatch[1]}px`;
        styles.paddingLeft = val;
        styles.paddingRight = val;
    }

    const pyMatch = cleanClass.match(/^py-(\d+\.?\d*)$/);
    if (pyMatch) {
        const val = spacing[pyMatch[1] as keyof typeof spacing] || `${pyMatch[1]}px`;
        styles.paddingTop = val;
        styles.paddingBottom = val;
    }

    const ptMatch = cleanClass.match(/^pt-(\d+\.?\d*)$/);
    if (ptMatch) styles.paddingTop = spacing[ptMatch[1] as keyof typeof spacing] || `${ptMatch[1]}px`;

    const prMatch = cleanClass.match(/^pr-(\d+\.?\d*)$/);
    if (prMatch) styles.paddingRight = spacing[prMatch[1] as keyof typeof spacing] || `${prMatch[1]}px`;

    const pbMatch = cleanClass.match(/^pb-(\d+\.?\d*)$/);
    if (pbMatch) styles.paddingBottom = spacing[pbMatch[1] as keyof typeof spacing] || `${pbMatch[1]}px`;

    const plMatch = cleanClass.match(/^pl-(\d+\.?\d*)$/);
    if (plMatch) styles.paddingLeft = spacing[plMatch[1] as keyof typeof spacing] || `${plMatch[1]}px`;

    // Margin (with arbitrary value support)
    const mArbitraryMatch = cleanClass.match(/^m-\[(.+?)\]$/);
    if (mArbitraryMatch) {
        styles.margin = mArbitraryMatch[1];
    } else {
        const mMatch = cleanClass.match(/^m-(\d+\.?\d*)$/);
        if (mMatch) styles.margin = spacing[mMatch[1] as keyof typeof spacing] || `${mMatch[1]}px`;
    }

    const mxMatch = cleanClass.match(/^mx-(\d+\.?\d*)$/);
    if (mxMatch) {
        const val = spacing[mxMatch[1] as keyof typeof spacing] || `${mxMatch[1]}px`;
        styles.marginLeft = val;
        styles.marginRight = val;
    }

    const myMatch = cleanClass.match(/^my-(\d+\.?\d*)$/);
    if (myMatch) {
        const val = spacing[myMatch[1] as keyof typeof spacing] || `${myMatch[1]}px`;
        styles.marginTop = val;
        styles.marginBottom = val;
    }

    const mtArbitraryMatch = cleanClass.match(/^mt-\[(.+?)\]$/);
    if (mtArbitraryMatch) {
        styles.marginTop = mtArbitraryMatch[1];
    } else {
        const mtMatch = cleanClass.match(/^mt-(\d+\.?\d*)$/);
        if (mtMatch) styles.marginTop = spacing[mtMatch[1] as keyof typeof spacing] || `${mtMatch[1]}px`;
    }

    const mrMatch = cleanClass.match(/^mr-(\d+\.?\d*)$/);
    if (mrMatch) styles.marginRight = spacing[mrMatch[1] as keyof typeof spacing] || `${mrMatch[1]}px`;

    const mbArbitraryMatch = cleanClass.match(/^mb-\[(.+?)\]$/);
    if (mbArbitraryMatch) {
        styles.marginBottom = mbArbitraryMatch[1];
    } else {
        const mbMatch = cleanClass.match(/^mb-(\d+\.?\d*)$/);
        if (mbMatch) styles.marginBottom = spacing[mbMatch[1] as keyof typeof spacing] || `${mbMatch[1]}px`;
    }

    const mlMatch = cleanClass.match(/^ml-(\d+\.?\d*)$/);
    if (mlMatch) styles.marginLeft = spacing[mlMatch[1] as keyof typeof spacing] || `${mlMatch[1]}px`;

    // Width (with arbitrary value support)
    if (cleanClass === 'w-full') styles.width = '100%';
    if (cleanClass === 'w-auto') styles.width = 'auto';
    const wArbitraryMatch = cleanClass.match(/^w-\[(.+?)\]$/);
    if (wArbitraryMatch) {
        styles.width = wArbitraryMatch[1];
    } else {
        const wMatch = cleanClass.match(/^w-(\d+\.?\d*)$/);
        if (wMatch) styles.width = spacing[wMatch[1] as keyof typeof spacing] || `${wMatch[1]}px`;
        const wPercentMatch = cleanClass.match(/^w-(\d+)\/(\d+)$/);
        if (wPercentMatch) styles.width = `${(parseInt(wPercentMatch[1], 10) / parseInt(wPercentMatch[2], 10)) * 100}%`;
    }

    // Height (with arbitrary value support)
    if (cleanClass === 'h-full') styles.height = '100%';
    if (cleanClass === 'h-auto') styles.height = 'auto';
    if (cleanClass === 'h-screen') styles.height = '100vh';
    const hArbitraryMatch = cleanClass.match(/^h-\[(.+?)\]$/);
    if (hArbitraryMatch) {
        styles.height = hArbitraryMatch[1];
    } else {
        const hMatch = cleanClass.match(/^h-(\d+\.?\d*)$/);
        if (hMatch) styles.height = spacing[hMatch[1] as keyof typeof spacing] || `${hMatch[1]}px`;
    }

    // Min/Max dimensions
    if (cleanClass === 'min-w-full') styles.minWidth = '100%';
    if (cleanClass === 'min-h-full') styles.minHeight = '100%';
    if (cleanClass === 'max-w-full') styles.maxWidth = '100%';
    if (cleanClass === 'max-h-full') styles.maxHeight = '100%';

    const maxWMatch = cleanClass.match(/^max-w-(\w+)$/);
    if (maxWMatch) {
        const sizes: Record<string, string> = {
            'xs': '320px',
            'sm': '384px',
            'md': '448px',
            'lg': '512px',
            'xl': '576px',
            '2xl': '672px',
            '3xl': '768px',
            '4xl': '896px',
            '5xl': '1024px',
            '6xl': '1152px',
            '7xl': '1280px',
        };
        if (sizes[maxWMatch[1]]) styles.maxWidth = sizes[maxWMatch[1]];
    }

    // Text color (with opacity support)
    const textColorMatch = cleanClass.match(/^text-(.+)$/);
    if (textColorMatch) {
        const [colorName, opacity] = textColorMatch[1].split('/');
        const color = colors[colorName as keyof typeof colors];
        if (color) {
            if (opacity) {
                // Handle opacity modifier (e.g., text-white/50)
                const opacityValue = parseInt(opacity, 10) / 100;
                if (color.startsWith('#')) {
                    // Convert hex to rgba
                    const r = parseInt(color.slice(1, 3), 16);
                    const g = parseInt(color.slice(3, 5), 16);
                    const b = parseInt(color.slice(5, 7), 16);
                    styles.color = `rgba(${r}, ${g}, ${b}, ${opacityValue})`;
                } else {
                    styles.color = color;
                    styles.opacity = opacityValue;
                }
            } else {
                styles.color = color;
            }
        }
    }

    // Background color (with opacity support)
    const bgColorMatch = cleanClass.match(/^bg-(.+)$/);
    if (bgColorMatch) {
        const [colorName, opacity] = bgColorMatch[1].split('/');
        const color = colors[colorName as keyof typeof colors];
        if (color) {
            if (opacity) {
                // Handle opacity modifier (e.g., bg-purple-900/50)
                const opacityValue = parseInt(opacity, 10) / 100;
                if (color.startsWith('#')) {
                    // Convert hex to rgba
                    const r = parseInt(color.slice(1, 3), 16);
                    const g = parseInt(color.slice(3, 5), 16);
                    const b = parseInt(color.slice(5, 7), 16);
                    styles.backgroundColor = `rgba(${r}, ${g}, ${b}, ${opacityValue})`;
                } else {
                    styles.backgroundColor = color;
                }
            } else {
                styles.backgroundColor = color;
            }
        }
    }

    // Gradient backgrounds - we need to handle this in tw() function to combine all gradient classes
    // For now, just mark gradient direction
    if (cleanClass.startsWith('bg-gradient-to-')) {
        // Will be processed after all classes are collected
    }

    // Border color (with opacity support)
    const borderColorMatch = cleanClass.match(/^border-(.+)$/);
    if (borderColorMatch) {
        const [colorName, opacity] = borderColorMatch[1].split('/');
        const color = colors[colorName as keyof typeof colors];
        if (color) {
            if (opacity) {
                // Handle opacity modifier
                const opacityValue = parseInt(opacity, 10) / 100;
                if (color.startsWith('#')) {
                    // Convert hex to rgba
                    const r = parseInt(color.slice(1, 3), 16);
                    const g = parseInt(color.slice(3, 5), 16);
                    const b = parseInt(color.slice(5, 7), 16);
                    styles.borderColor = `rgba(${r}, ${g}, ${b}, ${opacityValue})`;
                } else {
                    styles.borderColor = color;
                }
            } else {
                styles.borderColor = color;
            }
        }
    }

    // Border width
    if (cleanClass === 'border') styles.borderWidth = '1px';
    if (cleanClass === 'border-0') styles.borderWidth = '0px';
    if (cleanClass === 'border-2') styles.borderWidth = '2px';
    if (cleanClass === 'border-4') styles.borderWidth = '4px';
    if (cleanClass === 'border-8') styles.borderWidth = '8px';

    const borderTMatch = cleanClass.match(/^border-t-?(\d*)$/);
    if (borderTMatch) styles.borderTopWidth = borderTMatch[1] ? `${borderTMatch[1]}px` : '1px';

    const borderRMatch = cleanClass.match(/^border-r-?(\d*)$/);
    if (borderRMatch) styles.borderRightWidth = borderRMatch[1] ? `${borderRMatch[1]}px` : '1px';

    const borderBMatch = cleanClass.match(/^border-b-?(\d*)$/);
    if (borderBMatch) styles.borderBottomWidth = borderBMatch[1] ? `${borderBMatch[1]}px` : '1px';

    const borderLMatch = cleanClass.match(/^border-l-?(\d*)$/);
    if (borderLMatch) styles.borderLeftWidth = borderLMatch[1] ? `${borderLMatch[1]}px` : '1px';

    // Border radius
    if (cleanClass === 'rounded-none') styles.borderRadius = '0px';
    if (cleanClass === 'rounded-sm') styles.borderRadius = '2px';
    if (cleanClass === 'rounded') styles.borderRadius = '4px';
    if (cleanClass === 'rounded-md') styles.borderRadius = '6px';
    if (cleanClass === 'rounded-lg') styles.borderRadius = '8px';
    if (cleanClass === 'rounded-xl') styles.borderRadius = '12px';
    if (cleanClass === 'rounded-2xl') styles.borderRadius = '16px';
    if (cleanClass === 'rounded-3xl') styles.borderRadius = '24px';
    if (cleanClass === 'rounded-full') styles.borderRadius = '9999px';

    // Border style
    if (cleanClass === 'border-solid') styles.borderStyle = 'solid';
    if (cleanClass === 'border-dashed') styles.borderStyle = 'dashed';
    if (cleanClass === 'border-dotted') styles.borderStyle = 'dotted';
    if (cleanClass === 'border-none') styles.borderStyle = 'none';

    // Font size (including arbitrary values like text-[10px])
    const fontSizeArbitraryMatch = cleanClass.match(/^text-\[(.+?)\]$/);
    if (fontSizeArbitraryMatch) {
        styles.fontSize = fontSizeArbitraryMatch[1];
    } else {
        const fontSizeMatch = cleanClass.match(/^text-(\w+)$/);
        if (fontSizeMatch && fontSize[fontSizeMatch[1] as keyof typeof fontSize]) {
            styles.fontSize = fontSize[fontSizeMatch[1] as keyof typeof fontSize];
        }
    }

    // Font weight
    const fontWeightMatch = cleanClass.match(/^font-(\w+)$/);
    if (fontWeightMatch && fontWeight[fontWeightMatch[1] as keyof typeof fontWeight]) {
        styles.fontWeight = fontWeight[fontWeightMatch[1] as keyof typeof fontWeight];
    }

    // Text alignment
    if (cleanClass === 'text-left') styles.textAlign = 'left';
    if (cleanClass === 'text-center') styles.textAlign = 'center';
    if (cleanClass === 'text-right') styles.textAlign = 'right';
    if (cleanClass === 'text-justify') styles.textAlign = 'justify';

    // Text decoration
    if (cleanClass === 'underline') styles.textDecoration = 'underline';
    if (cleanClass === 'line-through') styles.textDecoration = 'line-through';
    if (cleanClass === 'no-underline') styles.textDecoration = 'none';

    // Text transform
    if (cleanClass === 'uppercase') styles.textTransform = 'uppercase';
    if (cleanClass === 'lowercase') styles.textTransform = 'lowercase';
    if (cleanClass === 'capitalize') styles.textTransform = 'capitalize';
    if (cleanClass === 'normal-case') styles.textTransform = 'none';

    // Position
    if (cleanClass === 'static') styles.position = 'static';
    if (cleanClass === 'fixed') styles.position = 'fixed';
    if (cleanClass === 'absolute') styles.position = 'absolute';
    if (cleanClass === 'relative') styles.position = 'relative';
    if (cleanClass === 'sticky') styles.position = 'sticky';

    // Top/Right/Bottom/Left (with negative value support)
    const topMatch = cleanClass.match(/^-?top-(\d+\.?\d*)$/);
    if (topMatch) {
        const isNegative = cleanClass.startsWith('-');
        const value = spacing[topMatch[1] as keyof typeof spacing] || `${topMatch[1]}px`;
        styles.top = isNegative ? `-${value}` : value;
    }

    const rightMatch = cleanClass.match(/^-?right-(\d+\.?\d*)$/);
    if (rightMatch) {
        const isNegative = cleanClass.startsWith('-');
        const value = spacing[rightMatch[1] as keyof typeof spacing] || `${rightMatch[1]}px`;
        styles.right = isNegative ? `-${value}` : value;
    }

    const bottomMatch = cleanClass.match(/^-?bottom-(\d+\.?\d*)$/);
    if (bottomMatch) {
        const isNegative = cleanClass.startsWith('-');
        const value = spacing[bottomMatch[1] as keyof typeof spacing] || `${bottomMatch[1]}px`;
        styles.bottom = isNegative ? `-${value}` : value;
    }

    const leftMatch = cleanClass.match(/^-?left-(\d+\.?\d*)$/);
    if (leftMatch) {
        const isNegative = cleanClass.startsWith('-');
        const value = spacing[leftMatch[1] as keyof typeof spacing] || `${leftMatch[1]}px`;
        styles.left = isNegative ? `-${value}` : value;
    }

    // Z-index
    const zMatch = cleanClass.match(/^z-(\d+)$/);
    if (zMatch) styles.zIndex = parseInt(zMatch[1], 10);

    // Transform & Rotate
    if (cleanClass === 'transform') {
        // Base transform class, actual transforms added by rotate, scale, etc.
    }
    if (cleanClass === '-rotate-90') styles.transform = 'rotate(-90deg)';
    if (cleanClass === 'rotate-90') styles.transform = 'rotate(90deg)';
    if (cleanClass === 'rotate-180') styles.transform = 'rotate(180deg)';
    if (cleanClass === '-rotate-180') styles.transform = 'rotate(-180deg)';
    if (cleanClass === 'rotate-0') styles.transform = 'rotate(0deg)';
    if (cleanClass === 'rotate-45') styles.transform = 'rotate(45deg)';
    if (cleanClass === '-rotate-45') styles.transform = 'rotate(-45deg)';

    // Overflow
    if (cleanClass === 'overflow-auto') styles.overflow = 'auto';
    if (cleanClass === 'overflow-hidden') styles.overflow = 'hidden';
    if (cleanClass === 'overflow-visible') styles.overflow = 'visible';
    if (cleanClass === 'overflow-scroll') styles.overflow = 'scroll';
    if (cleanClass === 'overflow-x-auto') styles.overflowX = 'auto';
    if (cleanClass === 'overflow-y-auto') styles.overflowY = 'auto';

    // Opacity
    const opacityMatch = cleanClass.match(/^opacity-(\d+)$/);
    if (opacityMatch) styles.opacity = parseInt(opacityMatch[1], 10) / 100;

    // Cursor
    if (cleanClass === 'cursor-pointer') styles.cursor = 'pointer';
    if (cleanClass === 'cursor-default') styles.cursor = 'default';
    if (cleanClass === 'cursor-not-allowed') styles.cursor = 'not-allowed';
    if (cleanClass === 'cursor-move') styles.cursor = 'move';

    // Shadow
    if (cleanClass === 'shadow-sm') styles.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
    if (cleanClass === 'shadow') styles.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)';
    if (cleanClass === 'shadow-md') styles.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
    if (cleanClass === 'shadow-lg') styles.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)';
    if (cleanClass === 'shadow-xl') styles.boxShadow = '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)';
    if (cleanClass === 'shadow-none') styles.boxShadow = 'none';

    // Transition
    if (cleanClass === 'transition') styles.transition = 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)';
    if (cleanClass === 'transition-all') styles.transition = 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)';
    if (cleanClass === 'transition-colors') styles.transition = 'color, background-color, border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)';

    // Line height
    if (cleanClass === 'leading-none') styles.lineHeight = '1';
    if (cleanClass === 'leading-tight') styles.lineHeight = '1.25';
    if (cleanClass === 'leading-snug') styles.lineHeight = '1.375';
    if (cleanClass === 'leading-normal') styles.lineHeight = '1.5';
    if (cleanClass === 'leading-relaxed') styles.lineHeight = '1.625';
    if (cleanClass === 'leading-loose') styles.lineHeight = '2';

    // Letter spacing (tracking)
    if (cleanClass === 'tracking-tighter') styles.letterSpacing = '-0.05em';
    if (cleanClass === 'tracking-tight') styles.letterSpacing = '-0.025em';
    if (cleanClass === 'tracking-normal') styles.letterSpacing = '0em';
    if (cleanClass === 'tracking-wide') styles.letterSpacing = '0.025em';
    if (cleanClass === 'tracking-wider') styles.letterSpacing = '0.05em';
    if (cleanClass === 'tracking-widest') styles.letterSpacing = '0.1em';

    // Whitespace
    if (cleanClass === 'whitespace-normal') styles.whiteSpace = 'normal';
    if (cleanClass === 'whitespace-nowrap') styles.whiteSpace = 'nowrap';
    if (cleanClass === 'whitespace-pre') styles.whiteSpace = 'pre';
    if (cleanClass === 'whitespace-pre-line') styles.whiteSpace = 'pre-line';
    if (cleanClass === 'whitespace-pre-wrap') styles.whiteSpace = 'pre-wrap';

    // Pointer events
    if (cleanClass === 'pointer-events-none') styles.pointerEvents = 'none';
    if (cleanClass === 'pointer-events-auto') styles.pointerEvents = 'auto';

    return styles;
}

/**
 * Hook for conditional styles based on state
 */
export function useTw(baseClasses: string, conditionalClasses?: Record<string, boolean>) {
    let classes = baseClasses;

    if (conditionalClasses) {
        Object.entries(conditionalClasses).forEach(([className, condition]) => {
            if (condition) {
                classes += ` ${className}`;
            }
        });
    }

    return tw(classes);
}

/**
 * Combine multiple style objects (useful for component composition)
 */
export function mergeStyles(...styles: (CSSProperties | undefined)[]): CSSProperties {
    return Object.assign({}, ...styles.filter(Boolean));
}

/**
 * Export color palette for direct access
 */
export { colors, spacing, fontSize, fontWeight };
