const fs = require('fs');
let code = fs.readFileSync('src/components/AILearningAgent.tsx', 'utf8');

const regex = /className=\{\`flex \$\{msg\.role === "user" \? "justify-end" : "justify-start"\} gap-2\`\}/g;
const replacement = 'className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-3 ${isFullScreen && msg.role === "assistant" ? "pr-8 md:pr-24" : ""} ${isFullScreen && msg.role === "user" ? "pl-8 md:pl-24" : ""}`}';
code = code.replace(regex, replacement);

fs.writeFileSync('src/components/AILearningAgent.tsx', code);
