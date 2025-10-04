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

type QuizState = 'welcome' | 'questions' | 'submitting' | 'processing' | 'result';

export function BatchQuiz() {
  const router = useRouter();
  const [quizState, setQuizState] = useState<QuizState>('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(10).fill(''));
  const [error, setError] = useState('');
  const [redirectTimer, setRedirectTimer] = useState(5);
  
  const { writeContract: startSession, data: startHash } = useWriteContract();
  const { isSuccess: isStarted } = useWaitForTransactionReceipt({ hash: startHash });
  
  const { writeContract: submitAnswers, data: submitHash } = useWriteContract();
  const { isSuccess: isSubmitted } = useWaitForTransactionReceipt({ hash: submitHash });

  // Handle session start
  useEffect(() => {
    if (isStarted && quizState === 'welcome') {
      setQuizState('questions');
    }
  }, [isStarted, quizState]);

  // Handle submission success
  useEffect(() => {
    if (isSubmitted && quizState === 'processing') {
      setQuizState('result');
    }
  }, [isSubmitted, quizState]);

  // Handle redirect after result
  useEffect(() => {
    if (quizState === 'result') {
      const timer = setInterval(() => {
        setRedirectTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push('/leaderboard');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [quizState, router]);

  const handleStartQuiz = async () => {
    try {
      setError('');
      const contractAddress = process.env.NEXT_PUBLIC_BATCH_QUIZ || '0x749cdd9355254782828eDae7D85212A2e408D14c';
      
      await startSession({
        address: contractAddress as `0x${string}`,
        abi: BATCH_QUIZ_ABI,
        functionName: 'startQuizSession',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start quiz';
      setError(errorMessage);
    }
  };

  const handleSubmitAll = async () => {
    if (answers.some(a => !a.trim())) {
      alert('Please answer all questions before submitting!');
      return;
    }

    setQuizState('submitting');
    
    try {
      const contractAddress = process.env.NEXT_PUBLIC_BATCH_QUIZ || '0x749cdd9355254782828eDae7D85212A2e408D14c';
      
      await submitAnswers({
        address: contractAddress as `0x${string}`,
        abi: BATCH_QUIZ_ABI,
        functionName: 'submitBatchAnswers',
        args: [answers],
      });
      
      setQuizState('processing');
    } catch (error: unknown) {
      setError('Transaction failed. Please try again.');
      setQuizState('questions');
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

  // WELCOME SCREEN
  if (quizState === 'welcome') {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl max-w-4xl mx-auto animate-fadeIn">
        <h2 className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          Base Blockchain Quiz Challenge
        </h2>
        
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-8 mb-8">
          <h3 className="text-3xl font-bold mb-6 text-center text-yellow-400">
            🏆 Win 100 LEARN Tokens!
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-black/30 rounded-lg p-4">
              <p className="flex items-center gap-3">
                <span className="text-2xl">📝</span>
                <span>10 Questions</span>
              </p>
            </div>
            <div className="bg-black/30 rounded-lg p-4">
              <p className="flex items-center gap-3">
                <span className="text-2xl">⏱️</span>
                <span>30 Minutes</span>
              </p>
            </div>
            <div className="bg-black/30 rounded-lg p-4">
              <p className="flex items-center gap-3">
                <span className="text-2xl">💯</span>
                <span>All Correct Required</span>
              </p>
            </div>
            <div className="bg-black/30 rounded-lg p-4">
              <p className="flex items-center gap-3">
                <span className="text-2xl">💰</span>
                <span>100 LEARN Reward</span>
              </p>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-300">{error}</p>
          </div>
        )}
        
        <button
          onClick={handleStartQuiz}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-bold text-xl transform hover:scale-105 transition-all duration-200 shadow-xl"
        >
          Start Quiz Now →
        </button>
      </div>
    );
  }

  // QUESTIONS SCREEN
  if (quizState === 'questions') {
    const question = QUIZ_QUESTIONS[currentQuestion];
    
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl max-w-4xl mx-auto animate-fadeIn">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-3">
            <span className="font-bold">Question {currentQuestion + 1}/10</span>
            <span className="text-gray-400">{answers.filter(a => a).length} answered</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-500 rounded-full"
              style={{ width: `${((currentQuestion + 1) / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-slate-700/50 backdrop-blur rounded-xl p-8 mb-8">
          <h3 className="text-2xl font-bold mb-6">{question.question}</h3>
          <input
            type="text"
            value={answers[currentQuestion]}
            onChange={(e) => {
              const newAnswers = [...answers];
              newAnswers[currentQuestion] = e.target.value;
              setAnswers(newAnswers);
            }}
            placeholder="Type your answer here..."
            className="w-full px-6 py-4 bg-slate-800 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
          <p className="text-sm text-gray-400 mt-3">💡 Hint: {question.hint}</p>
        </div>

        {/* Question Navigation Grid */}
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-8">
          {answers.map((answer, i) => (
            <button
              key={i}
              onClick={() => setCurrentQuestion(i)}
              className={`
                py-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105
                ${i === currentQuestion ? 'bg-purple-600 shadow-lg' :
                  answer ? 'bg-green-600/70' : 'bg-slate-700'}
              `}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center gap-4">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-xl font-bold transition"
          >
            ← Previous
          </button>

          {currentQuestion === 9 ? (
            <button
              onClick={handleSubmitAll}
              disabled={answers.some(a => !a.trim())}
              className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 rounded-xl font-bold text-lg shadow-xl transform hover:scale-105 transition"
            >
              Submit All Answers ✓
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(Math.min(9, currentQuestion + 1))}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    );
  }

  // SUBMITTING SCREEN
  if (quizState === 'submitting' || quizState === 'processing') {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl max-w-4xl mx-auto animate-fadeIn">
        <div className="text-center py-12">
          <div className="mb-8">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
          </div>
          <h2 className="text-3xl font-bold mb-4">Processing Your Answers...</h2>
          <p className="text-xl text-gray-400">Please wait while we verify your quiz results</p>
          <p className="text-sm text-gray-500 mt-4">Do not close this window</p>
        </div>
      </div>
    );
  }

  // RESULT SCREEN
  if (quizState === 'result') {
    const correctCount = checkAnswers();
    const isPerfect = correctCount === 10;
    
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl max-w-4xl mx-auto animate-fadeIn">
        <div className="text-center py-8">
          {isPerfect ? (
            <>
              <div className="text-6xl mb-6 animate-bounce">🎉</div>
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Congratulations!
              </h2>
              <div className="bg-green-500/20 border-2 border-green-500 rounded-xl p-6 mb-6">
                <p className="text-2xl font-bold mb-2">Perfect Score!</p>
                <p className="text-3xl font-bold text-green-400">You earned 100 LEARN tokens!</p>
              </div>
            </>
          ) : (
            <>
              <div className="text-6xl mb-6">😔</div>
              <h2 className="text-4xl font-bold mb-4">Almost There!</h2>
              <div className="bg-yellow-500/20 border-2 border-yellow-500 rounded-xl p-6 mb-6">
                <p className="text-xl mb-2">You got {correctCount}/10 correct</p>
                <p className="text-2xl font-bold text-yellow-400">Try again next week for another chance!</p>
              </div>
            </>
          )}
          
          <p className="text-lg text-gray-400 mb-2">Redirecting to leaderboard in {redirectTimer} seconds...</p>
          <div className="flex justify-center">
            <div className="w-32 bg-slate-700 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(5 - redirectTimer) * 20}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
