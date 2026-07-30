const fs = require('fs');
let code = fs.readFileSync('src/components/AILearningAgent.tsx', 'utf8');
code = code.replace(/import React, \{/g, 'import {');
fs.writeFileSync('src/components/AILearningAgent.tsx', code);
