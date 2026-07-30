const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = `import { AILearningAgent } from "./components/AILearningAgent";\n` + code;

code = code.replace(
  /      \{\/\* 7\. Level Up Celebration Modal \*\/\}/,
  `      {/* 8. AI Learning Agent Widget */}\n      <AILearningAgent />\n\n      {/* 7. Level Up Celebration Modal */}`
);

fs.writeFileSync('src/App.tsx', code);
