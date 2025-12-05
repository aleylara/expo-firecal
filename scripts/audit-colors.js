#!/usr/bin/env node

/**
 * Color Usage Audit Script
 *
 * This script helps identify which colors from your theme are actually being used
 * and which ones can be safely removed.
 */

const fs = require('fs');
const path = require('path');

// Colors defined in your theme
const THEME_COLORS = [
  // Current colors
  'text',
  'background',
  'tint',
  'icon',
  'tabIconDefault',
  'tabIconSelected',
  'cardBackground',
  'border',
  'buttonPrimary',
  'buttonSecondary',
  'buttonText',
  'selectedBackground',
  'sectionBackground',
  'mutedText',
  'subtleText',
  'alternateRow',

  // New systematic colors
  'surface',
  'surfaceElevated',
  'textSecondary',
  'textMuted',
  'primary',
  'primaryHover',
  'secondary',
  'secondaryHover',
  'borderStrong',
  'success',
  'warning',
  'error',
];

function findFilesRecursively(dir, extensions = ['.tsx', '.ts']) {
  let results = [];

  try {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (
        stat.isDirectory() &&
        !file.startsWith('.') &&
        file !== 'node_modules'
      ) {
        results = results.concat(findFilesRecursively(filePath, extensions));
      } else if (extensions.some((ext) => file.endsWith(ext))) {
        results.push(filePath);
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dir}`);
  }

  return results;
}

function auditColorUsage() {
  console.log('🎨 Color Usage Audit\n');

  const projectRoot = process.cwd();
  const files = findFilesRecursively(projectRoot);

  const colorUsage = {};
  const unusedColors = [...THEME_COLORS];

  // Initialize usage tracking
  THEME_COLORS.forEach((color) => {
    colorUsage[color] = [];
  });

  // Scan files for color usage
  files.forEach((filePath) => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      THEME_COLORS.forEach((color) => {
        // Look for useThemeColor calls with this color
        const themeColorRegex = new RegExp(
          `useThemeColor\\([^)]*,\\s*['"\`]${color}['"\`]\\)`,
          'g',
        );
        // Look for colors.colorName usage
        const colorsRegex = new RegExp(`colors\\.${color}\\b`, 'g');

        const themeMatches = content.match(themeColorRegex) || [];
        const colorMatches = content.match(colorsRegex) || [];

        if (themeMatches.length > 0 || colorMatches.length > 0) {
          colorUsage[color].push({
            file: path.relative(projectRoot, filePath),
            themeColorCalls: themeMatches.length,
            colorsCalls: colorMatches.length,
          });

          // Remove from unused list
          const index = unusedColors.indexOf(color);
          if (index > -1) {
            unusedColors.splice(index, 1);
          }
        }
      });
    } catch (error) {
      console.warn(`Warning: Could not read file ${filePath}`);
    }
  });

  // Report results
  console.log('📊 USAGE SUMMARY\n');

  const usedColors = THEME_COLORS.filter(
    (color) => colorUsage[color].length > 0,
  );

  console.log(`✅ Used Colors (${usedColors.length}/${THEME_COLORS.length}):`);
  usedColors.forEach((color) => {
    const usage = colorUsage[color];
    const totalUsage = usage.reduce(
      (sum, u) => sum + u.themeColorCalls + u.colorsCalls,
      0,
    );
    console.log(`   ${color} (${totalUsage} uses in ${usage.length} files)`);
  });

  console.log(`\n❌ Unused Colors (${unusedColors.length}):`);
  if (unusedColors.length > 0) {
    unusedColors.forEach((color) => {
      console.log(`   ${color} - Safe to remove`);
    });
  } else {
    console.log('   None! All colors are being used.');
  }

  console.log('\n📁 DETAILED USAGE:\n');
  usedColors.forEach((color) => {
    console.log(`${color}:`);
    colorUsage[color].forEach((usage) => {
      const details = [];
      if (usage.themeColorCalls > 0)
        details.push(`${usage.themeColorCalls} useThemeColor`);
      if (usage.colorsCalls > 0)
        details.push(`${usage.colorsCalls} colors.${color}`);
      console.log(`  ${usage.file} (${details.join(', ')})`);
    });
    console.log('');
  });

  // Migration suggestions
  console.log('🔄 MIGRATION SUGGESTIONS:\n');

  const legacyColors = [
    'tint',
    'icon',
    'tabIconDefault',
    'tabIconSelected',
    'cardBackground',
    'sectionBackground',
  ];
  const legacyInUse = legacyColors.filter(
    (color) => colorUsage[color].length > 0,
  );

  if (legacyInUse.length > 0) {
    console.log('Legacy colors still in use (consider migrating):');
    legacyInUse.forEach((color) => {
      const newColor = getLegacyMapping(color);
      console.log(`  ${color} → ${newColor}`);
    });
  }
}

function getLegacyMapping(legacyColor) {
  const mapping = {
    tint: 'colors.primary',
    icon: 'colors.textSecondary',
    tabIconDefault: 'colors.textSecondary',
    tabIconSelected: 'colors.primary',
    cardBackground: 'colors.surface',
    sectionBackground: 'colors.surfaceElevated',
    mutedText: 'colors.textMuted',
    subtleText: 'colors.textSecondary',
  };

  return mapping[legacyColor] || 'colors.text';
}

// Run the audit
auditColorUsage();
