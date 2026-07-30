const fs = require('fs');
let code = fs.readFileSync('src/components/QuizView.tsx', 'utf8');

const stateInjection = `
  const [quizComplete, setQuizComplete] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState<QuizQuestion[]>([]);
  const [quizSummary, setQuizSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
`;
code = code.replace(/  const \[quizComplete, setQuizComplete\] = useState\(false\);/, stateInjection);

const handleCheckRegex = /      setIsWrong\(true\);/;
const newHandleCheck = `      setIsWrong(true);
      if (!wrongAnswers.find(q => q.question === currentQuestion.question)) {
        setWrongAnswers(prev => [...prev, currentQuestion]);
      }`;
code = code.replace(handleCheckRegex, newHandleCheck);


const fetchSummaryRegex = /  const fetchQuizHistory = async \(\) => \{/;
const newFetchSummary = `  const generateSummary = async () => {
    setLoadingSummary(true);
    try {
      const response = await fetch("/api/quiz-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          score,
          totalQuestions: questions.length,
          language: selectedLanguageId,
          wrongAnswers: wrongAnswers.map(q => ({
            question: q.question,
            correctAnswer: q.options.find(opt => opt.letter === q.correctAnswer)?.text || q.correctAnswer
          }))
        })
      });
      const data = await response.json();
      if (data.success) {
        setQuizSummary(data.summary);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchQuizHistory = async () => {`;
code = code.replace(fetchSummaryRegex, newFetchSummary);


const useEffectRegex = /  useEffect\(\(\) => \{\n    if \(userProfile && quizComplete\) \{\n      fetchQuizHistory\(\);\n    \}\n  \}, \[userProfile, quizComplete\]\);/;
const newUseEffect = `  useEffect(() => {
    if (userProfile && quizComplete) {
      fetchQuizHistory();
      generateSummary();
    }
  }, [userProfile, quizComplete]);`;
code = code.replace(useEffectRegex, newUseEffect);

fs.writeFileSync('src/components/QuizView.tsx', code);
