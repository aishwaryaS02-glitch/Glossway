const fs = require('fs');
let code = fs.readFileSync('src/components/AILearningAgent.tsx', 'utf8');

const inputRegex = /className="flex-1 bg-\[#FAF9F6\] border border-\[#12121215\] px-3 py-2\.5 text-xs font-mono outline-none focus:border-\[#C5A880\] transition-colors placeholder:text-\[#12121240\]"/;
const newInput = `className={\`flex-1 border border-[#12121215] px-4 py-3 \${isFullScreen ? "bg-white text-sm" : "bg-[#FAF9F6] text-xs"} font-mono outline-none focus:border-[#C5A880] transition-colors placeholder:text-[#12121240]\`}`;

code = code.replace(inputRegex, newInput);
fs.writeFileSync('src/components/AILearningAgent.tsx', code);
