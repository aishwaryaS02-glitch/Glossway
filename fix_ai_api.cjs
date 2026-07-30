const fs = require('fs');
let code = fs.readFileSync('src/components/AILearningAgent.tsx', 'utf8');

code = code.replace(
  /import \{ Bot, X, Send, Sparkles, User, Maximize2, Minimize2 \} from "lucide-react";/,
  'import { Bot, X, Send, Sparkles, User, Maximize2, Minimize2 } from "lucide-react";\nimport { apiFetch } from "../utils/api";'
);

const fetchRegex = /      const response = await fetch\("\/api\/chat-agent", \{[\s\S]*?      const data = await response\.json\(\);/m;
const newFetch = `      const response = await apiFetch("/api/chat-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages,
          targetLanguage: activeLanguage,
        }),
        actionName: "Chat Agent",
      });

      const data = await response.json();`;

code = code.replace(fetchRegex, newFetch);

fs.writeFileSync('src/components/AILearningAgent.tsx', code);
