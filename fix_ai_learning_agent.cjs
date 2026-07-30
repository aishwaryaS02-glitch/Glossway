const fs = require('fs');

let code = fs.readFileSync('src/components/AILearningAgent.tsx', 'utf8');
code = code.replace(
  /if \(\!response\.ok\) \{\n\s*throw new Error\(`API returned \$\{response\.status\}`\);\n\s*\}/g,
  `if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (errorData && errorData.error) {
          throw new Error(errorData.error);
        }
        throw new Error(\`API returned \$\{response.status\}\`);
      }`
);
fs.writeFileSync('src/components/AILearningAgent.tsx', code);
console.log("Updated AILearningAgent.tsx");
