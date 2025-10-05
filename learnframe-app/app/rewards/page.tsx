'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

export default function RewardsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
      
      <div className="relative z-10">
        <nav className="border-b border-white/10 backdrop-blur-lg bg-black/20 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                🎓 LearnFrame
              </Link>
              <div className="flex gap-6">
                <Link href="/quiz" className="text-gray-300 hover:text-white transition">Quiz</Link>
                <Link href="/leaderboard" className="text-gray-300 hover:text-white transition">Leaderboard</Link>
                <Link href="/rewards" className="text-white">Rewards</Link>
              </div>
            </div>
            <ConnectButton />
          </div>
        </nav>

        <div className="container mx-auto p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-5xl font-bold text-center mb-12 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              🎁 Rewards System
            </h1>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10">
                <h2 className="text-3xl font-bold mb-6 text-green-400">Current Rewards</h2>
                <div className="space-y-4">
                  <div className="bg-black/30 rounded-lg p-4">
                    <h3 className="text-xl font-bold mb-2">Perfect Quiz Score</h3>
                    <p className="text-3xl font-bold text-green-400">100 LEARN</p>
                    <p className="text-gray-400 mt-2">Answer all 10 questions correctly</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4">
                    <h3 className="text-xl font-bold mb-2">Daily Limit</h3>
                    <p className="text-2xl font-bold text-yellow-400">1 Quiz/Day</p>
                    <p className="text-gray-400 mt-2">Resets every 24 hours</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10">
                <h2 className="text-3xl font-bold mb-6 text-purple-400">Token Info</h2>
                <div className="space-y-4">
                  <div className="bg-black/30 rounded-lg p-4">
                    <h3 className="text-xl font-bold mb-2">Total Supply</h3>
                    <p className="text-2xl font-bold">100M LEARN</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4">
                    <h3 className="text-xl font-bold mb-2">Network</h3>
                    <p className="text-2xl font-bold">Base Sepolia</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4">
                    <h3 className="text-xl font-bold mb-2">Contract</h3>
                    <p className="text-xs font-mono break-all">0xcc2768B27B389aE8999fBF93478E8BBa8485c461</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur rounded-2xl p-8 border border-purple-500/30">
              <h2 className="text-3xl font-bold mb-6">🚀 Coming Soon</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-2">Staking Rewards</h3>
                  <p className="text-gray-400">Stake LEARN to earn passive income</p>
                </div>
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-2">NFT Achievements</h3>
                  <p className="text-gray-400">Unlock special NFTs for milestones</p>
                </div>
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-2">Referral Program</h3>
                  <p className="text-gray-400">Earn bonuses for inviting friends</p>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link 
                href="/quiz"
                className="inline-block px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl font-bold text-lg transform hover:scale-105 transition"
              >
                Start Earning Now →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
