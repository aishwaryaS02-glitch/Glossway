const fs = require('fs');
let code = fs.readFileSync('src/components/PronunciationPractice.tsx', 'utf8');

const oldScoreLogic = `        // Extract score and award XP
        let score = 85; // Default score
        const match = data.text.match(/Fluency Score:\\s*(\\d+)/i);
        if (match && match[1]) {
          score = parseInt(match[1], 10);
        }

        // Award XP
        if (updateProfile) {
          updateProfile({
            xp: (userProfile?.xp || 0) + Math.round(score / 5) // e.g. 90 score = 18 XP
          });
        }`;

code = code.replace(/(\/\/ Extract score and award XP[\s\S]*?xp: \(userProfile\?\.xp \|\| 0\) \+ Math\.round\(score \/ 5\)[^\n]*\n\s*}\);?\n\s*})/m, 
`        // Award practice XP without a score
        if (updateProfile) {
          updateProfile({
            xp: (userProfile?.xp || 0) + 15
          });
        }`);

fs.writeFileSync('src/components/PronunciationPractice.tsx', code);
console.log("Fixed XP score parsing");
