const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const summaryEndpoint = `
  // API Route: AI Quiz Session Summary
  app.post("/api/quiz-summary", async (req, res) => {
    try {
      const { score, totalQuestions, language, wrongAnswers } = req.body;
      const client = getGeminiClient();
      
      const prompt = \`The user just finished a \${language} quiz, scoring \${score} out of \${totalQuestions}. 
They answered these questions incorrectly (if any): \${JSON.stringify(wrongAnswers)}.
Provide a 3-sentence editorial summary of their progress today, including an analysis of their weak points based on the wrong answers. Write it in an elegant, professional, and encouraging tone. Return a raw JSON object with a 'summary' string field.\`;

      const critiqueSchema = {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING }
        },
        required: ["summary"]
      };

      let response;
      try {
        response = await client.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: critiqueSchema
          }
        });
      } catch (e) {
        response = await client.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: critiqueSchema
          }
        });
      }

      if (!response.text) {
         throw new Error("No text returned.");
      }
      const data = cleanAndParseJSON(response.text);
      res.json({ success: true, summary: data.summary });
    } catch (error: any) {
      console.error("Quiz summary error:", error);
      res.status(500).json({ error: "Failed to generate summary." });
    }
  });

`;

code = code.replace(
  '  // Vite middleware for development or serving compiled files in production',
  summaryEndpoint + '  // Vite middleware for development or serving compiled files in production'
);

fs.writeFileSync('server.ts', code);
