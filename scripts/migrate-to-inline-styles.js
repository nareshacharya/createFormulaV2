#!/usr/bin/env node

/**
 * Automated migration script to convert className to inline styles
 * 
 * Usage:
 *   node scripts/migrate-to-inline-styles.js <component-file-path>
 * 
 * Example:
 *   node scripts/migrate-to-inline-styles.js src/components/Button.tsx
 */

const fs = require('fs');
const path = require('path');

function migrateComponent(filePath) {
  console.log(`\n🔄 Migrating: ${filePath}`);
  
  // Read the file
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  let changes = 0;
  
  // Step 1: Add tw import if not present
  if (!content.includes('from "../utils/tailwindToInline"') && 
      !content.includes('from \'../utils/tailwindToInline\'')) {
    
    // Find the first import statement
    const importMatch = content.match(/^import .* from .*;$/m);
    if (importMatch) {
      const insertPos = importMatch.index + importMatch[0].length;
      content = content.slice(0, insertPos) + 
                '\nimport { tw } from "../utils/tailwindToInline";' +
                content.slice(insertPos);
      changes++;
      console.log('  ✓ Added tw import');
    }
  }
  
  // Step 2: Convert simple className="..." to style={tw('...')}
  const simpleClassNameRegex = /className="([^"]+)"/g;
  let match;
  let simpleReplacements = 0;
  
  while ((match = simpleClassNameRegex.exec(originalContent)) !== null) {
    const classes = match[1];
    // Skip if it's not Tailwind classes (e.g., material-symbols-rounded)
    if (!classes.includes('material-symbols') && !classes.includes('ri-')) {
      content = content.replace(
        `className="${classes}"`,
        `style={tw('${classes}')}`
      );
      simpleReplacements++;
    }
  }
  
  if (simpleReplacements > 0) {
    changes += simpleReplacements;
    console.log(`  ✓ Converted ${simpleReplacements} simple className attributes`);
  }
  
  // Step 3: Convert className={`...`} to style={tw(`...`)}
  const templateClassNameRegex = /className=\{`([^`]+)`\}/g;
  let templateReplacements = 0;
  
  while ((match = templateClassNameRegex.exec(originalContent)) !== null) {
    const classes = match[1];
    if (!classes.includes('material-symbols') && !classes.includes('ri-')) {
      content = content.replace(
        `className={\`${classes}\`}`,
        `style={tw(\`${classes}\`)}`
      );
      templateReplacements++;
    }
  }
  
  if (templateReplacements > 0) {
    changes += templateReplacements;
    console.log(`  ✓ Converted ${templateReplacements} template literal className attributes`);
  }
  
  // Step 4: Update component props interface
  if (content.includes('className?: string')) {
    content = content.replace(
      'className?: string',
      'style?: CSSProperties'
    );
    
    // Add CSSProperties import if not present
    if (!content.includes('CSSProperties')) {
      content = content.replace(
        /import.*from ['"]react['"];/,
        (match) => match.replace('from "react"', ', type { CSSProperties } from "react"')
                       .replace("from 'react'", ", type { CSSProperties } from 'react'")
      );
    }
    
    changes++;
    console.log('  ✓ Updated component props (className → style)');
  }
  
  // Step 5: Replace ${className} usage with ${style}
  content = content.replace(/\$\{className\}/g, '');
  
  // Step 6: Remove tw- prefix if present
  content = content.replace(/tw-/g, '');
  
  // Write the file back
  if (changes > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`\n✅ Migration complete! Made ${changes} changes.`);
    console.log(`📝 Please review the file and test thoroughly.\n`);
    return true;
  } else {
    console.log('\n ℹ️  No changes needed or already migrated.\n');
    return false;
  }
}

function migrateDirectory(dirPath) {
  console.log(`\n📁 Scanning directory: ${dirPath}`);
  
  const files = fs.readdirSync(dirPath);
  let migratedCount = 0;
  let totalFiles = 0;
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      const result = migrateDirectory(filePath);
      migratedCount += result.migratedCount;
      totalFiles += result.totalFiles;
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      totalFiles++;
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check if file has className usage
      if (content.includes('className=')) {
        if (migrateComponent(filePath)) {
          migratedCount++;
        }
      }
    }
  }
  
  return { migratedCount, totalFiles };
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║  Tailwind className to Inline Styles Migration Script         ║
╚════════════════════════════════════════════════════════════════╝

Usage:
  node scripts/migrate-to-inline-styles.js <path>

Examples:
  # Migrate single file
  node scripts/migrate-to-inline-styles.js src/components/Button.tsx
  
  # Migrate entire directory
  node scripts/migrate-to-inline-styles.js src/components

Options:
  <path>    File or directory path to migrate

What this script does:
  ✓ Adds tw import from tailwindToInline utility
  ✓ Converts className="..." to style={tw('...')}
  ✓ Converts className={\`...\`} to style={tw(\`...\`)}
  ✓ Updates component props (className → style)
  ✓ Adds CSSProperties type import
  ✓ Removes tw- prefixes

Note: This script performs basic migrations. Complex cases may need
manual review, especially:
  - Dynamic classNames with complex logic
  - Hover/focus pseudo-classes (use hooks)
  - Responsive breakpoints (use hooks)
  - Third-party component classNames
`);
  process.exit(1);
}

const targetPath = args[0];

if (!fs.existsSync(targetPath)) {
  console.error(`\n❌ Error: Path not found: ${targetPath}\n`);
  process.exit(1);
}

const stat = fs.statSync(targetPath);

if (stat.isDirectory()) {
  const { migratedCount, totalFiles } = migrateDirectory(targetPath);
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 Summary:`);
  console.log(`   Total files scanned: ${totalFiles}`);
  console.log(`   Files migrated: ${migratedCount}`);
  console.log(`   Files unchanged: ${totalFiles - migratedCount}`);
  console.log(`${'='.repeat(60)}\n`);
} else if (stat.isFile()) {
  migrateComponent(targetPath);
} else {
  console.error(`\n❌ Error: Invalid path type\n`);
  process.exit(1);
}

console.log(`
📚 Next Steps:
   1. Review the migrated files
   2. Run: npm run dev (to test the app)
   3. Run: npm run build (to check for errors)
   4. Test all interactive elements (hover, focus, etc.)
   5. Update any custom logic as needed

📖 Documentation:
   - Full Guide: TAILWIND_TO_INLINE_STYLES.md
   - Quick Ref: TAILWIND_INLINE_QUICK_REF.md
   - Examples: src/components/StyleExamples.tsx
`);
