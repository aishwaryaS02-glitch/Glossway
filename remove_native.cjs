const fs = require('fs');

// src/components/PricingModal.tsx
let pricingModal = fs.readFileSync('src/components/PricingModal.tsx', 'utf8');
pricingModal = pricingModal.replace(/"Native speaker pronunciation audio guide"/g, '"Pronunciation audio guide"');
fs.writeFileSync('src/components/PricingModal.tsx', pricingModal);

// src/components/PronunciationPractice.tsx
let pronunc = fs.readFileSync('src/components/PronunciationPractice.tsx', 'utf8');
pronunc = pronunc.replace(/a native speaker accent coach/g, 'an accent coach');
pronunc = pronunc.replace(/native pronunciation nuances/g, 'regional pronunciation nuances');
fs.writeFileSync('src/components/PronunciationPractice.tsx', pronunc);

// src/components/LearningPortal.tsx
let portal = fs.readFileSync('src/components/LearningPortal.tsx', 'utf8');
portal = portal.replace(/fluent native speaker voice/g, 'fluent voice');
portal = portal.replace(/native people/g, 'people');
portal = portal.replace(/standard native speaker's/g, "standard fluent speaker's");
portal = portal.replace(/Native speaker speech audio/g, 'Speech audio');
portal = portal.replace(/Native Accent Coach/g, 'Accent Coach');
fs.writeFileSync('src/components/LearningPortal.tsx', portal);

// src/App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/native accent/g, 'accent');
fs.writeFileSync('src/App.tsx', app);

// server.ts
let server = fs.readFileSync('server.ts', 'utf8');
server = server.replace(/fluent native \$\{language/g, 'fluent ${language');
server = server.replace(/native speech pacing/g, 'fluent speech pacing');
server = server.replace(/elite native fluency/g, 'elite fluency');
server = server.replace(/Native Voice Synth/g, 'Voice Synth');
fs.writeFileSync('server.ts', server);

// src/utils/apiService.ts
let api = fs.readFileSync('src/utils/apiService.ts', 'utf8');
api = api.replace(/Native Voice Synth/g, 'Voice Synth');
api = api.replace(/Native voice speech/g, 'Voice speech');
fs.writeFileSync('src/utils/apiService.ts', api);

console.log("Replaced native references");
