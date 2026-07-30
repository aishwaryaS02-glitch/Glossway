const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// I changed `<div className="grid grid-cols-2 gap-2">` to grid-cols-1, but I deleted the Recent Searches section.
// The issue is probably a missing closing div tag because I deleted lines.
// Let's replace the whole grid section.

const regex = /<div className="grid grid-cols-1 gap-2">[\s\S]*?Words: \{userProfile\?\.wordsLearned \|\| 0\}\n                          <\/span>\n                        <\/div>\n                      <\/div>\n                    <\/div>/;

const replacement = `<div className="grid grid-cols-1 gap-2">
                      <div className="bg-white p-2.5 border border-[#12121208] flex flex-col justify-between">
                        <div>
                          <span className="text-[8px] font-mono text-[#12121240] uppercase block">
                            Study Statistics
                          </span>
                          <span className="text-[10px] font-mono font-bold block mt-1">
                            Streak: {userProfile?.streak || 0}d
                          </span>
                          <span className="text-[10px] font-mono block text-[#12121260]">
                            Words: {userProfile?.wordsLearned || 0}
                          </span>
                        </div>
                      </div>
                    </div>`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/Dashboard.tsx', code);
