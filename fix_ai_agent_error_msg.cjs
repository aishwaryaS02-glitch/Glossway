const fs = require('fs');
let code = fs.readFileSync('src/components/AILearningAgent.tsx', 'utf8');

const targetStr = `    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "assistant", content: "I'm sorry, something went wrong on my end." }]);
    }`;

const replaceStr = `    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, { role: "assistant", content: err.message || "I'm sorry, something went wrong on my end." }]);
    }`;

if(code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync('src/components/AILearningAgent.tsx', code);
  console.log("Updated AILearningAgent.tsx successfully");
} else {
  console.log("target string not found in AILearningAgent.tsx");
}
