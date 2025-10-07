'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { BatchQuiz } from '@/components/BatchQuiz';
import { QuizStatusChecker } from '@/components/QuizStatusChecker';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useFarcaster } from '@/components/FarcasterProvider';

export default function QuizPage() {
  const { isConnected } = useAccount();
  const { context } = useFarcaster();
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<{ x: number; y: number; id: number }[]>([]);
  const [farcasterAddress, setFarcasterAddress] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      id: i
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    const connectFarcasterWallet = async () => {
      if (context && !farcasterAddress) {
        try {
          const sdk = (await import('@farcaster/frame-sdk')).default;
          const provider = sdk.wallet.ethProvider;
          const accounts = await provider.request({ 
            method: 'eth_requestAccounts' 
          }) as string[];
          if (accounts && accounts[0]) {
            setFarcasterAddress(accounts[0]);
          }
        } catch (error) {
          console.error('Farcaster wallet error:', error);
        }
      }
    };
    
    if (context) {
      connectFarcasterWallet();
    }
  }, [context, farcasterAddress]);

  const isUserConnected = isConnected || !!farcasterAddress;

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-black overflow-hidden">
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-purple-900/20"></div>
        
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{ left: `${particle.x}%`, top: `${particle.y}%` }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
        
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-1/3 -left-20 w-96 h-96 bg-indigo-500 rounded-full filter blur-[150px] opacity-20"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-1/3 -right-20 w-96 h-96 bg-purple-500 rounded-full filter blur-[150px] opacity-20"
        />
      </div>

      <nav className="relative z-50 border-b border-white/10 backdrop-blur-xl bg-black/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-8"
            >
              <Link href="/" className="flex items-center space-x-2 group">
                <span className="text-3xl group-hover:animate-bounce">🎓</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  LearnFrame
                </span>
              </Link>
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/quiz" className="relative group">
                  <span className="text-white font-semibold">Quiz</span>
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-400 to-purple-400"></span>
                </Link>
                <Link href="/leaderboard" className="text-gray-300 hover:text-white transition">
                  Leaderboard
                </Link>
                <Link href="/rewards" className="text-gray-300 hover:text-white transition">
                  Rewards
                </Link>
              </div>
            </motion.div>
            {context ? (
              <div className="bg-purple-600/20 backdrop-blur px-4 py-2 rounded-xl border border-purple-500/30 text-sm">
                {farcasterAddress ? `${farcasterAddress.slice(0,6)}...${farcasterAddress.slice(-4)}` : 'Connecting...'}
              </div>
            ) : (
              <ConnectButton />
            )}
          </div>
        </div>
      </nav>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {!isUserConnected ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center mt-20"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl mb-8"
            >
              🔐
            </motion.div>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Connect Your Wallet
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Please connect your wallet to start the quiz
            </p>
            <div className="inline-block">
              {context ? (
                <div className="text-gray-400">Connecting Farcaster wallet...</div>
              ) : (
                <ConnectButton />
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <QuizStatusChecker />
            <BatchQuiz />
          </motion.div>
        )}
      </div>
    </main>
  );
}
