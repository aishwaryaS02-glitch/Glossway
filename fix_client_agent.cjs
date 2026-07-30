const fs = require('fs');
let code = fs.readFileSync('src/components/AILearningAgent.tsx', 'utf8');

const targetStr = `        body: JSON.stringify({
          messages: newMessages,
          targetLanguage: activeLanguage,
        }),`;

const replaceStr = `        body: JSON.stringify({
          messages: newMessages,
          targetLanguage: activeLanguage,
          level: userProfile?.level || "Beginner",
          recentMistakes: "none",
        }),`;

if(code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync('src/components/AILearningAgent.tsx', code);
  console.log("Updated AILearningAgent.tsx successfully");
} else {
  console.log("target string not found in AILearningAgent.tsx");
}
