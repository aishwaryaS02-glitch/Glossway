const fs = require('fs');

const path = 'src/components/LearningPortal.tsx';
let code = fs.readFileSync(path, 'utf8');

const engineBoxCode = `
  const renderExpansionEngineBox = () => (
    <div className="col-span-1 md:col-span-2 border-2 border-dashed border-[#12121215] p-6 text-center space-y-4 bg-white/50">
      <div className="mx-auto w-10 h-10 bg-[#F5F2ED] border border-[#12121210] text-[#C5A880] flex items-center justify-center rounded-full">
        <Sparkles className="w-5 h-5 animate-pulse" />
      </div>
      <div>
        <h4 className="font-serif italic text-sm font-medium text-black">
          Infinite Language Library Engine
        </h4>
        <p className="text-xs text-[#12121250] max-w-md mx-auto">
          Tired of standard words? Harness the vocabulary compiler. Instantly synthesize 15 advanced, high-utility {activeTab} vocabulary terms in {activeLanguage.name} on-demand.
        </p>
      </div>

      {expansionError && (
        <div className="text-xs font-mono text-red-500 bg-red-50 border border-red-100 p-2.5 max-w-sm mx-auto space-y-2">
          <p>⚠️ {expansionError}</p>
          <button
            onClick={handleExpandWords}
            disabled={isExpandingWords}
            className="text-red-700 hover:text-red-900 underline font-mono text-[10px] uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1 mx-auto font-bold"
          >
            <RefreshCw className={\`w-3 h-3 \${isExpandingWords ? "animate-spin" : ""}\`} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      <button
        onClick={handleExpandWords}
        disabled={isExpandingWords}
        className="mx-auto bg-[#121212] hover:bg-[#2d2d2d] disabled:opacity-50 text-white font-mono text-[10px] uppercase tracking-widest px-6 py-3 cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm"
      >
        {isExpandingWords ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            Compiling 15 level-up words...
          </>
        ) : (
          <>
            <Plus className="w-3.5 h-3.5" /> Compile 15 Level-Up Words
          </>
        )}
      </button>
    </div>
  );
`;

// Insert it before the return statement of the component
code = code.replace('  return (', engineBoxCode + '\n  return (');

// Remove the inline box from beginner tab
const boxRegex = /\{\/\* INFINITE EXPANSION ENGINE BOX \*\/\}.*?<\/div>.*?(?=          <\/div>)/s;
code = code.replace(boxRegex, '{renderExpansionEngineBox()}');

// For the middleware view, append {renderExpansionEngineBox()} at the end of the list inside the <div className="space-y-4">
const middlewareMatch = /\{combinedMiddleware\.map\(\(expr, idx\) => \{.*?\}\)\}/s;
code = code.replace(middlewareMatch, (match) => match + '\n            {renderExpansionEngineBox()}');

// For the pro view, append {renderExpansionEngineBox()} at the end of the list inside the grid
const proMatch = /\{combinedPro\.map\(\(rule, idx\) => \{.*?\}\)\}/s;
code = code.replace(proMatch, (match) => match + '\n                {renderExpansionEngineBox()}');

fs.writeFileSync(path, code);
