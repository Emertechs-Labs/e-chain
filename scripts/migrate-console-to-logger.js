#!/usr/bin/env node

/**
 * Console Statement Migration Script
 * 
 * Helps migrate console.log/error/warn/debug statements to the centralized logger
 * 
 * Usage:
 *   node scripts/migrate-console-to-logger.js --scan          # Scan and report
 *   node scripts/migrate-console-to-logger.js --file <path>   # Migrate specific file
 *   node scripts/migrate-console-to-logger.js --auto          # Auto-migrate (with backup)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
const SCAN_DIRS = ['app', 'components', 'hooks', 'lib'];
const EXTENSIONS = ['.ts', '.tsx'];
const BACKUP_DIR = path.join(__dirname, '..', '.console-migration-backup');

// Console statement patterns
const CONSOLE_PATTERNS = [
  {
    pattern: /console\.log\((.*?)\);?/g,
    replacement: (match, args) => `logger.debug(${args});`,
    type: 'log'
  },
  {
    pattern: /console\.error\((.*?)\);?/g,
    replacement: (match, args) => `logger.error(${args});`,
    type: 'error'
  },
  {
    pattern: /console\.warn\((.*?)\);?/g,
    replacement: (match, args) => `logger.warn(${args});`,
    type: 'warn'
  },
  {
    pattern: /console\.debug\((.*?)\);?/g,
    replacement: (match, args) => `logger.debug(${args});`,
    type: 'debug'
  },
  {
    pattern: /console\.info\((.*?)\);?/g,
    replacement: (match, args) => `logger.info(${args});`,
    type: 'info'
  }
];

// Statistics
const stats = {
  filesScanned: 0,
  filesWithConsole: 0,
  totalConsoleStatements: 0,
  byType: { log: 0, error: 0, warn: 0, debug: 0, info: 0 },
  fileDetails: []
};

/**
 * Recursively find all TypeScript files
 */
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .next, etc.
      if (!file.startsWith('.') && file !== 'node_modules') {
        findFiles(filePath, fileList);
      }
    } else if (EXTENSIONS.includes(path.extname(file))) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Scan a file for console statements
 */
function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(FRONTEND_DIR, filePath);
  
  stats.filesScanned++;
  
  const consoleStatements = [];
  let totalInFile = 0;
  
  CONSOLE_PATTERNS.forEach(({ pattern, type }) => {
    const matches = [...content.matchAll(pattern)];
    if (matches.length > 0) {
      consoleStatements.push({ type, count: matches.length });
      totalInFile += matches.length;
      stats.byType[type] += matches.length;
    }
  });
  
  if (totalInFile > 0) {
    stats.filesWithConsole++;
    stats.totalConsoleStatements += totalInFile;
    stats.fileDetails.push({
      path: relativePath,
      count: totalInFile,
      statements: consoleStatements
    });
  }
  
  return { totalInFile, consoleStatements };
}

/**
 * Migrate console statements in a file
 */
function migrateFile(filePath, dryRun = false) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let modified = false;
  
  // Check if logger is already imported
  const hasLoggerImport = /import.*logger.*from.*['"]@\/lib\/logger['"]/.test(content);
  
  // Replace console statements
  CONSOLE_PATTERNS.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });
  
  // Add logger import if needed
  if (modified && !hasLoggerImport) {
    // Find the last import statement
    const importRegex = /^import .* from ['"].*['"];?$/gm;
    const imports = [...content.matchAll(importRegex)];
    
    if (imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const insertPosition = lastImport.index + lastImport[0].length;
      content = 
        content.slice(0, insertPosition) +
        "\nimport { logger } from '@/lib/logger';" +
        content.slice(insertPosition);
    } else {
      // No imports found, add at the beginning
      content = "import { logger } from '@/lib/logger';\n\n" + content;
    }
  }
  
  if (!dryRun && modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  
  return {
    modified,
    originalContent,
    newContent: content
  };
}

/**
 * Create backup of files before migration
 */
function createBackup(files) {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupSubDir = path.join(BACKUP_DIR, timestamp);
  fs.mkdirSync(backupSubDir, { recursive: true });
  
  files.forEach(file => {
    const relativePath = path.relative(FRONTEND_DIR, file);
    const backupPath = path.join(backupSubDir, relativePath);
    const backupDir = path.dirname(backupPath);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    fs.copyFileSync(file, backupPath);
  });
  
  console.log(`✅ Backup created: ${backupSubDir}`);
  return backupSubDir;
}

/**
 * Scan command - report console statements
 */
function scanCommand() {
  console.log('🔍 Scanning for console statements...\n');
  
  const allFiles = [];
  SCAN_DIRS.forEach(dir => {
    const dirPath = path.join(FRONTEND_DIR, dir);
    if (fs.existsSync(dirPath)) {
      findFiles(dirPath, allFiles);
    }
  });
  
  allFiles.forEach(file => scanFile(file));
  
  // Sort by count descending
  stats.fileDetails.sort((a, b) => b.count - a.count);
  
  // Print report
  console.log('📊 Console Statement Report\n');
  console.log(`Total files scanned: ${stats.filesScanned}`);
  console.log(`Files with console statements: ${stats.filesWithConsole}`);
  console.log(`Total console statements: ${stats.totalConsoleStatements}\n`);
  
  console.log('By type:');
  Object.entries(stats.byType).forEach(([type, count]) => {
    if (count > 0) {
      console.log(`  console.${type}: ${count}`);
    }
  });
  
  console.log('\n📁 Top 20 files with most console statements:\n');
  stats.fileDetails.slice(0, 20).forEach(({ path, count, statements }) => {
    console.log(`  ${path} (${count} statements)`);
    statements.forEach(({ type, count }) => {
      console.log(`    - console.${type}: ${count}`);
    });
  });
  
  if (stats.filesWithConsole > 0) {
    console.log('\n💡 To migrate, run:');
    console.log('  node scripts/migrate-console-to-logger.js --auto');
  }
}

/**
 * Migrate specific file
 */
function migrateFileCommand(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }
  
  console.log(`🔄 Migrating: ${filePath}\n`);
  
  const { modified, originalContent, newContent } = migrateFile(filePath, false);
  
  if (modified) {
    console.log('✅ File migrated successfully!');
    console.log('\nChanges:');
    console.log('--------');
    // Show diff (simplified)
    const originalLines = originalContent.split('\n').length;
    const newLines = newContent.split('\n').length;
    console.log(`Lines: ${originalLines} → ${newLines}`);
  } else {
    console.log('ℹ️  No console statements found in this file.');
  }
}

/**
 * Auto-migrate all files
 */
function autoMigrateCommand() {
  console.log('🚀 Auto-migrating console statements...\n');
  
  const allFiles = [];
  SCAN_DIRS.forEach(dir => {
    const dirPath = path.join(FRONTEND_DIR, dir);
    if (fs.existsSync(dirPath)) {
      findFiles(dirPath, allFiles);
    }
  });
  
  // Scan first
  const filesToMigrate = [];
  allFiles.forEach(file => {
    const { totalInFile } = scanFile(file);
    if (totalInFile > 0) {
      filesToMigrate.push(file);
    }
  });
  
  if (filesToMigrate.length === 0) {
    console.log('✅ No console statements found!');
    return;
  }
  
  console.log(`Found ${filesToMigrate.length} files to migrate\n`);
  
  // Create backup
  const backupPath = createBackup(filesToMigrate);
  
  // Migrate files
  let migratedCount = 0;
  filesToMigrate.forEach(file => {
    const { modified } = migrateFile(file, false);
    if (modified) {
      migratedCount++;
    }
  });
  
  console.log(`\n✅ Migration complete!`);
  console.log(`   Migrated: ${migratedCount} files`);
  console.log(`   Backup: ${backupPath}`);
  console.log('\n💡 Next steps:');
  console.log('   1. Review the changes');
  console.log('   2. Run: npm run lint');
  console.log('   3. Run: npm run type-check');
  console.log('   4. Test your application');
}

/**
 * Main CLI
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    console.log(`
Console Statement Migration Tool

Usage:
  node scripts/migrate-console-to-logger.js --scan          # Scan and report
  node scripts/migrate-console-to-logger.js --file <path>   # Migrate specific file
  node scripts/migrate-console-to-logger.js --auto          # Auto-migrate all files

Options:
  --scan      Scan for console statements and generate report
  --file      Migrate a specific file
  --auto      Automatically migrate all files (creates backup)
  --help      Show this help message
    `);
    return;
  }
  
  if (args.includes('--scan')) {
    scanCommand();
  } else if (args.includes('--file')) {
    const fileIndex = args.indexOf('--file');
    const filePath = args[fileIndex + 1];
    if (!filePath) {
      console.error('❌ Please provide a file path');
      process.exit(1);
    }
    migrateFileCommand(filePath);
  } else if (args.includes('--auto')) {
    autoMigrateCommand();
  } else {
    console.error('❌ Invalid command. Use --help for usage information.');
    process.exit(1);
  }
}

main();
