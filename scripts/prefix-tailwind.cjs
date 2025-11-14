#!/usr/bin/env node

/**
 * Script to prefix all Tailwind CSS classes with 'tw-'
 * This prevents style conflicts when integrating with Pega's styled-components
 */

const fs = require('fs');
const path = require('path');

// Tailwind utility prefixes and patterns
const tailwindPatterns = [
  // Layout
  'block', 'inline-block', 'inline', 'flex', 'inline-flex', 'table', 'inline-table',
  'table-caption', 'table-cell', 'table-column', 'table-column-group', 'table-footer-group',
  'table-header-group', 'table-row-group', 'table-row', 'flow-root', 'grid', 'inline-grid',
  'contents', 'list-item', 'hidden',
  
  // Flexbox & Grid
  'flex-row', 'flex-row-reverse', 'flex-col', 'flex-col-reverse', 'flex-wrap', 'flex-wrap-reverse',
  'flex-nowrap', 'flex-1', 'flex-auto', 'flex-initial', 'flex-none', 'shrink', 'shrink-0', 'grow',
  'grow-0', 'items-start', 'items-end', 'items-center', 'items-baseline', 'items-stretch',
  'justify-start', 'justify-end', 'justify-center', 'justify-between', 'justify-around',
  'justify-evenly', 'justify-stretch', 'gap-', 'space-x-', 'space-y-',
  
  // Sizing
  'w-', 'h-', 'min-w-', 'min-h-', 'max-w-', 'max-h-',
  
  // Spacing
  'p-', 'px-', 'py-', 'pt-', 'pr-', 'pb-', 'pl-', 'm-', 'mx-', 'my-', 'mt-', 'mr-', 'mb-', 'ml-',
  
  // Typography
  'text-', 'font-', 'leading-', 'tracking-', 'line-clamp-',
  'truncate', 'text-ellipsis', 'text-clip', 'break-normal', 'break-words', 'break-all',
  'uppercase', 'lowercase', 'capitalize', 'normal-case',
  'italic', 'not-italic', 'underline', 'overline', 'line-through', 'no-underline',
  
  // Backgrounds
  'bg-', 'from-', 'via-', 'to-',
  
  // Borders
  'border', 'border-', 'rounded', 'divide-', 'ring-', 'outline-',
  
  // Effects
  'shadow', 'opacity-', 'mix-blend-', 'bg-blend-',
  
  // Filters
  'blur-', 'brightness-', 'contrast-', 'drop-shadow', 'grayscale', 'hue-rotate-',
  'invert', 'saturate-', 'sepia', 'backdrop-',
  
  // Tables
  'border-collapse', 'border-separate', 'table-auto', 'table-fixed',
  
  // Transitions
  'transition', 'duration-', 'ease-', 'delay-', 'animate-',
  
  // Transforms
  'transform', 'rotate-', 'scale-', 'skew-', 'translate-',
  
  // Interactivity
  'cursor-', 'select-', 'pointer-events-', 'resize', 'scroll-',
  
  // SVG
  'fill-', 'stroke-',
  
  // Accessibility
  'sr-only', 'not-sr-only',
  
  // Position
  'static', 'fixed', 'absolute', 'relative', 'sticky',
  'inset-', 'top-', 'right-', 'bottom-', 'left-',
  
  // Overflow
  'overflow-', 'overscroll-',
  
  // Z-Index
  'z-',
  
  // Common standalone utilities
  'container', 'object-', 'aspect-', 'columns-', 'break-', 'box-',
  'float-', 'clear-', 'isolate', 'isolation-', 'object-',
  'align-', 'whitespace-', 'content-', 'self-', 'place-', 'order-',
];

// State modifiers
const stateModifiers = [
  'hover:', 'focus:', 'active:', 'disabled:', 'visited:', 'checked:',
  'focus-within:', 'focus-visible:', 'group-hover:', 'group-focus:',
];

// Responsive modifiers
const responsiveModifiers = ['sm:', 'md:', 'lg:', 'xl:', '2xl:'];

// Dark mode
const darkMode = ['dark:'];

// All modifiers
const allModifiers = [...stateModifiers, ...responsiveModifiers, ...darkMode];

function shouldPrefixClass(className) {
  // Skip if already prefixed
  if (className.startsWith('tw-')) return false;
  
  // Skip non-Tailwind classes (custom classes, icon classes, etc.)
  if (className.startsWith('ri-')) return false;
  if (className.startsWith('material-symbols')) return false;
  if (className === 'queryBuilder') return false;
  if (className === 'rule') return false;
  if (className === 'ruleGroup') return false;
  
  // Check for modifiers (hover:, md:, etc.)
  for (const modifier of allModifiers) {
    if (className.includes(modifier)) {
      return true;
    }
  }
  
  // Check if it starts with any Tailwind pattern
  for (const pattern of tailwindPatterns) {
    if (className === pattern || className.startsWith(pattern)) {
      return true;
    }
  }
  
  return false;
}

function prefixClassName(className) {
  // Handle modifier chains (e.g., "md:hover:bg-blue-500")
  const parts = className.split(':');
  
  if (parts.length === 1) {
    // No modifiers, just prefix if needed
    return shouldPrefixClass(className) ? `tw-${className}` : className;
  }
  
  // Has modifiers - check if the base class should be prefixed
  const baseClass = parts[parts.length - 1];
  if (shouldPrefixClass(baseClass)) {
    // Prefix all parts
    return parts.map(part => `tw-${part}`).join(':');
  }
  
  return className;
}

function processClassString(classString) {
  // Split by whitespace and filter empty strings
  const classes = classString.split(/\s+/).filter(Boolean);
  
  // Prefix each class that needs it
  const prefixedClasses = classes.map(prefixClassName);
  
  return prefixedClasses.join(' ');
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Match className with string literals
  // Pattern: className="..." or className='...'
  const classNamePattern = /className=["']([^"']+)["']/g;
  
  content = content.replace(classNamePattern, (match, classString) => {
    const processed = processClassString(classString);
    if (processed !== classString) {
      modified = true;
      return `className="${processed}"`;
    }
    return match;
  });
  
  // Match className with template literals
  // Pattern: className={`...`}
  const templatePattern = /className=\{`([^`]+)`\}/g;
  
  content = content.replace(templatePattern, (match, classString) => {
    // This is more complex as it may contain ${} expressions
    // We need to be careful to only prefix the static parts
    const parts = classString.split(/(\$\{[^}]+\})/);
    
    const processedParts = parts.map(part => {
      if (part.startsWith('${')) {
        // This is a template expression, don't modify
        return part;
      }
      // This is a static string, process it
      const processed = processClassString(part);
      if (processed !== part) {
        modified = true;
      }
      return processed;
    });
    
    return `className={\`${processedParts.join('')}\`}`;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

function walkDirectory(dir, fileCallback) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDirectory(filePath, fileCallback);
    } else if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.jsx'))) {
      fileCallback(filePath);
    }
  });
}

function main() {
  const srcDir = path.join(__dirname, '..', 'src');
  let filesProcessed = 0;
  let filesModified = 0;
  
  console.log('Starting Tailwind class prefixing...\n');
  
  walkDirectory(srcDir, (filePath) => {
    filesProcessed++;
    const relativePath = path.relative(process.cwd(), filePath);
    
    try {
      const modified = processFile(filePath);
      if (modified) {
        filesModified++;
        console.log(`✓ Modified: ${relativePath}`);
      }
    } catch (error) {
      console.error(`✗ Error processing ${relativePath}:`, error.message);
    }
  });
  
  console.log(`\n✨ Complete!`);
  console.log(`   Files processed: ${filesProcessed}`);
  console.log(`   Files modified: ${filesModified}`);
  console.log(`   All Tailwind classes are now prefixed with 'tw-'`);
}

main();
