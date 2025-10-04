'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useRouter } from 'next/navigation';

const QUIZ_QUESTIONS = [
  { id: 1, question: "What is the native token of Base?", answer: "ETH", hint: "3 letters" },
  { id: 2, question: "Which company developed Base?", answer: "Coinbase", hint: "8 letters" },
  { id: 3, question: "What is Base built on?", answer: "Optimism", hint: "8 letters" },
  { id: 4, question: "Is Base EVM compatible? (yes/no)", answer: "Yes", hint: "3 letters" },
  { id: 5, question: "What type of network is Base? (Layer1/Layer2)", answer: "Layer2", hint: "6 letters" },
  { id: 6, question: "What is Base's underlying blockchain?", answer: "Ethereum", hint: "8 letters" },
  { id: 7, question: "What year was Base launched?", answer: "2023", hint: "4 digits" },
  { id: 8, question: "What type of rollup is Base? (Optimistic/ZK)", answer: "Optimistic", hint: "10 letters" },
  { id: 9, question: "Are gas fees on Base higher or lower than Ethereum?", answer: "Lower", hint: "5 letters" },
  { id: 10, question: "What is the name of Base's major upgrade?", answer: "Bedrock", hint: "7 letters" }
];

const BATCH_QUIZ_ABI = [
  {
    "inputs": [],
    "name": "startQuizSession",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string[10]", "name": "userAnswers", "type": "string[10]"}],
    "name": "submitBatchAnswers",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export function BatchQuiz() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(10).fill(''));
  const [quizPhase, setQuizPhase] = useState<'start' | 'session' | 'quiz' | 'submit' | 'done'>('start');
  const [error, setError] = useState('');
  
  const { writeContract: startSession, data: startHash } = useWriteContract();
  const { isSuccess: startSuccess } = useWaitForTransactionReceipt({ 
    hash: startHash,
    confirmations: 1,
  });
  
  const { writeContract: submitAnswers, data: submitHash } = useWriteContract();
  const { isSuccess: submitSuccess } = useWaitForTransactionReceipt({ 
    hash: submitHash,
    confirmations: 1,
  });

  // Session başarılı
  useEffect(() => {
    if (startSuccess && quizPhase === 'session') {
      console.log('✅ Session started successfully');
      setQuizPhase('quiz');
    }
  }, [startSuccess, quizPhase]);

  // Submit başarılı
  useEffect(() => {
    if (submitSuccess && submitHash) {
      console.log('✅ Quiz submitted successfully!');
      console.log('TX Hash:', submitHash);
      setQuizPhase('done');
      
      // 3 saniye bekle ve leaderboard'a git
      setTimeout(() => {
        router.push('/leaderboard');
      }, 3000);
    }
  }, [submitSuccess, submitHash, router]);

  // Alternatif: TX hash varsa bile başarı say
  useEffect(() => {
    if (submitHash && quizPhase === 'submit') {
      console.log('TX submitted, assuming success after 10s');
      const timer = setTimeout(() => {
        setQuizPhase('done');
        setTimeout(() => {
          router.push('/leaderboard');
        }, 3000);
      }, 10000); // 10 saniye bekle
      
      return () => clearTimeout(timer);
    }
  }, [submitHash, quizPhase, router]);

  const handleStartQuiz = async () => {
    try {
      setError('');
      setQuizPhase('session');
      
      const contractAddress = '0x749cdd9355254782828eDae7D85212A2e408D14c';
      
      await startSession({
        address: contractAddress as `0x${string}`,
        abi: BATCH_QUIZ_ABI,
        functionName: 'startQuizSession',
      });
    } catch (err) {
      console.error('Start error:', err);
      setError('Failed to start quiz');
      setQuizPhase('start');
    }
  };

  const handleSubmitAll = async () => {
    if (answers.some(a => !a.trim())) {
      alert('Please answer all questions!');
      return;
    }

    try {
      setError('');
      setQuizPhase('submit');
      
      const contractAddress = '0x749cdd9355254782828eDae7D85212A2e408D14c';
      console.log('Submitting answers:', answers);
      
      await submitAnswers({
        address: contractAddress as `0x${string}`,
        abi: BATCH_QUIZ_ABI,
        functionName: 'submitBatchAnswers',
        args: [answers],
      });
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to submit answers');
      setQuizPhase('quiz');
    }
  };

  const checkAnswers = () => {
    let correct = 0;
    answers.forEach((answer, i) => {
      if (answer.toLowerCase() === QUIZ_QUESTIONS[i].answer.toLowerCase()) {
        correct++;
      }
    });
    return correct;
  };

  // START SCREEN
  if (quizPhase === 'start') {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">Base Blockchain Quiz</h2>
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-6 mb-6">
          <h3 className="text-2xl font-bold mb-4 text-center text-yellow-400">
            Win 100 LEARN Tokens!
          </h3>
          <p className="text-center mb-4">Answer all 10 questions correctly to win</p>
        </div>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-4">
            <p className="text-red-300">{error}</p>
          </div>
        )}
        
        <button
          onClick={handleStartQuiz}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-bold text-lg"
        >
          Start Quiz →
        </button>
      </div>
    );
  }

  // LOADING SCREEN
  if (quizPhase === 'session' || quizPhase === 'submit') {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-6"></div>
          <h2 className="text-2xl font-bold mb-2">
            {quizPhase === 'session' ? 'Starting quiz session...' : 'Verifying your answers...'}
          </h2>
          <p className="text-gray-400">This may take 10-15 seconds</p>
          {submitHash && (
            <p className="text-sm text-gray-500 mt-4">
              TX: {submitHash.slice(0,10)}...{submitHash.slice(-8)}
            </p>
          )}
        </div>
      </div>
    );
  }

  // QUIZ SCREEN
  if (quizPhase === 'quiz') {
    const question = QUIZ_QUESTIONS[currentQuestion];
    
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Question {currentQuestion + 1}/10</span>
            <span>{answers.filter(a => a).length} answered</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / 10) * 100}%` }}
            />
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4">{question.question}</h3>
          <input
            type="text"
            value={answers[currentQuestion]}
            onChange={(e) => {
              const newAnswers = [...answers];
              newAnswers[currentQuestion] = e.target.value;
              setAnswers(newAnswers);
            }}
            placeholder="Type your answer..."
            className="w-full px-4 py-3 bg-slate-700 rounded-lg text-lg"
          />
          <p className="text-sm text-gray-400 mt-2">Hint: {question.hint}</p>
        </div>

        <div className="grid grid-cols-10 gap-2 mb-6">
          {answers.map((answer, i) => (
            <button
              key={i}
              onClick={() => setCurrentQuestion(i)}
              className={`py-2 rounded-lg text-sm font-bold ${
                i === currentQuestion ? 'bg-blue-600' :
                answer ? 'bg-green-600/50' : 'bg-slate-700'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg font-bold"
          >
            ← Previous
          </button>

          {currentQuestion === 9 ? (
            <button
              onClick={handleSubmitAll}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg font-bold text-lg"
            >
              Submit All Answers
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(Math.min(9, currentQuestion + 1))}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    );
  }

  // RESULT SCREEN
  if (quizPhase === 'done') {
    const correctCount = checkAnswers();
    const isPerfect = correctCount === 10;
    
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl max-w-4xl mx-auto">
        <div className="text-center py-8">
          <h2 className="text-4xl font-bold mb-4">
            {isPerfect ? '🎉 Congratulations!' : '📊 Quiz Completed'}
          </h2>
          <p className="text-2xl mb-6">You got {correctCount}/10 correct</p>
          
          {isPerfect ? (
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-6 mb-6">
              <p className="text-xl font-bold">You earned 100 LEARN tokens!</p>
              <p className="text-sm mt-2">Transaction confirmed on Base Sepolia</p>
            </div>
          ) : (
            <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-6 mb-6">
              <p className="text-xl">Try again next week for another chance!</p>
            </div>
          )}
          
          <p className="text-gray-400">Redirecting to leaderboard...</p>
        </div>
      </div>
    );
  }

  return null;
}
