const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `      if (!process.env.GEMINI_API_KEY) {
        return res.json({ text: "Hello! I am your versatile AI assistant. I can act as ChatGPT, Claude, and Gemini! Please add your Gemini API key in the settings to chat with me." });
      }`;

const replaceStr = `      if (!process.env.GEMINI_API_KEY) {
        return res.json({ text: "Hello! Please add your Gemini API key in the settings to chat with me." });
      }`;

if(code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync('server.ts', code);
  console.log("Updated /api/chat missing API key message successfully");
} else {
  console.log("target string not found in /api/chat");
}
