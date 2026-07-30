const fs = require('fs');
let code = fs.readFileSync('src/components/LearningPortal.tsx', 'utf8');
code = code.replace(/              \);\n            \}\)/g, '            })');
fs.writeFileSync('src/components/LearningPortal.tsx', code);
