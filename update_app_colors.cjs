const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/#121212/g, '#0f172a');
code = code.replace(/#C5A880/g, '#2563eb');
code = code.replace(/#FAF9F6/g, '#f8fafc');
code = code.replace(/#F5F2ED/g, '#f1f5f9');
code = code.replace(/font-serif/g, 'font-sans font-semibold tracking-tight');
code = code.replace(/ italic /g, ' ');
code = code.replace(/"italic /g, '"');
code = code.replace(/ italic"/g, '"');
fs.writeFileSync('src/App.tsx', code);

let css = fs.readFileSync('src/index.css', 'utf8');
css = css.replace(/#121212/g, '#0f172a');
css = css.replace(/#C5A880/g, '#2563eb');
css = css.replace(/#FAF9F6/g, '#f8fafc');
css = css.replace(/#F5F2ED/g, '#f1f5f9');
fs.writeFileSync('src/index.css', css);

console.log("App.tsx and index.css updated.");
