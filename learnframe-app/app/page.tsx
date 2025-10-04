'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { TokenBalance } from '@/components/TokenBalance';
import { Leaderboard } from '@/components/Leaderboard';
import { WeeklyChallenge } from '@/components/WeeklyChallenge';
import { StatsCard } from '@/components/StatsCard';
import SDKReady from '@/components/SDKReady';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <>
      <SDKReady />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-gradient-xy"></div>
        
        <div className="relative z-10">
          <nav className="border-b border-white/10 backdrop-blur-lg bg-black/20">
            <div className="container mx-auto px-4 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-8">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                    🎓 LearnFrame
                  </h1>
                  <div className="hidden md:flex gap-6">
                    <Link href="/quiz" className="hover:text-blue-400 transition">Quiz</Link>
                    <Link href="/leaderboard" className="hover:text-purple-400 transition">Leaderboard</Link>
                    <Link href="/rewards" className="hover:text-pink-400 transition">Rewards</Link>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {isConnected && <TokenBalance />}
                  <ConnectButton />
                </div>
              </div>
            </div>
          </nav>

          <div className="container mx-auto px-4 py-12">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h2 className="text-5xl md:text-7xl font-bold text-white mb-4">
                Learn. <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Earn.</span> Grow.
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Master blockchain knowledge through interactive quizzes and earn LEARN tokens on Base
              </p>
            </div>

            {/* Special Quiz Promotion */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-1 rounded-2xl">
                <div className="bg-slate-900 rounded-2xl p-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                      <h3 className="text-3xl font-bold mb-2 text-white">
                        🎯 Perfect Score Challenge!
                      </h3>
                      <p className="text-xl text-gray-300 mb-2">
                        Answer all 10 questions correctly about Base blockchain
                      </p>
                      <div className="flex items-center gap-4 justify-center md:justify-start">
                        <span className="text-4xl font-bold text-yellow-400">100 LEARN</span>
                        <span className="text-gray-400">tokens reward!</span>
                      </div>
                    </div>
                    {isConnected ? (
                      <Link 
                        href="/quiz"
                        className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl font-bold text-lg hover:scale-105 transition transform text-black"
                      >
                        Take Quiz Now →
                      </Link>
                    ) : (
                      <button className="px-8 py-4 bg-gray-600 rounded-xl font-bold text-lg opacity-50 cursor-not-allowed">
                        Connect Wallet First
                      </button>
                    )}
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="text-sm text-gray-400">Questions</div>
                      <div className="text-xl font-bold">10</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="text-sm text-gray-400">Time Limit</div>
                      <div className="text-xl font-bold">30 min</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="text-sm text-gray-400">Required</div>
                      <div className="text-xl font-bold">100%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
              <StatsCard 
                icon="👥"
                value="2,456"
                label="Active Learners"
                trend="+12%"
                color="blue"
              />
              <StatsCard 
                icon="📝"
                value="45.2K"
                label="Quizzes Completed"
                trend="+28%"
                color="purple"
              />
              <StatsCard 
                icon="🪙"
                value="5.8M"
                label="LEARN Distributed"
                trend="+45%"
                color="green"
              />
              <StatsCard 
                icon="🔥"
                value="89%"
                label="Success Rate"
                trend="+5%"
                color="orange"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <WeeklyChallenge />
                
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-3xl">🎯</span> Featured Quizzes
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      'DeFi Basics',
                      'Layer 2 Solutions', 
                      'Smart Contracts 101',
                      'NFT Fundamentals'
                    ].map((topic, i) => (
                      <div key={i} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold">{topic}</h4>
                          <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                            {10 * (i + 1)} LEARN
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">10 questions • 5 min</p>
                        <div className="flex items-center justify-between">
                          <div className="flex -space-x-2">
                            {[...Array(3)].map((_, j) => (
                              <div key={j} className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full border-2 border-slate-800"></div>
                            ))}
                            <span className="text-xs text-gray-400 ml-3">+423</span>
                          </div>
                          <button className="text-sm text-blue-400 hover:text-blue-300">
                            Play →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Leaderboard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
