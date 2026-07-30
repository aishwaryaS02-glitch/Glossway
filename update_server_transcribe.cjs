const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `              {
                text: "Listen to this pronunciation audio clip. Transcribe what was said exactly. Then, provide highly helpful, friendly language learning feedback. Tell me whether the pronunciation sounds natural, accurate, or if there is room for accent improvement."
              }`;
              
const replacement = `              {
                text: req.body.promptContext || "Listen to this pronunciation audio clip. Transcribe what was said exactly. Then, provide highly helpful, friendly language learning feedback. Tell me whether the pronunciation sounds natural, accurate, or if there is room for accent improvement."
              }`;

if(code.includes(target)) {
  code = code.replace(target, replacement);
  // Also need to replace the fallback one if it exists
  code = code.replace(target, replacement);
  fs.writeFileSync('server.ts', code);
  console.log("Updated server.ts successfully");
} else {
  console.log("target string not found in server.ts");
}
