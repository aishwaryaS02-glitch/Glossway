const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileView.tsx', 'utf8');

const regex = /  \/\/ Combine user with peers for sorting[\s\S]*?\]\.sort\(\(a, b\) => b\.wordsLearned - a\.wordsLearned\);/g;
code = code.replace(regex, '');

fs.writeFileSync('src/components/ProfileView.tsx', code);
