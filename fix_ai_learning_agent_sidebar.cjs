const fs = require('fs');

let code = fs.readFileSync('src/components/AILearningAgent.tsx', 'utf8');

code = code.replace(
  /import \{ Bot, X, Send, Sparkles, User, Maximize2, Minimize2 \} from "lucide-react";/,
  \`import { Bot, X, Send, Sparkles, User, Maximize2, Minimize2, History, MessageSquare } from "lucide-react";\`
);

fs.writeFileSync('src/components/AILearningAgent.tsx', code);
