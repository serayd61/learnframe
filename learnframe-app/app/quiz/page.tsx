'use client';

import { QuizCard } from '@/components/QuizCard';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract } from 'wagmi';
import QuizManagerABI from '@/lib/contracts/QuizManager.json';
import { useState, useEffect } from 'react';

export default function QuizPage() {
  const { isConnected } = useAccount();
  const [quizzes, setQuizzes] = useState<any[]>([]);

  // Quiz verilerini manuel olarak tanımlayalım
  // Contract'tan sadece reward ve difficulty çekeceğiz
  const quizQuestions = [
    {
      quizId: 1,
      question: "What is the native token of Base blockchain?",
      options: ["ETH", "BASE", "MATIC", "BNB"],
      correctAnswer: "ETH"
    },
    {
      quizId: 2,
      question: "Which company created Base?",
      options: ["Binance", "Coinbase", "Ethereum Foundation", "OpenSea"],
      correctAnswer: "Coinbase"
    },
    {
      quizId: 3,
      question: "What programming language is used for smart contracts?",
      options: ["JavaScript", "Python", "Solidity", "Rust"],
      correctAnswer: "Solidity"
    },
    {
      quizId: 4,
      question: "What type of blockchain scaling solution is Base?",
      options: ["Layer 1", "Layer 2", "Sidechain", "Layer 3"],
      correctAnswer: "Layer 2"
    }
  ];

  // Her quiz için contract'tan bilgi çek
  const { data: quiz1 } = useReadContract({
    address: process.env.NEXT_PUBLIC_QUIZ_MANAGER as `0x${string}`,
    abi: QuizManagerABI.abi,
    functionName: 'quizzes',
    args: [1n],
  });

  const { data: quiz2 } = useReadContract({
    address: process.env.NEXT_PUBLIC_QUIZ_MANAGER as `0x${string}`,
    abi: QuizManagerABI.abi,
    functionName: 'quizzes',
    args: [2n],
  });

  const { data: quiz3 } = useReadContract({
    address: process.env.NEXT_PUBLIC_QUIZ_MANAGER as `0x${string}`,
    abi: QuizManagerABI.abi,
    functionName: 'quizzes',
    args: [3n],
  });

  const { data: quiz4 } = useReadContract({
    address: process.env.NEXT_PUBLIC_QUIZ_MANAGER as `0x${string}`,
    abi: QuizManagerABI.abi,
    functionName: 'quizzes',
    args: [4n],
  });

  useEffect(() => {
    const quizData = [quiz1, quiz2, quiz3, quiz4];
    const formattedQuizzes = quizQuestions.map((q, index) => {
      const contractData = quizData[index];
      if (!contractData) return null;
      
      return {
        ...q,
        reward: Number(contractData[2]),
        category: contractData[3],
        difficulty: Number(contractData[4]),
        active: contractData[6]
      };
    }).filter(q => q && q.active);
    
    setQuizzes(formattedQuizzes);
  }, [quiz1, quiz2, quiz3, quiz4]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <nav className="border-b border-slate-700 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🎓 LearnFrame Quiz</h1>
          <ConnectButton />
        </div>
      </nav>

      <div className="container mx-auto p-6">
        <h2 className="text-3xl font-bold mb-6">Available Quizzes</h2>
        
        {!isConnected ? (
          <p className="text-center text-slate-400 py-10">
            Please connect your wallet to participate
          </p>
        ) : quizzes.length === 0 ? (
          <p className="text-center text-slate-400 py-10">
            Loading quizzes...
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {quizzes.map((quiz) => (
              <QuizCard key={quiz.quizId} {...quiz} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
