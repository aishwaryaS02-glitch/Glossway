const { GoogleGenAI } = require("@google/genai");
const client = new GoogleGenAI({ apiKey: "DUMMY" });
async function run() {
  try {
    const res = await client.models.generateContent({ 
      model: 'gemini-2.5-flash', 
      contents: [
        { role: 'model', parts: [{text: 'Hi'}] },
        { role: 'user', parts: [{text: 'Hello'}] }
      ]
    });
    console.log("success:", res.text);
  } catch(e) {
    console.log("error:", e.message);
  }
}
run();
