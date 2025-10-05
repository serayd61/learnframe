'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useAccount, useReadContract } from 'wagmi';
import { useState, useEffect } from 'react';

const TOKEN_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export default function Home() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  const { data: tokenBalance } = useReadContract({
    address: '0xcc2768B27B389aE8999fBF93478E8BBa8485c461' as `0x${string}`,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const balance = tokenBalance ? (Number(tokenBalance) / 10**18).toFixed(2) : '0.00';

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 backdrop-blur-lg bg-black/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                🎓 LearnFrame
              </h1>
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/quiz" className="text-gray-300 hover:text-white transition">
                  Quiz
                </Link>
                <Link href="/leaderboard" className="text-gray-300 hover:text-white transition">
                  Leaderboard
                </Link>
                <Link href="/rewards" className="text-gray-300 hover:text-white transition">
                  Rewards
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isConnected && (
                <div className="bg-green-500/20 backdrop-blur px-4 py-2 rounded-lg border border-green-500/30">
                  <span className="text-sm text-gray-300">Balance:</span>
                  <span className="ml-2 font-bold text-green-400">{balance} LEARN</span>
                </div>
              )}
              <ConnectButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center mb-20">
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Learn & Earn
            </span>
          </h1>
          <p className="text-2xl text-gray-300 mb-8">
            Test your blockchain knowledge and earn LEARN tokens
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/quiz"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-bold text-lg transform hover:scale-105 transition shadow-xl"
            >
              Start Quiz →
            </Link>
            <Link
              href="/leaderboard"
              className="px-8 py-4 bg-white/10 backdrop-blur hover:bg-white/20 rounded-xl font-bold text-lg transform hover:scale-105 transition border border-white/20"
            >
              View Leaderboard
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          <div className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold mb-2">Interactive Quizzes</h3>
            <p className="text-gray-400">10 questions about Base blockchain</p>
          </div>
          <div className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-2xl font-bold mb-2">Earn Rewards</h3>
            <p className="text-gray-400">100 LEARN tokens per perfect quiz</p>
          </div>
          <div className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold mb-2">Compete</h3>
            <p className="text-gray-400">Climb the global leaderboard</p>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur rounded-3xl p-12 border border-purple-500/30">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h4 className="font-bold mb-2">Connect Wallet</h4>
              <p className="text-sm text-gray-400">Connect your Base wallet</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h4 className="font-bold mb-2">Take Quiz</h4>
              <p className="text-sm text-gray-400">Answer 10 questions</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h4 className="font-bold mb-2">Earn Tokens</h4>
              <p className="text-sm text-gray-400">Get 100 LEARN for perfect score</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                4
              </div>
              <h4 className="font-bold mb-2">Rank Up</h4>
              <p className="text-sm text-gray-400">Climb the leaderboard</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <h2 className="text-4xl font-bold mb-6">Ready to Test Your Knowledge?</h2>
          <p className="text-xl text-gray-400 mb-8">Join thousands earning while learning</p>
          <Link
            href="/quiz"
            className="inline-block px-12 py-5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl font-bold text-xl transform hover:scale-105 transition shadow-xl"
          >
            Start Earning Now →
          </Link>
        </div>
      </div>
    </main>
  );
}
