'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
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
  const [quizStarted, setQuizStarted] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { writeContract: startSession, data: startHash } = useWriteContract();
  const { isLoading: isStarting, isSuccess: isStarted } = useWaitForTransactionReceipt({ hash: startHash });
  
  const { writeContract: submitAnswers, data: submitHash } = useWriteContract();
  const { isLoading: isSubmitting, isSuccess: isSubmitted } = useWaitForTransactionReceipt({ hash: submitHash });

  useEffect(() => {
    if (isStarted && !sessionStarted) {
      setSessionStarted(true);
      setQuizStarted(true);
      setError('');
    }
  }, [isStarted, sessionStarted]);

  useEffect(() => {
    if (isSubmitted && quizCompleted && !showSuccess) {
      setShowSuccess(true);
      const correctCount = checkAnswers();
      
      // Show success message for 3 seconds then redirect
      setTimeout(() => {
        if (correctCount === 10) {
          // If all correct, go to leaderboard
          router.push('/leaderboard');
        } else {
          // If not all correct, go to home
          router.push('/');
        }
      }, 3000);
    }
  }, [isSubmitted, quizCompleted, showSuccess, router]);

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
      console.error('Error starting quiz:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start quiz session';
      setError(errorMessage);
    }
  };

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < 9) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitAll = async () => {
    if (answers.some(a => !a.trim())) {
      alert('Please answer all questions before submitting!');
      return;
    }

    try {
      setError('');
      const contractAddress = process.env.NEXT_PUBLIC_BATCH_QUIZ || '0x749cdd9355254782828eDae7D85212A2e408D14c';

      await submitAnswers({
        address: contractAddress as `0x${string}`,
        abi: BATCH_QUIZ_ABI,
        functionName: 'submitBatchAnswers',
        args: [answers],
      });
      setQuizCompleted(true);
    } catch (error: unknown) {
      console.error('Error submitting answers:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit answers';
      setError(errorMessage);
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

  // Success Screen
  if (showSuccess) {
    const correctCount = checkAnswers();
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl max-w-4xl mx-auto">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">
            {correctCount === 10 ? '🎉 Perfect Score!' : '📊 Quiz Completed'}
          </h2>
          <p className="text-2xl mb-6">
            You got {correctCount}/10 correct
          </p>
          {correctCount === 10 ? (
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-6">
              <p className="text-xl font-bold">Congratulations! You earned 100 LEARN tokens!</p>
              <p className="text-lg mt-2">Redirecting to leaderboard...</p>
            </div>
          ) : (
            <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 mb-6">
              <p className="text-xl">You need all 10 correct to earn tokens.</p>
              <p className="text-lg mt-2">Redirecting to homepage...</p>
            </div>
          )}
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    );
  }

  // Waiting for TX confirmation
  if (isSubmitting && quizCompleted) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl max-w-4xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Processing Transaction...</h2>
          <p className="text-xl mb-6">Please wait while we verify your answers</p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  // Start Screen
  if (!quizStarted) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">Base Blockchain Quiz Challenge</h2>
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-6 mb-6">
          <h3 className="text-2xl font-bold mb-4 text-center text-yellow-400">
            Win 100 LEARN Tokens!
          </h3>
          <div className="space-y-3">
            <p className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>10 questions about Base blockchain</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Get ALL 10 correct to win 100 LEARN tokens</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Only 1 transaction at the end</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>30 minutes time limit</span>
            </p>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
            <p className="text-red-300">{error}</p>
          </div>
        )}
        
        <button
          onClick={handleStartQuiz}
          disabled={isStarting}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 rounded-xl font-bold text-lg transform hover:scale-105 transition"
        >
          {isStarting ? 'Starting Session...' : 'Start Quiz Session →'}
        </button>
      </div>
    );
  }

  const question = QUIZ_QUESTIONS[currentQuestion];

  // Quiz Screen
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Question {currentQuestion + 1} of 10</span>
          <span>{answers.filter(a => a).length}/10 Answered</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / 10) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-4">{question.question}</h3>
        <input
          type="text"
          value={answers[currentQuestion]}
          onChange={(e) => handleAnswerChange(e.target.value)}
          placeholder="Type your answer..."
          className="w-full px-4 py-3 bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
        />
        <p className="text-sm text-gray-400 mt-2">Hint: {question.hint}</p>
      </div>

      {/* Answer Status Grid */}
      <div className="grid grid-cols-10 gap-2 mb-6">
        {answers.map((answer, i) => (
          <button
            key={i}
            onClick={() => setCurrentQuestion(i)}
            className={`py-2 rounded-lg text-sm font-bold transition ${
              i === currentQuestion ? 'bg-blue-600' :
              answer ? 'bg-green-600/50' : 'bg-slate-700'
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

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg font-bold"
        >
          ← Previous
        </button>

        {currentQuestion === 9 ? (
          <button
            onClick={handleSubmitAll}
            disabled={isSubmitting || answers.some(a => !a.trim())}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 rounded-lg font-bold text-lg"
          >
            {isSubmitting ? 'Submitting...' : 'Submit All Answers'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
