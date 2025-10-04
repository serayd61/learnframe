'use client';

import { BatchQuiz } from '@/components/BatchQuiz';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export default function QuizPage() {
  const { isConnected } = useAccount();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
      
      <div className="relative z-10">
        <nav className="border-b border-white/10 backdrop-blur-lg bg-black/20 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">🎓 LearnFrame Quiz</h1>
            <ConnectButton />
          </div>
        </nav>

        <div className="container mx-auto p-6 mt-8">
          {isConnected ? (
            <BatchQuiz />
          ) : (
            <div className="text-center py-20">
              <h2 className="text-4xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-xl text-gray-300 mb-8">
                Connect your wallet to start the quiz
              </p>
              <ConnectButton />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
