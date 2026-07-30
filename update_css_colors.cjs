const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

// Update dark mode opacities
code = code.replace(/color: rgba\(250, 249, 246, 0.55\)/g, 'color: rgba(250, 249, 246, 0.70)');
code = code.replace(/color: rgba\(250, 249, 246, 0.25\)/g, 'color: rgba(250, 249, 246, 0.50)');

// We also need to add light mode text opacity overrides for low opacities
const lightModeOverrides = `
/* Light mode WCAG AA 4.5:1 contrast enforcement for muted and tertiary text */
[class*="text-[#0f172a50]"],
[class*="text-[#0f172a45]"],
[class*="text-[#0f172a40]"],
[class*="text-[#0f172a35]"],
[class*="text-[#0f172a30]"],
[class*="text-[#0f172a25]"],
[class*="text-[#0f172a20]"],
[class*="text-[#0f172a15]"],
[class*="text-[#0f172a10]"],
[class*="text-gray-500"],
[class*="text-gray-400"],
[class*="text-slate-500"],
[class*="text-slate-400"],
[class*="text-neutral-500"],
[class*="text-neutral-400"] {
  color: rgba(15, 23, 42, 0.65) !important;
}
`;

if (!code.includes('Light mode WCAG AA')) {
  code = code + lightModeOverrides;
}

fs.writeFileSync('src/index.css', code);
console.log('Updated index.css');
