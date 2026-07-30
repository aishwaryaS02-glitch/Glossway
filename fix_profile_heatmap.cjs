const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileView.tsx', 'utf8');

const heatmapJSX = `
          {/* Monthly Study Intensity Heatmap */}
          <section className="bg-white border border-[#12121215] p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#12121208]">
              <div>
                <h3 className="text-xl font-serif italic font-medium text-[#121212]">Study Consistency</h3>
                <p className="text-[10px] font-mono uppercase text-[#12121250] tracking-wider mt-0.5">
                  Monthly intensity heatmap
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-mono uppercase text-[#12121240]">Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-[#F5F2ED] border border-[#12121208]"></div>
                  <div className="w-3 h-3 bg-[#E6D5B8] border border-[#12121208]"></div>
                  <div className="w-3 h-3 bg-[#D4BB9A] border border-[#12121208]"></div>
                  <div className="w-3 h-3 bg-[#C5A880] border border-[#12121208]"></div>
                  <div className="w-3 h-3 bg-[#A3855E] border border-[#12121208]"></div>
                </div>
                <span className="text-[8px] font-mono uppercase text-[#12121240]">More</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {Array.from({ length: 30 }).map((_, i) => {
                const intensity = Math.random();
                let bgColor = "bg-[#F5F2ED]"; // 0
                if (intensity > 0.8) bgColor = "bg-[#A3855E]";
                else if (intensity > 0.5) bgColor = "bg-[#C5A880]";
                else if (intensity > 0.2) bgColor = "bg-[#D4BB9A]";
                else if (intensity > 0.05) bgColor = "bg-[#E6D5B8]";
                
                return (
                  <div 
                    key={i} 
                    className={\`w-[22px] h-[22px] \${bgColor} rounded-xs border border-[#12121208] transition-all hover:scale-110 cursor-pointer\`}
                    title={\`Day \${30 - i}: \${Math.floor(intensity * 100)}% intensity\`}
                  ></div>
                );
              })}
            </div>
          </section>
`;

// Insert after Goal Incomplete section
code = code.replace(
  /              <\/div>\n            <\/div>\n          <\/section>\n          \{\/\* Language Progress bars \*\/\}/g,
  `              </div>\n            </div>\n          </section>\n${heatmapJSX}\n          {/* Language Progress bars */}`
);

fs.writeFileSync('src/components/ProfileView.tsx', code);
