const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `      const formattedMessages = messages.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));`;
      
const replaceStr = `      let formattedMessages = messages.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));
      
      // Gemini API requires the first message in history to be from the user.
      while (formattedMessages.length > 0 && formattedMessages[0].role === "model") {
        formattedMessages.shift();
      }`;

if(code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync('server.ts', code);
  console.log("Updated server.ts successfully");
} else {
  console.log("target string not found");
}
