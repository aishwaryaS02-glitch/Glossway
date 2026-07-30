const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

// fix /api/chat-agent
const targetAgent = `  app.post("/api/chat-agent", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: "Messages array is required" });
        return;
      }
      
      const client = getGeminiClient();`;

const replacementAgent = `  app.post("/api/chat-agent", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: "Messages array is required" });
        return;
      }
      
      if (!process.env.GEMINI_API_KEY) {
        return res.json({ success: true, text: "Hello! I am your versatile AI assistant. I can act as ChatGPT, Claude, and Gemini! Please add your Gemini API key in the settings to chat with me." });
      }
      
      const client = getGeminiClient();`;

code = code.replace(targetAgent, replacementAgent);

// fix /api/chat
const targetChat = `  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, modelType, language, levelName, goal, weakAreas, isFlashcardGenerator } = req.body;
      if (!message) {
        res.status(400).json({ error: "Message is required" });
        return;
      }

      const client = getGeminiClient();`;

const replacementChat = `  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, modelType, language, levelName, goal, weakAreas, isFlashcardGenerator } = req.body;
      if (!message) {
        res.status(400).json({ error: "Message is required" });
        return;
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.json({ text: "Hello! I am your versatile AI assistant. I can act as ChatGPT, Claude, and Gemini! Please add your Gemini API key in the settings to chat with me." });
      }

      const client = getGeminiClient();`;

code = code.replace(targetChat, replacementChat);

fs.writeFileSync('server.ts', code);
console.log("Updated chat endpoints.");
