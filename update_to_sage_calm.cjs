const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /#0f172a/gi, replacement: '#0f241d' }, // Deep Sage
  { regex: /#2563eb/gi, replacement: '#2d7a64' }, // Calm Sage Accent
  { regex: /#f8fafc/gi, replacement: '#f3f7f5' }, // Light Sage Surface
  { regex: /#f1f5f9/gi, replacement: '#e8f0eb' }, // Slate 100 -> Sage 100
  { regex: /#2d2d2d/gi, replacement: '#25332e' }, // Off-black -> Dark Sage

  // Dark mode surfaces (mostly in index.css)
  { regex: /#1C1C1E/gi, replacement: '#19211e' },
  { regex: /#18181A/gi, replacement: '#151c1a' },
  { regex: /#161617/gi, replacement: '#131a18' },
  { regex: /#1E1E20/gi, replacement: '#1a2420' },
  { regex: /#201F1D/gi, replacement: '#1b2420' },
  { regex: /#E8E4DD/gi, replacement: '#e2e8e5' }, // Hover cream

  // Replace Tailwind blue classes with emerald/teal classes
  { regex: /blue-50(?!0)/g, replacement: 'emerald-50' },
  { regex: /blue-100/g, replacement: 'emerald-100' },
  { regex: /blue-500/g, replacement: 'emerald-500' },
  { regex: /blue-600/g, replacement: 'emerald-600' },
  { regex: /blue-700/g, replacement: 'emerald-700' },
];

function replaceColorsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  for (const { regex, replacement } of replacements) {
    content = content.replace(regex, replacement);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walk(filePath);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) {
      replaceColorsInFile(filePath);
    }
  }
}

walk('src');
console.log('Sage calm theme applied!');
