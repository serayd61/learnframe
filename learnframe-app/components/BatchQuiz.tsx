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

// YENİ ÇALIŞAN CONTRACT ADRESİ - HARDCODED!
const QUIZ_CONTRACT = '0xaC7A53955c5620389F880e5453e2d1c066d1A0b9';

export function BatchQuiz() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(10).fill(''));
  const [quizPhase, setQuizPhase] = useState<'welcome' | 'starting' | 'quiz' | 'submitting' | 'done'>('welcome');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(5);
  
  const { writeContract: startSession, data: startHash } = useWriteContract();
  const { isSuccess: startSuccess } = useWaitForTransactionReceipt({ hash: startHash });
  
  const { writeContract: submitAnswers, data: submitHash } = useWriteContract();
  const { isSuccess: submitSuccess } = useWaitForTransactionReceipt({ hash: submitHash });

  useEffect(() => {
    console.log('Using Quiz Contract:', QUIZ_CONTRACT);
    console.log('Phase:', quizPhase);
    console.log('Start Success:', startSuccess);
    console.log('Submit Success:', submitSuccess);
  }, [quizPhase, startSuccess, submitSuccess]);

  useEffect(() => {
    if (startSuccess && quizPhase === 'starting') {
      setQuizPhase('quiz');
      setError('');
    }
  }, [startSuccess, quizPhase]);

  useEffect(() => {
    if (submitSuccess && quizPhase === 'submitting') {
      setQuizPhase('done');
    }
  }, [submitSuccess, quizPhase]);

  useEffect(() => {
    if (quizPhase === 'done') {
      const timer = setInterval(() => {
        setCountdown(prev => {
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
  }, [quizPhase, router]);

  const handleStartQuiz = async () => {
    try {
      setError('');
      setQuizPhase('starting');
      
      await startSession({
        address: QUIZ_CONTRACT as `0x${string}`,
        abi: BATCH_QUIZ_ABI,
        functionName: 'startQuizSession',
      });
    } catch (err) {
      console.error('Start error:', err);
      setError('Failed to start. Please try again.');
      setQuizPhase('welcome');
    }
  };

  const handleSubmitAll = async () => {
    if (answers.some(a => !a.trim())) {
      alert('Please answer all questions!');
      return;
    }

    try {
      setError('');
      setQuizPhase('submitting');
      
      await submitAnswers({
        address: QUIZ_CONTRACT as `0x${string}`,
        abi: BATCH_QUIZ_ABI,
        functionName: 'submitBatchAnswers',
        args: [answers],
      });
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to submit. Please try again.');
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

  if (quizPhase === 'welcome') {
    return (
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl max-w-4xl mx-auto border border-white/20">
        <h2 className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          Base Blockchain Quiz
        </h2>
        <div className="bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-2 border-yellow-500/50 rounded-xl p-8 mb-6">
          <h3 className="text-3xl font-bold mb-4 text-center text-yellow-300">
            🏆 Win 100 LEARN Tokens!
          </h3>
          <p className="text-center text-xl text-white">Answer all 10 questions correctly to win</p>
        </div>
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-4">
            <p className="text-red-300">{error}</p>
          </div>
        )}
        <button
          onClick={handleStartQuiz}
          className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl font-bold text-xl text-white shadow-lg transform hover:scale-105 transition"
        >
          Start Quiz →
        </button>
      </div>
    );
  }

  if (quizPhase === 'starting') {
    return (
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl max-w-4xl mx-auto border border-white/20">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-400 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-3xl font-bold mb-2 text-white">Starting Quiz Session...</h2>
          <p className="text-gray-300">Please confirm in MetaMask</p>
          {startHash && (
            <div className="mt-4 text-sm">
              <p className="text-gray-400">Transaction: {startHash.slice(0,10)}...{startHash.slice(-8)}</p>
              <p className="text-yellow-400 mt-2">Waiting for confirmation...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (quizPhase === 'quiz') {
    const question = QUIZ_QUESTIONS[currentQuestion];
    
    return (
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl max-w-4xl mx-auto border border-white/20">
        <div className="mb-6">
          <div className="flex justify-between text-lg mb-3 text-white">
            <span className="font-bold">Question {currentQuestion + 1}/10</span>
            <span className="text-gray-300">{answers.filter(a => a).length} answered</span>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-400 to-purple-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / 10) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6 mb-8">
          <h3 className="text-2xl font-bold mb-4 text-white">{question.question}</h3>
          <input
            type="text"
            value={answers[currentQuestion]}
            onChange={(e) => {
              const newAnswers = [...answers];
              newAnswers[currentQuestion] = e.target.value;
              setAnswers(newAnswers);
            }}
            placeholder="Type your answer here..."
            className="w-full px-5 py-4 bg-white/90 text-gray-900 rounded-lg text-lg font-medium placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <p className="text-sm text-gray-300 mt-3">💡 Hint: {question.hint}</p>
        </div>

        <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-8">
          {answers.map((answer, i) => (
            <button
              key={i}
              onClick={() => setCurrentQuestion(i)}
              className={`py-3 rounded-lg text-sm font-bold transition-all transform hover:scale-105 ${
                i === currentQuestion ? 'bg-purple-500 text-white shadow-lg' :
                answer ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        <div className="flex justify-between gap-4">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:hover:bg-gray-600 rounded-lg font-bold text-white transition"
          >
            ← Previous
          </button>

          {currentQuestion === 9 ? (
            <button
              onClick={handleSubmitAll}
              className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg font-bold text-xl text-white shadow-lg transform hover:scale-105 transition"
            >
              Submit All Answers ✓
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(Math.min(9, currentQuestion + 1))}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-bold text-white transition"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    );
  }

  if (quizPhase === 'submitting') {
    return (
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl max-w-4xl mx-auto border border-white/20">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-400 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-3xl font-bold mb-2 text-white">Submitting Your Answers...</h2>
          <p className="text-gray-300">Verifying your score on blockchain</p>
          {submitHash && (
            <div className="mt-4 text-sm">
              <p className="text-gray-400">Transaction: {submitHash.slice(0,10)}...{submitHash.slice(-8)}</p>
              <p className="text-yellow-400 mt-2">Processing your rewards...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (quizPhase === 'done') {
    const correctCount = checkAnswers();
    const isPerfect = correctCount === 10;
    
    return (
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl max-w-4xl mx-auto border border-white/20">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">{isPerfect ? '🎉' : '😔'}</div>
          <h2 className="text-4xl font-bold mb-4 text-white">
            {isPerfect ? 'Congratulations!' : 'Quiz Completed'}
          </h2>
          <p className="text-2xl mb-6 text-gray-200">You got {correctCount}/10 correct</p>
          
          {isPerfect ? (
            <div className="bg-green-500/30 border-2 border-green-400 rounded-xl p-6 mb-6">
              <p className="text-2xl font-bold text-green-300">You earned 100 LEARN tokens!</p>
              <p className="text-lg mt-2 text-green-200">Transaction confirmed on Base Sepolia</p>
            </div>
          ) : (
            <div className="bg-yellow-500/30 border-2 border-yellow-400 rounded-xl p-6 mb-6">
              <p className="text-xl text-yellow-300">Try again tomorrow for another chance!</p>
              <p className="text-lg mt-2 text-yellow-200">You need all 10 correct to earn tokens</p>
            </div>
          )}
          
          <p className="text-gray-300 text-lg">Redirecting to leaderboard in {countdown} seconds...</p>
        </div>
      </div>
    );
  }

  return null;
}
