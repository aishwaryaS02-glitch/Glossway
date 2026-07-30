const fs = require('fs');

function replaceFile(path, regexes) {
  if (!fs.existsSync(path)) return;
  let code = fs.readFileSync(path, 'utf8');
  for (const [r, rep] of regexes) {
    code = code.replace(r, rep);
  }
  fs.writeFileSync(path, code);
}

replaceFile('src/components/Dashboard.tsx', [
  [/native pronunciation/g, 'fluent pronunciation'],
  [/native podcasts/g, 'podcasts'],
  [/near-native fluency/g, 'high fluency'],
  [/Native Conversational Targets/g, 'Fluent Conversational Targets'],
  [/native slangs/g, 'local slang'],
  [/slow native speech/g, 'slow fluent speech'],
  [/native audio transcripts/g, 'audio transcripts']
]);

replaceFile('src/components/LearningPortal.tsx', [
  [/NATIVE_TUTORS/g, 'TUTORS'],
  [/native fidelity/g, 'high fidelity'],
  [/native voice/gi, 'voice'],
  [/setIsPlayingNativeVoice/g, 'setIsPlayingVoice'],
  [/native tutor models/g, 'tutor models'],
  [/native and clear/g, 'fluent and clear'],
  [/native fluency/g, 'high fluency'],
  [/Listen Native Voice/g, 'Listen Voice'],
  [/native context formulas/g, 'cultural context formulas'],
  [/Native Voice Synth/g, 'Voice Synth'],
  [/native engine error/g, 'voice engine error']
]);

replaceFile('src/components/PronunciationPractice.tsx', [
  [/Sublime Native Cadence!/g, 'Sublime Cadence!'],
  [/NATIVE TUTOR PROFILE/g, 'TUTOR PROFILE']
]);

replaceFile('src/components/QuizView.tsx', [
  [/native scholar/g, 'scholar']
]);

replaceFile('src/components/WorldDictionary.tsx', [
  [/native sentence/g, 'sentence']
]);

replaceFile('server.ts', [
  [/more native, expressive/g, 'more natural, expressive'],
  [/native-sounding/g, 'natural-sounding'],
  [/native word"/g, 'natural word"']
]);

console.log("Cleaned up remaining native references");
