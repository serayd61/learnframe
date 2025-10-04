'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import QuizManagerABI from '@/lib/contracts/QuizManager.json';

interface QuizCardProps {
  quizId: number;
  question: string;
  options: string[];
  reward: number;
  category: string;
  difficulty: number;
}

export function QuizCard({ quizId, question, options, reward, category, difficulty }: QuizCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [error, setError] = useState('');
  
  const { writeContract, data: hash, error: writeError } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (writeError) {
      setError(writeError.message);
    }
  }, [writeError]);

  const handleSubmit = async () => {
    if (!selectedAnswer) return;
    
    setError('');
    try {
      writeContract({
        address: process.env.NEXT_PUBLIC_QUIZ_MANAGER as `0x${string}`,
        abi: QuizManagerABI.abi,
        functionName: 'submitAnswer',
        args: [BigInt(quizId), selectedAnswer],
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      setError(errorMessage);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex gap-2 mb-4">
        <span className="bg-blue-600 px-2 py-1 rounded text-sm">{category}</span>
        <span className="bg-green-600 px-2 py-1 rounded text-sm">⭐ {difficulty}/5</span>
        <span className="bg-yellow-600 px-2 py-1 rounded text-sm">🪙 {reward} LEARN</span>
      </div>
      
      <h3 className="text-xl font-bold mb-4">{question}</h3>
      
      <div className="space-y-2 mb-4">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => setSelectedAnswer(option)}
            disabled={isConfirming}
            className={`w-full text-left p-3 rounded transition-colors ${
              selectedAnswer === option 
                ? 'bg-blue-600' 
                : 'bg-slate-700 hover:bg-slate-600'
            } disabled:opacity-50`}
          >
            {String.fromCharCode(65 + index)}) {option}
          </button>
        ))}
      </div>
      
      <button
        onClick={handleSubmit}
        disabled={!selectedAnswer || isConfirming}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-3 rounded font-bold disabled:opacity-50 transition-opacity"
      >
        {isConfirming ? 'Confirming...' : 'Submit Answer'}
      </button>
      
      {isSuccess && (
        <div className="mt-4 p-3 bg-green-600/20 border border-green-600 rounded">
          ✅ Answer submitted successfully! +{reward} LEARN earned!
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-600/20 border border-red-600 rounded text-sm">
          ❌ Error: {error}
        </div>
      )}
    </div>
  );
}
