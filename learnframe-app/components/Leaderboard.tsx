'use client';

import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import LeaderboardABI from '@/lib/contracts/Leaderboard.json';
import Link from 'next/link';

export function Leaderboard() {
  const [topUsers, setTopUsers] = useState<any[]>([]);

  const { data: leaderboardData } = useReadContract({
    address: process.env.NEXT_PUBLIC_LEADERBOARD as `0x${string}`,
    abi: LeaderboardABI.abi,
    functionName: 'getTopUsers',
    args: [BigInt(5)],
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

  const mockUsers = [
    { rank: 1, address: '0x742d...5c3f', score: 2840, change: 'up' },
    { rank: 2, address: '0x8f3a...9d2e', score: 2650, change: 'up' },
    { rank: 3, address: '0x3c9f...7a8b', score: 2420, change: 'down' },
    { rank: 4, address: '0x5d2c...4e9f', score: 2100, change: 'same' },
    { rank: 5, address: '0x9a8c...1b3d', score: 1850, change: 'up' }
  ];

  const displayUsers = topUsers.length > 0 ? topUsers : mockUsers;

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <span className="text-3xl">🏆</span> Top Learners
        </h3>
        <Link href="/leaderboard" className="text-sm text-blue-400 hover:text-blue-300">
          View all →
        </Link>
      </div>
      
      <div className="space-y-3">
        {displayUsers.map((user, index) => (
          <div 
            key={index}
            className={`flex items-center justify-between p-3 rounded-xl transition-all hover:bg-white/5 ${
              user.rank === 1 ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20' :
              user.rank === 2 ? 'bg-gradient-to-r from-gray-400/10 to-gray-500/10 border border-gray-400/20' :
              user.rank === 3 ? 'bg-gradient-to-r from-amber-600/10 to-amber-700/10 border border-amber-600/20' :
              'bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold">
                {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : `#${user.rank}`}
              </span>
              <div>
                <div className="font-mono text-sm">
                  {user.address.slice(0, 6)}...{user.address.slice(-4)}
                </div>
                <div className="text-xs text-gray-400">Level 12</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold">{user.score.toLocaleString()}</div>
              <div className="text-xs text-green-400">LEARN</div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 rounded-xl font-bold transition">
        View Full Rankings →
      </button>
    </div>
  );
}
