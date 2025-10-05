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

const QUIZ_ADDRESS = '0xaC7A53955c5620389F880e5453e2d1c066d1A0b9';

export function BatchQuiz() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(10).fill(''));
  const [quizState, setQuizState] = useState<'welcome' | 'starting' | 'quiz' | 'submitting' | 'complete'>('welcome');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  const { writeContract: startSession, data: startHash, isPending: isStarting } = useWriteContract();
  const { isLoading: isStartConfirming, isSuccess: isStarted } = useWaitForTransactionReceipt({ 
    hash: startHash,
  });
  
  const { writeContract: submitAnswers, data: submitHash, isPending: isSubmitting } = useWriteContract();
  const { isLoading: isSubmitConfirming, isSuccess: isSubmitted } = useWaitForTransactionReceipt({ 
    hash: submitHash,
  });

  // Handle session start
  useEffect(() => {
    if (isStarted && quizState === 'starting') {
      console.log('Session started successfully');
      setQuizState('quiz');
      setError('');
    }
  }, [isStarted, quizState]);

  // Handle submit success  
  useEffect(() => {
    if (isSubmitted && quizState === 'submitting') {
      console.log('Quiz submitted successfully');
      setQuizState('complete');
      setCountdown(5);
    }
  }, [isSubmitted, quizState]);

  // Countdown and redirect
  useEffect(() => {
    if (quizState === 'complete' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (quizState === 'complete' && countdown === 0) {
      router.push('/leaderboard');
    }
  }, [quizState, countdown, router]);

  const handleStartQuiz = async () => {
    setError('');
    setQuizState('starting');
    
    try {
      await startSession({
        address: QUIZ_ADDRESS as `0x${string}`,
        abi: BATCH_QUIZ_ABI,
        functionName: 'startQuizSession',
      });
    } catch (err) {
      console.error('Start error:', err);
      setError('Failed to start session. Try again.');
      setQuizState('welcome');
    }
  };

  const handleSubmitAll = async () => {
    if (answers.some(a => !a.trim())) {
      alert('Please answer all questions!');
      return;
    }

    setError('');
    setQuizState('submitting');
    
    try {
      await submitAnswers({
        address: QUIZ_ADDRESS as `0x${string}`,
        abi: BATCH_QUIZ_ABI,
        functionName: 'submitBatchAnswers',
        args: [answers],
      });
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to submit. Try again.');
      setQuizState('quiz');
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
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl max-w-4xl mx-auto border border-white/20">
        <h2 className="text-4xl font-bold mb-6 text-center">Base Blockchain Quiz</h2>
        <div className="bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-2 border-yellow-500/50 rounded-xl p-8 mb-6">
          <h3 className="text-3xl font-bold mb-4 text-center text-yellow-300">
            🏆 Win 100 LEARN Tokens!
          </h3>
          <p className="text-center text-xl">Answer all 10 questions correctly to win</p>
        </div>
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-4">
            <p>{error}</p>
          </div>
        )}
        <button
          onClick={handleStartQuiz}
          disabled={isStarting}
          className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-bold text-xl disabled:opacity-50"
        >
          {isStarting ? 'Starting...' : 'Start Quiz →'}
        </button>
      </div>
    );
  }

  // STARTING SCREEN
  if (quizState === 'starting') {
    return (
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-400 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-3xl font-bold mb-2">Starting Quiz Session...</h2>
          <p className="text-gray-300">Confirm transaction in MetaMask</p>
          {startHash && (
            <div className="mt-4 text-sm">
              <p>Transaction: {startHash.slice(0,10)}...{startHash.slice(-8)}</p>
              <p className="text-yellow-400 mt-2">Waiting for confirmation...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // QUIZ SCREEN
  if (quizState === 'quiz') {
    const question = QUIZ_QUESTIONS[currentQuestion];
    
    return (
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between text-lg mb-3">
            <span>Question {currentQuestion + 1}/10</span>
            <span>{answers.filter(a => a).length} answered</span>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-4">
            <div 
              className="bg-gradient-to-r from-blue-400 to-purple-500 h-4 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / 10) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6 mb-8">
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
            className="w-full px-5 py-4 bg-white/90 text-gray-900 rounded-lg text-lg"
          />
          <p className="text-sm text-gray-300 mt-3">💡 Hint: {question.hint}</p>
        </div>

        <div className="grid grid-cols-10 gap-2 mb-8">
          {answers.map((answer, i) => (
            <button
              key={i}
              onClick={() => setCurrentQuestion(i)}
              className={`py-3 rounded-lg text-sm font-bold ${
                i === currentQuestion ? 'bg-purple-500' :
                answer ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
            <p>{error}</p>
          </div>
        )}

        <div className="flex justify-between gap-4">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 rounded-lg font-bold"
          >
            ← Previous
          </button>

          {currentQuestion === 9 ? (
            <button
              onClick={handleSubmitAll}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-bold text-xl disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit All Answers ✓'}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(Math.min(9, currentQuestion + 1))}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-bold"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    );
  }

  // SUBMITTING SCREEN
  if (quizState === 'submitting') {
    return (
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-400 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-3xl font-bold mb-2">Submitting Your Answers...</h2>
          <p className="text-gray-300">Verifying your score on blockchain</p>
          {submitHash && (
            <div className="mt-4 text-sm">
              <p>Transaction: {submitHash.slice(0,10)}...{submitHash.slice(-8)}</p>
              <p className="text-yellow-400 mt-2">Waiting for confirmation...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // COMPLETE SCREEN
  if (quizState === 'complete') {
    const correctCount = checkAnswers();
    const isPerfect = correctCount === 10;
    
    return (
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl max-w-4xl mx-auto">
        <div className="text-center py-8">
          <h2 className="text-4xl font-bold mb-4">
            {isPerfect ? '🎉 Congratulations!' : '📊 Quiz Completed'}
          </h2>
          <p className="text-2xl mb-6">You got {correctCount}/10 correct</p>
          
          {isPerfect ? (
            <div className="bg-green-500/30 border-2 border-green-400 rounded-xl p-6">
              <p className="text-2xl font-bold">You earned 100 LEARN tokens!</p>
            </div>
          ) : (
            <div className="bg-yellow-500/30 border-2 border-yellow-400 rounded-xl p-6">
              <p className="text-xl">Try again tomorrow!</p>
            </div>
          )}
          
          <p className="text-gray-300 mt-6">Redirecting to leaderboard in {countdown} seconds...</p>
        </div>
      </div>
    );
  }

  return null;
}
