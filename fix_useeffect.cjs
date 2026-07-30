const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileView.tsx', 'utf8');

const regex = /  \/\/ Initialize or fetch peers\n  useEffect\(\(\) => \{[\s\S]*?localStorage\.setItem\("glossway_leaderboard_peers", JSON\.stringify\(initialPeers\)\);\n    setPeers\(initialPeers\);\n  \}, \[userProfile\?\.uid\]\);\n/g;
code = code.replace(regex, '');

const interfaceRegex = /interface PeerProfile \{[\s\S]*?\}\n/g;
code = code.replace(interfaceRegex, '');

fs.writeFileSync('src/components/ProfileView.tsx', code);
