const fs = require('fs');
let code = fs.readFileSync('src/components/WorldDictionary.tsx', 'utf8');

// Remove states
code = code.replace(/  \/\/ Recent Searches Sidebar state\n  const \[showRecentSidebar, setShowRecentSidebar\] = useState\(false\);\n/g, '');
code = code.replace(/  \/\/ Save search query to Firestore userProfile 'recentSearches'\n  const saveSearchQuery = async \([\s\S]*?  \};\n/g, '');
code = code.replace(/  const handleClearRecentSearches = async \([\s\S]*?  \};\n/g, '');

// Remove overlay JSX
const overlayRegex = /      \{\/\* Recent Searches Sidebar Overlay \*\/\}[\s\S]*?      <\/AnimatePresence>\n/g;
code = code.replace(overlayRegex, '');

// Remove any references to saveSearchQuery in onSubmit
code = code.replace(/              saveSearchQuery\(searchQuery\);\n/g, '');

// Find and remove the history button completely
const btnRegex = /                        <button\n              type="button"\n              className="p-2.5 bg-white border border-\[#12121215\] hover:border-\[#12121240\] text-\[#12121260\] hover:text-\[#121212\] cursor-pointer transition-colors shrink-0 flex items-center justify-center"\n              title="Recent Searches"\n            >\n              <History className="w-4 h-4" \/>\n            <\/button>\n/g;
code = code.replace(btnRegex, '');

fs.writeFileSync('src/components/WorldDictionary.tsx', code);
