const fs = require('fs');
let code = fs.readFileSync('src/components/WorldDictionary.tsx', 'utf8');
code = code.replace(
  /className="p-2.5 bg-white border border-\[#12121215\] hover:border-\[#12121240\] text-\[#12121260\] hover:text-\[#121212\] cursor-pointer transition-colors shrink-0 flex items-center justify-center"\s+title="Recent Searches"/,
  'className="p-2.5 bg-white border border-[#12121215] hover:border-[#12121240] text-[#12121260] hover:text-[#121212] cursor-pointer transition-colors shrink-0 flex items-center justify-center"\n              onClick={() => setShowRecentSidebar(true)}\n              title="Recent Searches"'
);
fs.writeFileSync('src/components/WorldDictionary.tsx', code);
