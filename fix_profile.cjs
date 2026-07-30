const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileView.tsx', 'utf8');

// Remove lastPeerActivity state
code = code.replace(/  const \[lastPeerActivity, setLastPeerActivity\] = useState<string \| null>\(null\);\n/g, '');

// Remove peers and initialPeers block
// It spans from 360 to around 490
// Let's just remove specific functions

code = code.replace(/  const handleSimulatePeerActivity = \(\) => {[\s\S]*?  };\n/g, '');
code = code.replace(/  const handleRecalibratePeers = \(\) => {[\s\S]*?  };\n/g, '');
code = code.replace(/  const userLeaderboardIndex = combinedList\.findIndex\(item => item\.isUser\);\n/g, '');

fs.writeFileSync('src/components/ProfileView.tsx', code);
