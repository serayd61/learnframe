'use client';

import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

const LEADERBOARD_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "count", "type": "uint256"}],
    "name": "getTopUsers",
    "outputs": [
      {"internalType": "address[]", "name": "", "type": "address[]"},
      {"internalType": "uint256[]", "name": "", "type": "uint256[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export default function LeaderboardPage() {
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [timeFilter, setTimeFilter] = useState<'all' | 'weekly'>('all');

  const { data: leaderboardData, refetch } = useReadContract({
    address: '0x62Ad46dA54b11358A73b3A009a56BDe154C38AF8' as `0x${string}`,
    abi: LEADERBOARD_ABI,
    functionName: 'getTopUsers',
    args: [BigInt(100)],
  });

  useEffect(() => {
    if (leaderboardData) {
      const [addresses, scores] = leaderboardData as [string[], bigint[]];
      const users = addresses.map((addr, i) => ({
        address: addr,
        score: Number(scores[i]),
        rank: i + 1
      })).filter(u => u.address !== '0x0000000000000000000000000000000000000000');
      setTopUsers(users);
    }
  }, [leaderboardData]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

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
                <Link href="/quiz" className="hover:text-blue-400 transition">Quiz</Link>
                <Link href="/leaderboard" className="text-blue-400">Leaderboard</Link>
              </div>
            </div>
            <ConnectButton />
          </div>
        </nav>

        <div className="container mx-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                🏆 Global Leaderboard
              </h1>
              <p className="text-xl text-gray-300">Top performers on LearnFrame</p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
                <h3 className="text-lg text-gray-400 mb-2">Total Participants</h3>
                <p className="text-3xl font-bold">{topUsers.length > 0 ? topUsers.length : '0'}</p>
              </div>
              <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
                <h3 className="text-lg text-gray-400 mb-2">Total LEARN Distributed</h3>
                <p className="text-3xl font-bold">
                  {topUsers.reduce((sum, user) => sum + user.score, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
                <h3 className="text-lg text-gray-400 mb-2">Average Score</h3>
                <p className="text-3xl font-bold">
                  {topUsers.length > 0 ? Math.round(topUsers.reduce((sum, user) => sum + user.score, 0) / topUsers.length) : '0'}
                </p>
              </div>
            </div>

            {/* Leaderboard Table */}
            <div className="bg-white/5 backdrop-blur rounded-2xl overflow-hidden border border-white/10">
              <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-6">
                <h2 className="text-2xl font-bold">Top Learners</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/20">
                    <tr>
                      <th className="px-6 py-4 text-left">Rank</th>
                      <th className="px-6 py-4 text-left">Address</th>
                      <th className="px-6 py-4 text-right">Score</th>
                      <th className="px-6 py-4 text-right">LEARN Earned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topUsers.length > 0 ? (
                      topUsers.map((user, index) => (
                        <tr key={index} className="border-t border-white/10 hover:bg-white/5 transition">
                          <td className="px-6 py-4">
                            <span className="text-2xl font-bold">
                              {user.rank === 1 ? '🥇' :
                               user.rank === 2 ? '🥈' :
                               user.rank === 3 ? '🥉' :
                               `#${user.rank}`}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-mono text-sm">
                              {user.address.slice(0, 8)}...{user.address.slice(-6)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-bold">
                            {user.score.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-green-400 font-bold">
                              {user.score.toLocaleString()} LEARN
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                          No participants yet. Be the first to complete a quiz!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Back to Quiz Button */}
            <div className="text-center mt-8">
              <Link 
                href="/quiz"
                className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-bold text-lg transform hover:scale-105 transition"
              >
                Take Another Quiz →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
