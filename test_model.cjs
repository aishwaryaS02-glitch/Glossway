const { GoogleGenAI } = require("@google/genai");
const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const res = await client.models.generateContent({ model: 'gemini-3.5-flash', contents: 'Hi' });
    console.log("3.5 success:", res.text);
  } catch(e) {
    console.log("3.5 failed:", e.message);
  }
}
run();
