/**
 * Custom hooks for managing inline styles in Pega environment
 */

import { useMemo, useState, type CSSProperties } from 'react';
import { tw, mergeStyles } from '../utils/tailwindToInline';

/**
 * Hook to convert Tailwind classes to inline styles with memoization
 * Useful for static styles that don't change
 */
export function useStaticStyles(classNames: string): CSSProperties {
    return useMemo(() => tw(classNames), [classNames]);
}

/**
 * Hook for dynamic styles based on state/props
 * Example: const styles = useDynamicStyles('base classes', { 'active-class': isActive })
 */
export function useDynamicStyles(
    baseClasses: string,
    conditionalClasses?: Record<string, boolean>
): CSSProperties {
    return useMemo(() => {
        let allClasses = baseClasses;

        if (conditionalClasses) {
            Object.entries(conditionalClasses).forEach(([className, condition]) => {
                if (condition) {
                    allClasses += ` ${className}`;
                }
            });
        }

        return tw(allClasses);
    }, [baseClasses, conditionalClasses]);
}

/**
 * Hook for hover styles management
 * Returns [baseStyles, isHovered, handlers]
 */
export function useHoverStyles(
    baseClasses: string,
    hoverClasses: string
): [CSSProperties, boolean, { onMouseEnter: () => void; onMouseLeave: () => void }] {
    const [isHovered, setIsHovered] = useState(false);

    const baseStyles = useMemo(() => tw(baseClasses), [baseClasses]);
    const hoverStyles = useMemo(() => tw(hoverClasses), [hoverClasses]);

    const currentStyles = useMemo(
        () => (isHovered ? mergeStyles(baseStyles, hoverStyles) : baseStyles),
        [isHovered, baseStyles, hoverStyles]
    );

    const handlers = useMemo(
        () => ({
            onMouseEnter: () => setIsHovered(true),
            onMouseLeave: () => setIsHovered(false),
        }),
        []
    );

    return [currentStyles, isHovered, handlers];
}

/**
 * Hook for focus styles management
 * Returns [baseStyles, isFocused, handlers]
 */
export function useFocusStyles(
    baseClasses: string,
    focusClasses: string
): [CSSProperties, boolean, { onFocus: () => void; onBlur: () => void }] {
    const [isFocused, setIsFocused] = useState(false);

    const baseStyles = useMemo(() => tw(baseClasses), [baseClasses]);
    const focusStyles = useMemo(() => tw(focusClasses), [focusClasses]);

    const currentStyles = useMemo(
        () => (isFocused ? mergeStyles(baseStyles, focusStyles) : baseStyles),
        [isFocused, baseStyles, focusStyles]
    );

    const handlers = useMemo(
        () => ({
            onFocus: () => setIsFocused(true),
            onBlur: () => setIsFocused(false),
        }),
        []
    );

    return [currentStyles, isFocused, handlers];
}

/**
 * Combined hook for hover and focus styles
 * Returns [currentStyles, state, handlers]
 */
export function useInteractiveStyles(
    baseClasses: string,
    hoverClasses?: string,
    focusClasses?: string
): [
        CSSProperties,
        { isHovered: boolean; isFocused: boolean },
        {
            onMouseEnter: () => void;
            onMouseLeave: () => void;
            onFocus: () => void;
            onBlur: () => void;
        }
    ] {
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const baseStyles = useMemo(() => tw(baseClasses), [baseClasses]);
    const hoverStyleObj = useMemo(
        () => (hoverClasses ? tw(hoverClasses) : {}),
        [hoverClasses]
    );
    const focusStyleObj = useMemo(
        () => (focusClasses ? tw(focusClasses) : {}),
        [focusClasses]
    );

    const currentStyles = useMemo(() => {
        let styles = baseStyles;
        if (isHovered && hoverClasses) {
            styles = mergeStyles(styles, hoverStyleObj);
        }
        if (isFocused && focusClasses) {
            styles = mergeStyles(styles, focusStyleObj);
        }
        return styles;
    }, [isHovered, isFocused, baseStyles, hoverStyleObj, focusStyleObj, hoverClasses, focusClasses]);

    const handlers = useMemo(
        () => ({
            onMouseEnter: () => setIsHovered(true),
            onMouseLeave: () => setIsHovered(false),
            onFocus: () => setIsFocused(true),
            onBlur: () => setIsFocused(false),
        }),
        []
    );

    return [currentStyles, { isHovered, isFocused }, handlers];
}

/**
 * Hook for managing multiple style variants
 * Example: const styles = useVariantStyles('base', { primary: 'bg-blue-500', secondary: 'bg-gray-500' }, 'primary')
 */
export function useVariantStyles<T extends string>(
    baseClasses: string,
    variants: Record<T, string>,
    currentVariant: T
): CSSProperties {
    return useMemo(() => {
        const variantClasses = variants[currentVariant] || '';
        return tw(`${baseClasses} ${variantClasses}`);
    }, [baseClasses, variants, currentVariant]);
}

/**
 * Hook for responsive styles (manual breakpoint management)
 * Pass window width and breakpoint configuration
 */
export function useResponsiveStyles(
    classesConfig: {
        base: string;
        sm?: string;  // >= 640px
        md?: string;  // >= 768px
        lg?: string;  // >= 1024px
        xl?: string;  // >= 1280px
    },
    windowWidth?: number
): CSSProperties {
    return useMemo(() => {
        const width = windowWidth || (typeof window !== 'undefined' ? window.innerWidth : 1024);

        let classes = classesConfig.base;

        if (width >= 640 && classesConfig.sm) classes += ` ${classesConfig.sm}`;
        if (width >= 768 && classesConfig.md) classes += ` ${classesConfig.md}`;
        if (width >= 1024 && classesConfig.lg) classes += ` ${classesConfig.lg}`;
        if (width >= 1280 && classesConfig.xl) classes += ` ${classesConfig.xl}`;

        return tw(classes);
    }, [classesConfig, windowWidth]);
}

/**
 * Hook for disabled state styles
 */
export function useDisabledStyles(
    baseClasses: string,
    disabledClasses: string,
    isDisabled: boolean
): CSSProperties {
    return useMemo(() => {
        const classes = isDisabled ? `${baseClasses} ${disabledClasses}` : baseClasses;
        return tw(classes);
    }, [baseClasses, disabledClasses, isDisabled]);
}

/**
 * Hook for animations with inline styles
 * Returns styles with transition properties
 */
export function useTransitionStyles(
    baseClasses: string,
    transitionProperty: 'all' | 'colors' | 'opacity' | 'transform' = 'all',
    duration = 150
): CSSProperties {
    return useMemo(() => {
        const styles = tw(baseClasses);

        const transitionMap = {
            all: 'all',
            colors: 'color, background-color, border-color',
            opacity: 'opacity',
            transform: 'transform',
        };

        return {
            ...styles,
            transition: `${transitionMap[transitionProperty]} ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        };
    }, [baseClasses, transitionProperty, duration]);
}
