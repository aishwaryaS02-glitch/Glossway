const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `      res.json({ success: true, text: response.text });
    } catch (error: any) {
      console.error("Chat agent error:", error);
      res.status(500).json({ error: error.message || "Failed to communicate with AI agent." });
    }
  });`;

const replaceStr = `      res.json({ success: true, text: response.text });
    } catch (error: any) {
      console.error("Chat agent error:", error);
      const errMsg = error.message || "";
      if (errMsg.includes("429") || errMsg.includes("exceeded your current quota")) {
        return res.json({ success: true, text: "I'm sorry, you have exceeded your Gemini API quota. Please check your billing details or wait a moment before trying again." });
      } else if (errMsg.includes("503") || errMsg.includes("high demand")) {
        return res.json({ success: true, text: "The AI service is currently experiencing high demand. Please try again in a few moments." });
      }
      res.status(500).json({ error: error.message || "Failed to communicate with AI agent." });
    }
  });`;

if(code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync('server.ts', code);
  console.log("Updated chat-agent error handling successfully");
} else {
  console.log("target string not found in server.ts");
}
