const fs = require('fs');
let code = fs.readFileSync('src/components/QuizView.tsx', 'utf8');

code = code.replace(
  'import { MULTILINGUAL_DATA } from "../data/multilingualHubData";',
  'import { MULTILINGUAL_DATA } from "../data/multilingualHubData";\nimport { playSuccessChime } from "../utils/audio";'
);

const handleCheckRegex = /    if \(isCorrect\) \{\n      setIsAnswered\(true\);\n      const newScore = score \+ 1;/;
const newHandleCheck = `    if (isCorrect) {
      setIsAnswered(true);
      playSuccessChime();
      const newScore = score + 1;`;

code = code.replace(handleCheckRegex, newHandleCheck);

fs.writeFileSync('src/components/QuizView.tsx', code);
