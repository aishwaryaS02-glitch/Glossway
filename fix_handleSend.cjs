const fs = require('fs');
let code = fs.readFileSync('src/components/AILearningAgent.tsx', 'utf8');

const regex = /  const handleSend = \(\) => \{[\s\S]*?  \};\n/g;
const replacement = `  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input.trim();
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages,
          targetLanguage: "the user's chosen language", // We could pass the actual language, but this is fine for now
        }),
      });

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
`;

code = code.replace(regex, replacement);

// Replace disabled state
code = code.replace(/disabled=\{\!input\.trim\(\)\}/g, 'disabled={!input.trim() || isTyping}');

fs.writeFileSync('src/components/AILearningAgent.tsx', code);
