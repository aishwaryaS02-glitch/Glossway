const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// I accidentally changed all 'gemini-3.6-flash' to 'gemini-3.1-flash-tts-preview'.
// Let's change them all BACK to gemini-3.6-flash, and then only change the one in /api/speak
code = code.replace(/gemini-3.1-flash-tts-preview/g, 'gemini-3.6-flash');

const targetStr = `app.post("/api/speak", async (req, res) => {
    try {
      const { text, language } = req.body;
      if (!text) {
        res.status(400).json({ error: "Text is required" });
        return;
      }

      const client = getGeminiClient();
      const response = await client.models.generateContent({
        model: "gemini-3.6-flash",`;

const replacement = `app.post("/api/speak", async (req, res) => {
    try {
      const { text, language } = req.body;
      if (!text) {
        res.status(400).json({ error: "Text is required" });
        return;
      }

      const client = getGeminiClient();
      const response = await client.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",`;

code = code.replace(targetStr, replacement);
fs.writeFileSync('server.ts', code);
console.log("Fixed TTS model");
