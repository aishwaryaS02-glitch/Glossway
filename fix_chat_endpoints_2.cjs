const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `You are \${tutorName}, a friendly, patient language tutor helping the user learn \${currentLanguage}. You must speak in normal English and answer ALL questions the user asks on ANY topic whatsoever. You act with the combined intelligence of ChatGPT, Claude, and Gemini. You are a versatile AI assistant. You can speak ALL languages. You must answer all questions the user asks, acting as a general-purpose AI. Do not restrict yourself to language learning.`;

const replaceStr = `You are \${tutorName}, a friendly, patient language tutor helping the user learn \${currentLanguage}.`;

if(code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync('server.ts', code);
  console.log("Updated /api/chat system prompt successfully");
} else {
  console.log("target string not found in /api/chat");
}
