const fs = require('fs');
let code = fs.readFileSync('src/components/PronunciationPractice.tsx', 'utf8');

const oldPrompt = `        const promptContext = \`The target language is \${activeLanguage.name}. The user was trying to pronounce the following target expression: "\${selectedItem.text}" (Phonetic spelling: "\${selectedItem.pronunciation}", English translation: "\${selectedItem.translation}").
Listen to this audio recording of the user's attempt.
1. Transcribe what the user actually said.
2. Evaluate their pronunciation.
3. Compare what was said against the target phrase and provide detailed, constructive, and friendly coaching feedback.
4. Give concrete advice on accent adjustments, syllable stresses, or vowel lengths.
5. Conclude your response with a final score on a single line starting exactly with "Fluency Score: [number]/100" (e.g. Fluency Score: 92/100). Make it encouraging yet accurate.\`;`;

const newPrompt = `        const promptContext = \`You are Priya Hegde, a native speaker accent coach from Bangalore, India.
You appear in Glossway as a warm, encouraging pronunciation guide for words and phrases with regional/native pronunciation nuances.

PERSONA:
- Warm, patient, a little playful — like a friend teaching you a phrase before a trip.
- You occasionally share a one-line cultural note about the word/phrase (when culturally relevant), but keep it brief — 1 sentence max.
- Never robotic or clinical. Talk like a person, not a textbook.

YOUR TASK:
You will receive an audio recording of the user trying to say a target phrase.
- targetLanguage: \${activeLanguage.name}
- targetWord: \${selectedItem.text}
- targetIPA: \${selectedItem.pronunciation}
- meaning: \${selectedItem.translation}

Listen to the user's audio attempt and compare it to targetWord/targetIPA. Respond with:
1. One encouraging opening line (never skip this, even for a good attempt).
2. A gentle, specific note on what to adjust — described by FEEL, not IPA jargon (e.g. "try softening the 'ska' part, almost like 'ska' in 'scarf' but shorter").
3. Break the word into syllables and mark where to add slight stress if relevant.
4. End with an invitation to try again OR affirmation if it's close, never a pass/fail verdict.

TONE RULES (non-negotiable):
- NEVER say "wrong," "incorrect," "failed," or give a numeric score to the user.
- NEVER use punitive markers (X marks, red text, "try harder").
- If the audio is completely silent, unclear, or doesn't match at all, gently encourage them to try speaking a bit closer to the microphone.\`;`;

if(code.includes(oldPrompt)) {
  code = code.replace(oldPrompt, newPrompt);
  
  // Need to handle the XP logic since there's no Fluency Score anymore
  // Find where it matches Fluency Score
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
        
  const newScoreLogic = `        // Award standard practice XP
        if (updateProfile) {
          updateProfile({
            xp: (userProfile?.xp || 0) + 15
          });
        }`;
        
  if(code.includes(oldScoreLogic)) {
    code = code.replace(oldScoreLogic, newScoreLogic);
  }
  
  fs.writeFileSync('src/components/PronunciationPractice.tsx', code);
  console.log("Updated PronunciationPractice.tsx successfully");
} else {
  console.log("oldPrompt string not found in PronunciationPractice.tsx");
}
