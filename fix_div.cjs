const fs = require('fs');
let code = fs.readFileSync('src/components/LearningPortal.tsx', 'utf8');
code = code.replace(/            <\/div>\n                      <\/p>/g, '                      </p>');
fs.writeFileSync('src/components/LearningPortal.tsx', code);
