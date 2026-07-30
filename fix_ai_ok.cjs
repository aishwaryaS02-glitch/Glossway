const fs = require('fs');
let code = fs.readFileSync('src/components/AILearningAgent.tsx', 'utf8');

const regex = /      const data = await response\.json\(\);\n      if \(data\.success && data\.text\) \{/m;
const replacement = `      if (!response.ok) {
        throw new Error(\`API returned \${response.status}\`);
      }
      const data = await response.json();
      if (data.success && data.text) {`;
code = code.replace(regex, replacement);

fs.writeFileSync('src/components/AILearningAgent.tsx', code);
