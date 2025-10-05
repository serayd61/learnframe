'use client';

import { useState, useEffect } from 'react';
import { useReadContract, useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

interface User {
  address: string;
  score: number;
  rank: number;
}

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

const TOKEN_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export default function LeaderboardPage() {
  const { address } = useAccount();
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [myScore, setMyScore] = useState<number>(0);

  // Get leaderboard data
  const { data: leaderboardData, refetch: refetchLeaderboard } = useReadContract({
    address: '0xEfb23c57042C21271ff19e1FB5CfFD1A49bD5f61' as `0x${string}`,
    abi: LEADERBOARD_ABI,
    functionName: 'getTopUsers',
    args: [BigInt(100)],
  });

  // Get my token balance
  const { data: tokenBalance, refetch: refetchBalance } = useReadContract({
    address: '0x1Cd95030e189e54755C1ccA28e24891250A79d50' as `0x${string}`,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  useEffect(() => {
    if (leaderboardData) {
      const [addresses, scores] = leaderboardData as [string[], bigint[]];
      const users: User[] = [];
      
      for (let i = 0; i < addresses.length; i++) {
        if (addresses[i] !== '0x0000000000000000000000000000000000000000') {
          const score = Number(scores[i]);
          users.push({
            address: addresses[i],
            score: score,
            rank: users.length + 1
          });
          
          // Check if this is the current user
          if (address && addresses[i].toLowerCase() === address.toLowerCase()) {
            setMyRank(users.length);
            setMyScore(score);
          }
        }
      }
      
      setTopUsers(users);
    }
  }, [leaderboardData, address]);

  useEffect(() => {
    if (tokenBalance) {
      const balance = Number(tokenBalance) / 10**18;
      console.log('My token balance:', balance);
    }
  }, [tokenBalance]);

  // Auto refresh
  useEffect(() => {
    const interval = setInterval(() => {
      refetchLeaderboard();
      refetchBalance();
    }, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, [refetchLeaderboard, refetchBalance]);

  const myTokenBalance = tokenBalance ? (Number(tokenBalance) / 10**18).toFixed(2) : '0.00';

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

            {/* My Stats */}
            {address && (
              <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur rounded-2xl p-6 mb-8 border border-purple-500/30">
                <h3 className="text-2xl font-bold mb-4">📊 Your Stats</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-gray-400 mb-1">Your Balance</p>
                    <p className="text-3xl font-bold text-green-400">{myTokenBalance} LEARN</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-gray-400 mb-1">Your Rank</p>
                    <p className="text-3xl font-bold text-yellow-400">
                      {myRank ? `#${myRank}` : 'Not ranked'}
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-gray-400 mb-1">Your Score</p>
                    <p className="text-3xl font-bold text-purple-400">{myScore}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-400">
                  Wallet: {address.slice(0, 6)}...{address.slice(-4)}
                </div>
              </div>
            )}

            {/* Global Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
                <h3 className="text-lg text-gray-400 mb-2">Total Participants</h3>
                <p className="text-3xl font-bold">{topUsers.length}</p>
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
                      topUsers.map((user, index) => {
                        const isMyAddress = address && user.address.toLowerCase() === address.toLowerCase();
                        return (
                          <tr 
                            key={index} 
                            className={`border-t border-white/10 transition ${
                              isMyAddress ? 'bg-purple-600/20' : 'hover:bg-white/5'
                            }`}
                          >
                            <td className="px-6 py-4">
                              <span className="text-2xl font-bold">
                                {user.rank === 1 ? '🥇' :
                                 user.rank === 2 ? '🥈' :
                                 user.rank === 3 ? '🥉' :
                                 `#${user.rank}`}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="font-mono text-sm">
                                  {user.address.slice(0, 8)}...{user.address.slice(-6)}
                                </div>
                                {isMyAddress && (
                                  <span className="bg-purple-500/50 px-2 py-1 rounded text-xs">You</span>
                                )}
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
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                          <p className="text-xl mb-2">No data yet!</p>
                          <p>Complete the quiz to be the first on the leaderboard!</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Debug Info */}
            {address && (
              <div className="mt-8 p-4 bg-black/30 rounded-lg text-xs text-gray-400">
                <p>Debug Info:</p>
                <p>Your Address: {address}</p>
                <p>Token Balance: {myTokenBalance} LEARN</p>
                <p>Leaderboard Score: {myScore}</p>
                <p>Total Users in Leaderboard: {topUsers.length}</p>
              </div>
            )}

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
