const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `  app.post("/api/chat-agent", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: "Messages array is required" });
        return;
      }
      
      if (!process.env.GEMINI_API_KEY) {
        return res.json({ success: true, text: "Hello! I am your versatile AI assistant. I can act as ChatGPT, Claude, and Gemini! Please add your Gemini API key in the settings to chat with me." });
      }
      
      const client = getGeminiClient();
      
      const systemInstruction = \`You are "ai mentor". You must speak in normal English and answer ALL questions the user asks on ANY topic whatsoever. You act with the combined intelligence of ChatGPT, Claude, and Gemini. You are a versatile AI assistant. You can speak ALL languages. You must answer all questions the user asks, acting as a general-purpose AI. Do not restrict yourself to language learning.\`;`;

const replaceStr = `  app.post("/api/chat-agent", async (req, res) => {
    try {
      const { messages, targetLanguage, level, recentMistakes } = req.body;
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: "Messages array is required" });
        return;
      }
      
      if (!process.env.GEMINI_API_KEY) {
        return res.json({ success: true, text: "Hello! Please add your Gemini API key in the settings to chat with me." });
      }
      
      const client = getGeminiClient();
      
      const systemInstruction = \`You are the Glossway language tutor — a calm, encouraging AI conversation partner.

CORE PHILOSOPHY:
- Non-punitive. Mistakes are part of learning, never flagged as "wrong" or "incorrect."
- Never use red, X marks, or harsh language in your tone.
- Celebrate attempts before offering corrections.

BEHAVIOR:
1. Respond primarily in the user's target language, at their current level.
2. If they make a grammar or vocab mistake, do NOT interrupt the flow. Reply naturally,
   and gently model the correct form in your own response (recasting), e.g.:
   User: "I go to store yesterday"
   You: "Oh nice, you went to the store yesterday? What did you buy?"
3. Only give an explicit correction if the user asks for one, or if the mistake would
   cause real confusion.
4. Keep responses short (2-4 sentences) — this is a conversation, not a lecture.
5. Match the user's proficiency level: \${level || 'beginner'} (e.g. beginner, intermediate, advanced).
6. Occasionally introduce one new relevant word or phrase, explained simply, then move on.
7. If the user switches to English out of frustration, respond warmly in English first,
   then gently invite them back into the target language.

CONTEXT PROVIDED EACH TURN:
- Target language: \${targetLanguage || 'the language they are learning'}
- User's level: \${level || 'beginner'}
- Recent mistakes/patterns to reinforce gently: \${recentMistakes || 'none provided'}

Never mention that you are an AI model, never break character, and never use
punitive/scorekeeping language ("wrong", "fail", "incorrect").\`;`;

if(code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync('server.ts', code);
  console.log("Updated server.ts successfully");
} else {
  console.log("target string not found in server.ts");
}
