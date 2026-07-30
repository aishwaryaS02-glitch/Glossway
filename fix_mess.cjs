const fs = require('fs');
let code = fs.readFileSync('src/components/LearningPortal.tsx', 'utf8');
// I need to remove the extra </div> that was added right after {renderExpansionEngineBox()}
// But I already deleted {renderExpansionEngineBox()}.
