const fs = require('fs');
const path = require('path');

const dir = 'src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

// Old colors to new professional colors
// #121212 -> #0f172a (slate-900)
// #C5A880 -> #2563eb (blue-600) or #3b82f6 (blue-500)
// #FAF9F6 -> #f8fafc (slate-50)
// #F5F2ED -> #f1f5f9 (slate-100)

files.forEach(file => {
  const filePath = path.join(dir, file);
  let code = fs.readFileSync(filePath, 'utf8');

  code = code.replace(/#121212/g, '#0f172a');
  code = code.replace(/#C5A880/g, '#2563eb');
  code = code.replace(/#FAF9F6/g, '#f8fafc');
  code = code.replace(/#F5F2ED/g, '#f1f5f9');
  
  // also replace font-serif with font-sans to make it more professional SaaS like
  code = code.replace(/font-serif/g, 'font-sans font-semibold tracking-tight');
  
  // remove italic which is too editorial
  code = code.replace(/ italic /g, ' ');
  code = code.replace(/"italic /g, '"');
  code = code.replace(/ italic"/g, '"');

  fs.writeFileSync(filePath, code);
});
console.log("Colors and fonts updated.");
