const fs = require('fs');
let code = fs.readFileSync('src/components/AILearningAgent.tsx', 'utf8');

const headerRegex = /<div className="bg-\[#FAF9F6\] border-b border-\[#12121210\] p-4 flex items-center justify-between">/;
const newHeader = `<div className={\`flex items-center justify-between p-4 \${isFullScreen ? "bg-transparent max-w-3xl mx-auto w-full pt-8" : "bg-[#FAF9F6] border-b border-[#12121210]"}\`}>`;

code = code.replace(headerRegex, newHeader);

const titleRegex = /<h3 className="font-serif italic font-medium text-\[#121212\] leading-tight">/;
const newTitle = `<h3 className={\`font-serif italic font-medium text-[#121212] leading-tight \${isFullScreen ? "text-2xl" : ""}\`}>`;

code = code.replace(titleRegex, newTitle);

fs.writeFileSync('src/components/AILearningAgent.tsx', code);
