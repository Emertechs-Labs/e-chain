#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const docsDir = path.join(projectRoot, 'docs');
const generatedDir = path.join(docsDir, '.generated');
const excludedDirectories = new Set(['.git', '.next', 'node_modules', 'dist', 'build', 'coverage', 'artifacts', 'cache', '.generated']);

if (!fs.existsSync(docsDir)) {
  console.log('No docs directory found. Skipping documentation update.');
  process.exit(0);
}

const docsIndex = [];
const existingIndexPath = path.join(generatedDir, 'docs-index.json');
let previousIndex = [];

if (fs.existsSync(existingIndexPath)) {
  try {
    previousIndex = JSON.parse(fs.readFileSync(existingIndexPath, 'utf8'));
  } catch (error) {
    console.warn('Warning: Unable to read previous docs index – proceeding fresh.');
  }
}

const extractMetadata = (filePath, content) => {
  const cleanPath = path.relative(docsDir, filePath).replace(/\\/g, '/');
  const lines = content.split(/\r?\n/);
  const headings = [];
  let title = '';

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,6}\s+(.*)$/);
    if (headingMatch) {
      const text = headingMatch[1].trim();
      headings.push(text);
      if (!title) title = text;
    }
    if (headings.length >= 6) break;
  }

  if (!title) {
    const baseName = path.basename(filePath, path.extname(filePath));
    title = baseName.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  const stats = fs.statSync(filePath);

  return {
    path: cleanPath,
    title,
    headings,
    updatedAt: stats.mtime.toISOString(),
    size: stats.size
  };
};

const scanDirectory = (currentDir) => {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    if (excludedDirectories.has(entry.name)) continue;

    const fullPath = path.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      scanDirectory(fullPath);
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      docsIndex.push(extractMetadata(fullPath, content));
    }
  }
};

scanDirectory(docsDir);

docsIndex.sort((a, b) => a.path.localeCompare(b.path));

if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true });
}

const formatGroupTitle = (key) => {
  if (key === 'root') return 'General';
  return key
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

const groupedDocs = docsIndex.reduce((acc, doc) => {
  const groupKey = doc.path.includes('/') ? doc.path.split('/')[0] : 'root';
  if (!acc[groupKey]) acc[groupKey] = [];
  acc[groupKey].push(doc);
  return acc;
}, {});

const tocLines = [
  '# Documentation Index',
  '',
  `Generated automatically on ${new Date().toISOString()}.`,
  ''
];

Object.keys(groupedDocs)
  .sort((a, b) => formatGroupTitle(a).localeCompare(formatGroupTitle(b)))
  .forEach((groupKey) => {
    const entries = groupedDocs[groupKey];
    if (!entries.length) return;

    tocLines.push(`## ${formatGroupTitle(groupKey)}`);

    entries
      .slice()
      .sort((a, b) => a.title.localeCompare(b.title))
      .forEach((doc) => {
        const link = doc.path.replace(/\s/g, '%20');
        tocLines.push(`- [${doc.title}](${link})`);
      });

    tocLines.push('');
  });

const indexPath = existingIndexPath;
const tocPath = path.join(generatedDir, 'toc.md');

fs.writeFileSync(indexPath, JSON.stringify(docsIndex, null, 2));
fs.writeFileSync(tocPath, tocLines.join('\n'));

const previousDocsMap = new Map(previousIndex.map(doc => [doc.path, doc]));
const updatedDocs = [];
const newDocs = [];

for (const doc of docsIndex) {
  const previous = previousDocsMap.get(doc.path);
  if (!previous) {
    newDocs.push(doc);
    continue;
  }

  if (previous.updatedAt !== doc.updatedAt || previous.size !== doc.size) {
    updatedDocs.push(doc);
  }

  previousDocsMap.delete(doc.path);
}

const removedDocs = Array.from(previousDocsMap.values());

let repoChanges = [];
try {
  const statusOutput = execSync('git status --short --untracked-files=all', {
    cwd: projectRoot,
    stdio: ['ignore', 'pipe', 'ignore']
  }).toString();

    repoChanges = statusOutput
      .split(/\r?\n/)
      .filter(Boolean)
      .map(line => {
        const match = line.match(/^(.{2})\s+(.*)$/);
        if (!match) return null;
        const status = match[1].trim() || match[1];
        let filePath = match[2].trim();
        if (filePath.includes(' -> ')) {
          const parts = filePath.split(' -> ');
          filePath = parts[parts.length - 1];
        }
        if (!filePath) return null;
        if (filePath === 'docs/.generated/docs-index.json' || filePath === 'docs/.generated/toc.md' || filePath === 'docs/.generated/update-report.md') {
          return null;
        }
        return { status, path: filePath };
      })
      .filter(Boolean);
} catch (error) {
  console.warn('Warning: Unable to inspect git status for repository changes.');
}

const reportLines = [
  '# Documentation Update Report',
  '',
  `Generated automatically on ${new Date().toISOString()}.`,
  '',
  '## Repository Changes Since Last Doc Refresh',
  repoChanges.length
    ? repoChanges
          .map(change => `- \`${change.status}\` ${change.path}`)
        .join('\n')
    : '- No tracked file changes detected.',
  '',
  '## New Documentation Files',
  newDocs.length
    ? newDocs.map(doc => `- ${doc.title} (${doc.path})`).join('\n')
    : '- No new documentation files detected.',
  '',
  '## Updated Documentation Files',
  updatedDocs.length
    ? updatedDocs.map(doc => `- ${doc.title} (${doc.path})`).join('\n')
    : '- No documentation updates detected.',
  '',
  '## Removed Documentation Files',
  removedDocs.length
    ? removedDocs.map(doc => `- ${doc.title} (${doc.path})`).join('\n')
    : '- No documentation files removed.',
  ''
];

const reportPath = path.join(generatedDir, 'update-report.md');
fs.writeFileSync(reportPath, reportLines.join('\n'));

console.log(`Documentation index generated with ${docsIndex.length} entries.`);
console.log(`- ${indexPath}`);
console.log(`- ${tocPath}`);
console.log(`- ${reportPath}`);
