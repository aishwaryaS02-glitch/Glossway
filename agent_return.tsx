  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-[#0f172a] text-[#2563eb] rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform z-40 ${isOpen ? "hidden" : "flex"}`}
        title="Chat with AI Agent"
      >
        <Bot className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2563eb] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-[#2563eb] border-2 border-[#0f172a]"></span>
        </span>
      </button>

      {/* Chat Interface Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={isFullScreen ? "fixed inset-0 w-full h-full bg-[#f8fafc] z-[60] flex flex-col overflow-hidden transition-all duration-500 ease-in-out" : "fixed bottom-6 right-6 w-full max-w-[380px] h-[550px] max-h-[80vh] bg-white border border-[#0f172a15] shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-300"}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 ${isFullScreen ? "bg-transparent max-w-3xl mx-auto w-full pt-8" : "bg-[#f8fafc] border-b border-[#0f172a10]"}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#0f172a] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[#2563eb]" />
                </div>
                <div>
                  <h3 className={`font-sans font-semibold tracking-tight font-medium text-[#0f172a] leading-tight ${isFullScreen ? "text-2xl" : ""}`}>
                    ai mentor AI Agent
                  </h3>
                  <p className="text-[9px] font-mono uppercase tracking-widest text-[#0f172a50] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#2563eb]" /> Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="p-2 hover:bg-[#0f172a08] text-[#0f172a50] hover:text-[#0f172a] transition-colors cursor-pointer"
                  title={isFullScreen ? "Exit conversation mode" : "Enter conversation mode"}
                >
                  {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => { setIsOpen(false); setIsFullScreen(false); }}
                  className="p-2 hover:bg-[#0f172a08] text-[#0f172a50] hover:text-[#0f172a] transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-6 ${isFullScreen ? "bg-[#f8fafc] py-12" : "bg-white"}`}>
              <div className={isFullScreen ? "max-w-3xl mx-auto space-y-8" : "space-y-4"}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-3 ${isFullScreen && msg.role === "assistant" ? "pr-8 md:pr-24" : ""} ${isFullScreen && msg.role === "user" ? "pl-8 md:pl-24" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 bg-[#f8fafc] border border-[#0f172a10] flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-3 h-3 text-[#2563eb]" />
                    </div>
                  )}
                  <div
                    className={`p-4 leading-relaxed ${isFullScreen ? "text-base md:text-lg" : "text-sm"} ${
                      msg.role === "user"
                        ? "bg-[#0f172a] text-white font-sans max-w-[85%]"
                        : isFullScreen 
                          ? "bg-transparent text-[#0f172a] font-sans font-semibold tracking-tight border-l-2 border-[#2563eb] pl-6 max-w-full"
                          : "bg-[#f8fafc] border border-[#0f172a08] text-[#0f172a] font-sans font-semibold tracking-tight max-w-[85%]"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-6 h-6 bg-[#0f172a] flex items-center justify-center shrink-0 mt-1">
                      <User className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className={`flex justify-start gap-3 ${isFullScreen ? "pr-8 md:pr-24" : ""}`}>
                  <div className="w-6 h-6 bg-[#f8fafc] border border-[#0f172a10] flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-3 h-3 text-[#2563eb]" />
                  </div>
                  <div className={`p-4 leading-relaxed flex items-center gap-1 ${isFullScreen ? "text-base md:text-lg bg-transparent border-l-2 border-[#0f172a20] pl-6" : "text-sm bg-[#f8fafc] border border-[#0f172a08] max-w-[80%]"}`}>
                    <span className="w-1.5 h-1.5 bg-[#2563eb] rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-[#2563eb] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                    <span className="w-1.5 h-1.5 bg-[#2563eb] rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className={`p-4 border-t border-[#0f172a10] ${isFullScreen ? "bg-[#f8fafc]" : "bg-white"}`}>
              <div className={isFullScreen ? "max-w-3xl mx-auto" : ""}>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask a language question..."
                  className={`flex-1 border border-[#0f172a15] px-4 py-3 ${isFullScreen ? "bg-white text-sm" : "bg-[#f8fafc] text-xs"} font-mono outline-none focus:border-[#2563eb] transition-colors placeholder:text-[#0f172a40]`}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="bg-[#0f172a] text-[#2563eb] w-10 h-10 flex items-center justify-center hover:bg-[#2563eb] hover:text-[#0f172a] disabled:opacity-50 disabled:hover:bg-[#0f172a] disabled:hover:text-[#2563eb] transition-colors shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
