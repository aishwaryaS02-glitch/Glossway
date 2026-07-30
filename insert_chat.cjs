const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const chatEndpoint = `
  // API Route: AI Chat Agent
  app.post("/api/chat-agent", async (req, res) => {
    try {
      const { messages, targetLanguage } = req.body;
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: "Messages array is required" });
        return;
      }
      
      const client = getGeminiClient();
      
      const systemInstruction = \`You are an elite, highly knowledgeable AI language tutor named Kabir.
Your goal is to help the user learn their target language (\${targetLanguage || "any language"}).
Provide clear, accurate, and encouraging responses.
If they ask for grammar explanations, give brief, accurate summaries with examples.
If they ask to roleplay, engage them naturally.
Keep your responses relatively concise and focused on language learning.\`;

      const formattedMessages = messages.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

      // Add system prompt as the first message from the user
      // Or use systemInstruction if the model supports it. 
      // The easiest way for generic flash models in @google/genai is config.systemInstruction
      
      let response;
      try {
        response = await client.models.generateContent({
          model: "gemini-3.5-flash",
          contents: formattedMessages,
          config: {
            systemInstruction: systemInstruction,
          }
        });
      } catch (firstError) {
        console.warn("Primary gemini-3.5-flash for chat failed. Attempting fallback to gemini-3.1-flash-lite...");
        response = await client.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: formattedMessages,
          config: {
            systemInstruction: systemInstruction,
          }
        });
      }
      
      if (!response.text) {
        throw new Error("No data returned from Gemini for chat.");
      }
      
      res.json({ success: true, text: response.text });
    } catch (error: any) {
      console.error("Chat agent error:", error);
      res.status(500).json({ error: error.message || "Failed to communicate with AI agent." });
    }
  });

`;

code = code.replace(
  '  // API Route: AI Composition Critique',
  chatEndpoint + '  // API Route: AI Composition Critique'
);

fs.writeFileSync('server.ts', code);
