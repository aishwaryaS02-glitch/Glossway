const fs = require('fs');
let code = fs.readFileSync('src/components/AILearningAgent.tsx', 'utf8');

const importRegex = /export function AILearningAgent\(\) \{/;
const replacement = `export function AILearningAgent({ userProfile }: { userProfile: any }) {
  const activeLanguage = userProfile?.languages ? Object.keys(userProfile.languages)[0] : "a new language";
`;
code = code.replace(importRegex, replacement);

const fetchRegex = /targetLanguage: "the user's chosen language", \/\/ We could pass the actual language, but this is fine for now/g;
code = code.replace(fetchRegex, 'targetLanguage: activeLanguage,');

// Adding typing indicator
const messagesEndRegex = /              \{messages\.map\(\(msg, i\) => \(/g;
const newMessagesEndRegex = `              {messages.map((msg, i) => (`;
code = code.replace(messagesEndRegex, newMessagesEndRegex);

const refRegex = /              <div ref=\{messagesEndRef\} \/>/g;
const newRefRegex = `              {isTyping && (
                <div className="flex justify-start gap-2">
                  <div className="w-6 h-6 bg-[#FAF9F6] border border-[#12121210] flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-3 h-3 text-[#C5A880]" />
                  </div>
                  <div className="max-w-[80%] p-3 text-sm leading-relaxed bg-[#FAF9F6] border border-[#12121208] text-[#12121250] font-serif flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#C5A880] rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-[#C5A880] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                    <span className="w-1.5 h-1.5 bg-[#C5A880] rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />`;
code = code.replace(refRegex, newRefRegex);

fs.writeFileSync('src/components/AILearningAgent.tsx', code);
