const fs = require('fs');

const newCode = `import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, User, Maximize2, Minimize2, History, MessageSquare } from "lucide-react";
import { apiFetch } from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";

export function AILearningAgent({ userProfile }: { userProfile: any }) {
  const activeLanguage = userProfile?.languages ? Object.keys(userProfile.languages)[0] : "a new language";

  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I am your AI language learning agent. I can help you practice grammar, test your vocabulary, or explain complex sentence structures. How can I assist you today?" }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Create refs for all messages to allow scrolling
  const messageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToMessage = (index: number) => {
    if (messageRefs.current[index]) {
      messageRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
      // On mobile, close sidebar after clicking
      if (!isFullScreen) setShowSidebar(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input.trim();
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const response = await apiFetch("/api/chat-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages,
          targetLanguage: activeLanguage,
        }),
        actionName: "Chat Agent",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (errorData && errorData.error) {
          throw new Error(errorData.error);
        }
        throw new Error(\`API returned \${response.status}\`);
      }
      const data = await response.json();
      if (data.success && data.text) {
        setMessages(prev => [...prev, { role: "assistant", content: data.text }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: "I'm sorry, I'm having trouble connecting right now." }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "assistant", content: "I'm sorry, something went wrong on my end." }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Extract user questions for history
  const historyItems = messages.map((msg, index) => ({ ...msg, index })).filter(msg => msg.role === "user");

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={\`fixed bottom-6 right-6 w-14 h-14 bg-[#0f172a] text-[#2563eb] rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform z-40 \${isOpen ? "hidden" : "flex"}\`}
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
            className={isFullScreen ? "fixed inset-0 w-full h-full bg-[#f8fafc] z-[60] flex flex-row overflow-hidden transition-all duration-500 ease-in-out" : "fixed bottom-6 right-6 w-full max-w-[380px] h-[550px] max-h-[80vh] bg-white border border-[#0f172a15] shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-300"}
          >
            {/* Sidebar / History (Conditional) */}
            {(showSidebar || isFullScreen) && (
              <div className={\`\${isFullScreen ? "w-72 border-r border-[#0f172a10] bg-white flex flex-col shrink-0" : "absolute inset-0 bg-white z-20 flex flex-col"}\`}>
                <div className="p-4 border-b border-[#0f172a10] flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-[#0f172a50]" />
                    <h3 className="font-sans font-semibold text-[#0f172a]">Session History</h3>
                  </div>
                  {!isFullScreen && (
                    <button onClick={() => setShowSidebar(false)} className="p-1 hover:bg-[#0f172a08] text-[#0f172a50] transition-colors cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {historyItems.length === 0 ? (
                    <div className="text-center text-[#0f172a40] text-xs font-mono uppercase tracking-widest mt-10">
                      No past topics yet
                    </div>
                  ) : (
                    historyItems.map((item) => (
                      <button
                        key={item.index}
                        onClick={() => scrollToMessage(item.index)}
                        className="w-full text-left p-3 rounded bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#0f172a08] transition-colors flex items-start gap-2 group cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#0f172a30] shrink-0 mt-0.5 group-hover:text-[#2563eb]" />
                        <span className="text-xs text-[#0f172a] font-sans font-medium line-clamp-2 leading-relaxed">
                          {item.content}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Chat Container */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {/* Header */}
              <div className={\`flex items-center justify-between p-4 \${isFullScreen ? "bg-white border-b border-[#0f172a10]" : "bg-[#f8fafc] border-b border-[#0f172a10]"}\`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#0f172a] flex items-center justify-center">
                    <Bot className="w-4 h-4 text-[#2563eb]" />
                  </div>
                  <div>
                    <h3 className={\`font-sans font-semibold tracking-tight font-medium text-[#0f172a] leading-tight \${isFullScreen ? "text-xl" : ""}\`}>
                      ai mentor AI Agent
                    </h3>
                    <p className="text-[9px] font-mono uppercase tracking-widest text-[#0f172a50] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#2563eb]" /> Online
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!isFullScreen && (
                    <button
                      onClick={() => setShowSidebar(true)}
                      className="p-2 hover:bg-[#0f172a08] text-[#0f172a50] hover:text-[#0f172a] transition-colors cursor-pointer mr-1"
                      title="View session history"
                    >
                      <History className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsFullScreen(!isFullScreen)}
                    className="p-2 hover:bg-[#0f172a08] text-[#0f172a50] hover:text-[#0f172a] transition-colors cursor-pointer"
                    title={isFullScreen ? "Exit conversation mode" : "Enter conversation mode"}
                  >
                    {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => { setIsOpen(false); setIsFullScreen(false); setShowSidebar(false); }}
                    className="p-2 hover:bg-[#0f172a08] text-[#0f172a50] hover:text-[#0f172a] transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className={\`flex-1 overflow-y-auto p-4 space-y-6 \${isFullScreen ? "bg-[#f8fafc] py-12" : "bg-white"}\`}>
                <div className={isFullScreen ? "max-w-3xl mx-auto space-y-8" : "space-y-4"}>
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    ref={(el) => (messageRefs.current[i] = el)}
                    className={\`flex \${msg.role === "user" ? "justify-end" : "justify-start"} gap-3 \${isFullScreen && msg.role === "assistant" ? "pr-8 md:pr-24" : ""} \${isFullScreen && msg.role === "user" ? "pl-8 md:pl-24" : ""}\`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-6 h-6 bg-[#f8fafc] border border-[#0f172a10] flex items-center justify-center shrink-0 mt-1">
                        <Bot className="w-3 h-3 text-[#2563eb]" />
                      </div>
                    )}
                    <div
                      className={\`p-4 leading-relaxed \${isFullScreen ? "text-base md:text-lg" : "text-sm"} \${
                        msg.role === "user"
                          ? "bg-[#0f172a] text-white font-sans max-w-[85%]"
                          : isFullScreen 
                            ? "bg-transparent text-[#0f172a] font-sans font-semibold tracking-tight border-l-2 border-[#2563eb] pl-6 max-w-full"
                            : "bg-[#f8fafc] border border-[#0f172a08] text-[#0f172a] font-sans font-semibold tracking-tight max-w-[85%]"
                      }\`}
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
                  <div className={\`flex justify-start gap-3 \${isFullScreen ? "pr-8 md:pr-24" : ""}\`}>
                    <div className="w-6 h-6 bg-[#f8fafc] border border-[#0f172a10] flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-3 h-3 text-[#2563eb]" />
                    </div>
                    <div className={\`p-4 leading-relaxed flex items-center gap-1 \${isFullScreen ? "text-base md:text-lg bg-transparent border-l-2 border-[#0f172a20] pl-6" : "text-sm bg-[#f8fafc] border border-[#0f172a08] max-w-[80%]"}\`}>
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
              <div className={\`p-4 border-t border-[#0f172a10] \${isFullScreen ? "bg-white" : "bg-white"}\`}>
                <div className={isFullScreen ? "max-w-3xl mx-auto" : ""}>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask a language question..."
                    className={\`flex-1 border border-[#0f172a15] px-4 py-3 \${isFullScreen ? "bg-[#f8fafc] text-sm" : "bg-[#f8fafc] text-xs"} font-mono outline-none focus:border-[#2563eb] transition-colors placeholder:text-[#0f172a40]\`}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
`;

fs.writeFileSync('src/components/AILearningAgent.tsx', newCode);
console.log("Updated AILearningAgent.tsx with sidebar");
