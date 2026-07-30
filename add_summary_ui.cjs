const fs = require('fs');
let code = fs.readFileSync('src/components/QuizView.tsx', 'utf8');

const summaryUI = `
        {/* AI SESSION SUMMARY */}
        <div className="max-w-md mx-auto pt-4 text-left">
          <div className="p-6 bg-[#FAF9F6] border border-[#12121215] shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="w-4 h-4 text-[#C5A880]" />
              <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#12121250] font-bold">AI Session Summary</span>
            </div>
            {loadingSummary ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-3">
                <Loader2 className="w-5 h-5 text-[#C5A880] animate-spin" />
                <span className="text-xs font-mono text-[#12121240] tracking-wide">Kabir is analyzing your performance...</span>
              </div>
            ) : (
              <p className="text-sm font-serif leading-relaxed text-[#12121280]">
                {quizSummary || "Keep up the excellent work! Regular practice is the key to fluency."}
              </p>
            )}
          </div>
        </div>

        {/* CUMULATIVE LEARNER PERFORMANCE METRICS (Bento Grid Style) */}
`;

code = code.replace(
  '        {/* CUMULATIVE LEARNER PERFORMANCE METRICS (Bento Grid Style) */}',
  summaryUI
);

fs.writeFileSync('src/components/QuizView.tsx', code);
