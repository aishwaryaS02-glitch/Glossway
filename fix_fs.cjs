const fs = require('fs');
let code = fs.readFileSync('src/components/AILearningAgent.tsx', 'utf8');

// Add Maximize2, Minimize2 to imports
code = code.replace(/import \{ Bot, X, Send, Sparkles, User \} from "lucide-react";/, 'import { Bot, X, Send, Sparkles, User, Maximize2, Minimize2 } from "lucide-react";');

// Add isFullScreen state
const stateRegex = /  const \[isOpen, setIsOpen\] = useState\(false\);/;
code = code.replace(stateRegex, '  const [isOpen, setIsOpen] = useState(false);\n  const [isFullScreen, setIsFullScreen] = useState(false);');

// Update motion.div className
const motionDivRegex = /className="fixed bottom-6 right-6 w-full max-w-\[380px\] h-\[550px\] max-h-\[80vh\] bg-white border border-\[#12121215\] shadow-2xl z-50 flex flex-col overflow-hidden"/;
const newMotionDivClass = 'className={isFullScreen ? "fixed inset-0 w-full h-full bg-[#FAF9F6] z-[60] flex flex-col overflow-hidden transition-all duration-500 ease-in-out" : "fixed bottom-6 right-6 w-full max-w-[380px] h-[550px] max-h-[80vh] bg-white border border-[#12121215] shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-300"}';
code = code.replace(motionDivRegex, newMotionDivClass);

// Update Header
const headerRegex = /              <button\n                onClick=\{.*?\}\n                className="p\.1\.5 hover:bg-\[#12121208\] text-\[#12121250\] hover:text-\[#121212\] transition-colors"\n              >\n                <X className="w-4 h-4" \/>\n              <\/button>/s;
const newHeaderBtns = `              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="p-2 hover:bg-[#12121208] text-[#12121250] hover:text-[#121212] transition-colors cursor-pointer"
                  title={isFullScreen ? "Exit conversation mode" : "Enter conversation mode"}
                >
                  {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => { setIsOpen(false); setIsFullScreen(false); }}
                  className="p-2 hover:bg-[#12121208] text-[#12121250] hover:text-[#121212] transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>`;
code = code.replace(/              <button\s+onClick=\{\(\) => setIsOpen\(false\)\}\s+className="p-1\.5 hover:bg-\[#12121208\] text-\[#12121250\] hover:text-\[#121212\] transition-colors"\s+>\s+<X className="w-4 h-4" \/>\s+<\/button>/, newHeaderBtns);


// Modify Messages Area wrapper
// <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
const msgAreaRegex = /<div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">/;
const newMsgArea = `<div className={\`flex-1 overflow-y-auto p-4 space-y-6 \${isFullScreen ? "bg-[#FAF9F6] py-12" : "bg-white"}\`}>
              <div className={isFullScreen ? "max-w-3xl mx-auto space-y-8" : "space-y-4"}>`;
code = code.replace(msgAreaRegex, newMsgArea);

// Need to close that extra div before {/* Input Area */}
code = code.replace(/              <div ref=\{messagesEndRef\} \/>\n            <\/div>/, '              <div ref={messagesEndRef} />\n              </div>\n            </div>');

// Update User message style to scale if full screen
// <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
const flexRegex = /className=\{\`flex \\\$\{msg\.role === "user" \? "justify-end" : "justify-start"\\\} gap-2\`\}/g;
code = code.replace(flexRegex, 'className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-3 ${isFullScreen && msg.role === "assistant" ? "pr-8 md:pr-24" : ""} ${isFullScreen && msg.role === "user" ? "pl-8 md:pl-24" : ""}`}');

const msgContentRegex = /className=\{\`max-w-\[80%\] p-3 text-sm leading-relaxed \\\$\{\s+msg\.role === "user"\s+\? "bg-\[#121212\] text-white font-sans"\s+: "bg-\[#FAF9F6\] border border-\[#12121208\] text-\[#121212\] font-serif"\s+\}\`\}/g;
const newMsgContentClass = `className={\`p-4 leading-relaxed \${isFullScreen ? "text-base md:text-lg" : "text-sm"} \${
                      msg.role === "user"
                        ? "bg-[#121212] text-white font-sans max-w-[85%]"
                        : isFullScreen 
                          ? "bg-transparent text-[#121212] font-serif border-l-2 border-[#C5A880] pl-6 max-w-full"
                          : "bg-[#FAF9F6] border border-[#12121208] text-[#121212] font-serif max-w-[85%]"
                    }\`}`;
code = code.replace(msgContentRegex, newMsgContentClass);


// Update typing indicator similarly
const typingRegex = /<div className="flex justify-start gap-2">/;
code = code.replace(typingRegex, '<div className={`flex justify-start gap-3 ${isFullScreen ? "pr-8 md:pr-24" : ""}`}>');

const typingContentRegex = /<div className="max-w-\[80%\] p-3 text-sm leading-relaxed bg-\[#FAF9F6\] border border-\[#12121208\] text-\[#12121250\] font-serif flex items-center gap-1">/;
const newTypingContentClass = `<div className={\`p-4 leading-relaxed flex items-center gap-1 \${isFullScreen ? "text-base md:text-lg bg-transparent border-l-2 border-[#12121220] pl-6" : "text-sm bg-[#FAF9F6] border border-[#12121208] max-w-[80%]"}\`}>`;
code = code.replace(typingContentRegex, newTypingContentClass);

// Update Input Area wrapper
const inputAreaRegex = /<div className="p-4 border-t border-\[#12121210\] bg-white">/;
const newInputArea = `<div className={\`p-4 border-t border-[#12121210] \${isFullScreen ? "bg-[#FAF9F6]" : "bg-white"}\`}>
              <div className={isFullScreen ? "max-w-3xl mx-auto" : ""}>`;
code = code.replace(inputAreaRegex, newInputArea);

code = code.replace(/              <\/div>\n            <\/div>\n          <\/motion\.div>/, '              </div>\n            </div>\n            </div>\n          </motion.div>');

fs.writeFileSync('src/components/AILearningAgent.tsx', code);
