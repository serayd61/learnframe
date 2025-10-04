'use client';

import { QuizCard } from '@/components/QuizCard';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

// Örnek quiz data (gerçekte contract'tan gelecek)
const sampleQuizzes = [
  {
    quizId: 1,
    question: "What is the native token of Base blockchain?",
    options: ["ETH", "BASE", "MATIC", "BNB"],
    reward: 10,
    category: "Blockchain",
    difficulty: 2
  },
  {
    quizId: 2,
    question: "What company created Base?",
    options: ["Binance", "Coinbase", "Ethereum Foundation", "OpenSea"],
    reward: 15,
    category: "Crypto",
    difficulty: 1
  }
];

export default function QuizPage() {
  const { isConnected } = useAccount();

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
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {sampleQuizzes.map((quiz) => (
              <QuizCard key={quiz.quizId} {...quiz} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
