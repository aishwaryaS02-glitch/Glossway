const fs = require('fs');
let code = fs.readFileSync('src/components/AILearningAgent.tsx', 'utf8');

const oldBlock = `                  <div
                    className={\`max-w-[80%] p-3 text-sm leading-relaxed \${
                      msg.role === "user"
                        ? "bg-[#121212] text-white font-sans"
                        : "bg-[#FAF9F6] border border-[#12121208] text-[#121212] font-serif"
                    }\`}
                  >`;

const newBlock = `                  <div
                    className={\`p-4 leading-relaxed \${isFullScreen ? "text-base md:text-lg" : "text-sm"} \${
                      msg.role === "user"
                        ? "bg-[#121212] text-white font-sans max-w-[85%]"
                        : isFullScreen 
                          ? "bg-transparent text-[#121212] font-serif border-l-2 border-[#C5A880] pl-6 max-w-full"
                          : "bg-[#FAF9F6] border border-[#12121208] text-[#121212] font-serif max-w-[85%]"
                    }\`}
                  >`;

code = code.replace(oldBlock, newBlock);

fs.writeFileSync('src/components/AILearningAgent.tsx', code);
