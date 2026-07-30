const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/<AILearningAgent \/>/, '<AILearningAgent userProfile={userProfile} />');
fs.writeFileSync('src/App.tsx', code);
