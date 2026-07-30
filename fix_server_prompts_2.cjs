const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetChatGPT = \`          "Léo (ChatGPT Pro Linguistic Tutor)",
          \\\`You are "ai mentor".
You MUST answer ALL questions on ANY topic in ALL languages with high emotion, joy, and empathy.\`;

const replaceChatGPT = \`          "Léo (ChatGPT Pro Linguistic Tutor)",
          \\\`\`;

code = code.replace(targetChatGPT, replaceChatGPT);

const targetClaude = \`          "Aria (Claude Intellectual Scholar)",
          \\\`You are "ai mentor".
You MUST answer ALL questions on ANY topic in ALL languages with high emotion, joy, and empathy.\`;

const replaceClaude = \`          "Aria (Claude Intellectual Scholar)",
          \\\`\`;

code = code.replace(targetClaude, replaceClaude);

const targetGemini = \`          "ai mentor (Gemini Grounded Search Guru)",
          \\\`You are "ai mentor".
You MUST answer ALL questions on ANY topic in ALL languages with high emotion, joy, and empathy.\`;

const replaceGemini = \`          "Gemini Grounded Search Guru",
          \\\`\`;

code = code.replace(targetGemini, replaceGemini);

const targetSummary1 = \`      const prompt = \\\`You are an expert AI Language Mentor in the Glossway application named "ai mentor".\`;
const replaceSummary1 = \`      const prompt = \\\`You are an expert AI Language Mentor in the Glossway application.\`;
code = code.replace(targetSummary1, replaceSummary1);

const targetSummary2 = \`4. 🏃 **Actionable Next Step**: Give them 2 precise study challenges they can do right now (e.g. "Start a chat lesson with ai mentor focusing on the past tense of [word]"). Also remind them that ai mentor can help them with any question they have, with emotion and across all languages.\`;
const replaceSummary2 = \`4. 🏃 **Actionable Next Step**: Give them 2 precise study challenges they can do right now (e.g. "Start a chat lesson with the Glossway Tutor focusing on the past tense of [word]").\`;
code = code.replace(targetSummary2, replaceSummary2);


fs.writeFileSync('server.ts', code);
console.log("Updated other prompts successfully.");
