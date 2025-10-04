'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import QuizManagerABI from '@/lib/contracts/QuizManagerV2.json';

const QUIZ_DATA = [
  { id: 1, question: "What is the native token of Base?", answer: "ETH", reward: 10 },
  { id: 2, question: "Which company developed Base?", answer: "Coinbase", reward: 10 },
  { id: 3, question: "What is Base built on?", answer: "Optimism", reward: 15 },
  { id: 4, question: "Is Base EVM compatible?", answer: "Yes", reward: 10 },
  { id: 5, question: "What is the consensus mechanism?", answer: "Proof of Stake", reward: 20 }
];

export function Quiz() {
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    try {
      writeContract({
        address: process.env.NEXT_PUBLIC_QUIZ_MANAGER as `0x${string}`,
        abi: QuizManagerABI.abi,
        functionName: 'submitAnswer',
        args: [BigInt(currentQuiz + 1), userAnswer],
      });

      setFeedback('Submitting answer...');
    } catch (error) {
      console.error('Error:', error);
      setFeedback('Error submitting answer');
    }
  };

  if (isSuccess) {
    setFeedback(`✅ Answer submitted! You might have earned ${QUIZ_DATA[currentQuiz].reward} LEARN!`);
  }

  const quiz = QUIZ_DATA[currentQuiz];

  return (
    <div className="bg-slate-800 p-6 rounded-lg max-w-2xl mx-auto">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-slate-400">Question {currentQuiz + 1} of {QUIZ_DATA.length}</span>
          <span className="text-sm text-green-400">{quiz.reward} LEARN</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuiz + 1) / QUIZ_DATA.length) * 100}%` }}
          />
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4">{quiz.question}</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Your answer..."
          className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={isLoading || !userAnswer.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 px-4 py-2 rounded-lg font-bold"
        >
          {isLoading ? 'Submitting...' : 'Submit Answer'}
        </button>
      </form>

      {feedback && (
        <div className={`mt-4 p-3 rounded-lg ${isSuccess ? 'bg-green-900' : 'bg-blue-900'}`}>
          {feedback}
        </div>
      )}

      {currentQuiz < QUIZ_DATA.length - 1 && isSuccess && (
        <button
          onClick={() => {
            setCurrentQuiz(currentQuiz + 1);
            setUserAnswer('');
            setFeedback(null);
          }}
          className="w-full mt-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-bold"
        >
          Next Question →
        </button>
      )}
    </div>
  );
}
