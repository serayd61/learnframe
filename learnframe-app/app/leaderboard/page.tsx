'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useFarcaster } from '@/components/FarcasterProvider';
import { motion } from 'framer-motion';

interface LeaderboardUser {
  address: string;
  balance: bigint;
  rank: number;
}

const TOKEN_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export default function LeaderboardPage() {
  const { address } = useAccount();
  const { context } = useFarcaster();
  const [farcasterAddress, setFarcasterAddress] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [userBalance, setUserBalance] = useState<string>('0.00');
  const [userRank, setUserRank] = useState<number>(0);
  const displayAddress = farcasterAddress || address;

  // MAINNET TOKEN CONTRACT (hardcoded to avoid environment cache issues)
  const TOKEN_CONTRACT = '0x1Cd95030e189e54755C1ccA28e24891250A79d50' as `0x${string}`;

  // User balance okuma
  const { data: tokenBalance, refetch: refetchBalance } = useReadContract({
    address: TOKEN_CONTRACT,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: displayAddress ? [displayAddress] : undefined,
    query: {
      enabled: !!displayAddress,
    }
  });

  // Total supply okuma
  const { data: totalSupply } = useReadContract({
    address: TOKEN_CONTRACT,
    abi: TOKEN_ABI,
    functionName: 'totalSupply',
  });

  useEffect(() => {
    const connectFarcaster = async () => {
      if (context && !farcasterAddress) {
        try {
          const sdk = (await import('@farcaster/frame-sdk')).default;
          const provider = sdk.wallet.ethProvider;
          const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[];
          if (accounts?.[0]) setFarcasterAddress(accounts[0]);
        } catch (error) {
          console.error('Farcaster wallet error:', error);
        }
      }
    };
    if (context) connectFarcaster();
  }, [context, farcasterAddress]);

  // Token balance update
  useEffect(() => {
    if (tokenBalance) {
      const balance = (Number(tokenBalance) / 10**18).toFixed(2);
      setUserBalance(balance);
    }
  }, [tokenBalance]);

  // Mock leaderboard data (gerçek implementasyonda blockchain'den gelecek)
  useEffect(() => {
    const mockData: LeaderboardUser[] = [
      { address: '0x1234...5678', balance: BigInt('500000000000000000000'), rank: 1 },
      { address: '0x2345...6789', balance: BigInt('400000000000000000000'), rank: 2 },
      { address: '0x3456...7890', balance: BigInt('300000000000000000000'), rank: 3 },
      { address: '0x4567...8901', balance: BigInt('200000000000000000000'), rank: 4 },
      { address: '0x5678...9012', balance: BigInt('100000000000000000000'), rank: 5 },
    ];

    // Kullanıcı varsa listeye ekle
    if (displayAddress && tokenBalance && Number(tokenBalance) > 0) {
      const userEntry: LeaderboardUser = {
        address: displayAddress,
        balance: tokenBalance as bigint,
        rank: 0
      };
      
      // Balance'a göre rank hesapla
      let rank = 1;
      for (const user of mockData) {
        if (BigInt(tokenBalance.toString()) > user.balance) break;
        rank++;
      }
      userEntry.rank = rank;
      
      // Listeye ekle
      const newList = [...mockData];
      const insertIndex = rank - 1;
      newList.splice(insertIndex, 0, userEntry);
      
      // Rank'leri güncelle
      newList.forEach((user, index) => {
        user.rank = index + 1;
      });
      
      setLeaderboard(newList.slice(0, 10)); // Top 10
      setUserRank(rank);
    } else {
      setLeaderboard(mockData);
      setUserRank(0);
    }
  }, [displayAddress, tokenBalance]);

  // Quiz completion listener
  useEffect(() => {
    const handleQuizCompleted = () => {
      console.log('Quiz completed, refreshing leaderboard balance...');
      refetchBalance();
    };
    
    window.addEventListener('quizCompleted', handleQuizCompleted);
    
    return () => {
      window.removeEventListener('quizCompleted', handleQuizCompleted);
    };
  }, [refetchBalance]);

  const formatBalance = (balance: bigint) => {
    return (Number(balance) / 10**18).toFixed(2);
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20">
      <nav className="border-b border-white/10 backdrop-blur-xl bg-black/50 p-6">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-3xl group-hover:animate-bounce">🎓</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              LearnFrame
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {displayAddress && (
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur px-4 py-2 rounded-xl border border-green-500/30">
                <span className="text-sm text-gray-300">Balance:</span>
                <span className="ml-2 font-bold text-green-400">{userBalance} LEARN</span>
              </div>
            )}
            {context ? (
              <div className="bg-purple-600/20 px-4 py-2 rounded-xl border border-purple-500/30 text-sm">
                {farcasterAddress ? `${farcasterAddress.slice(0,6)}...${farcasterAddress.slice(-4)}` : 'Connecting...'}
              </div>
            ) : (
              <ConnectButton />
            )}
          </div>
        </div>
      </nav>
      
      <div className="max-w-6xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
            🏆 Global Leaderboard
          </h1>
          <p className="text-gray-400 text-lg">Top LEARN token holders</p>
          {userRank > 0 && (
            <div className="mt-4 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 backdrop-blur-xl rounded-2xl p-4 border border-indigo-500/30">
              <p className="text-lg">
                <span className="text-yellow-300 font-bold">Your Rank: {getRankEmoji(userRank)}</span>
                <span className="ml-4 text-green-300">{userBalance} LEARN</span>
              </p>
            </div>
          )}
        </motion.div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold">Top 10 Learners</h2>
          </div>
          
          <div className="divide-y divide-white/10">
            {leaderboard.map((user, index) => (
              <motion.div
                key={user.address}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 flex items-center justify-between hover:bg-white/5 transition ${
                  user.address === displayAddress ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-l-4 border-yellow-400' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold min-w-[60px]">
                    {getRankEmoji(user.rank)}
                  </div>
                  <div>
                    <p className="font-mono text-lg">
                      {user.address === displayAddress ? 'You' : `${user.address.slice(0, 6)}...${user.address.slice(-4)}`}
                    </p>
                    {user.address === displayAddress && (
                      <p className="text-sm text-yellow-400">⭐ Your Position</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-400">
                    {formatBalance(user.balance)} LEARN
                  </p>
                  <p className="text-sm text-gray-400">
                    {((Number(user.balance) / Number(totalSupply || 1)) * 100).toFixed(2)}% of supply
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/quiz">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl font-bold text-xl text-white shadow-2xl hover:shadow-green-500/25 transition"
            >
              🚀 Take Quiz & Earn LEARN
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  );
}
