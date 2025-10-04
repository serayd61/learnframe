'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { TokenBalance } from '@/components/TokenBalance';
import { useEffect, useState } from 'react';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [isInFrame, setIsInFrame] = useState(false);

  useEffect(() => {
    // Check if we're in a Farcaster frame/mini app
    if (window.parent !== window || window.location !== window.parent.location) {
      setIsInFrame(true);
    }
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <nav className="border-b border-slate-700 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🎓 LearnFrame</h1>
          <div className="flex items-center gap-4">
            {isConnected && <TokenBalance />}
            <ConnectButton />
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        {isInFrame && (
          <div className="bg-blue-600/20 border border-blue-600 rounded-lg p-4 mb-6">
            <p>👋 Welcome from Farcaster!</p>
          </div>
        )}

        <div className="text-center py-20">
          <h2 className="text-5xl font-bold mb-4">Learn & Earn on Base</h2>
          <p className="text-xl text-slate-300 mb-8">
            Complete quizzes, earn LEARN tokens, collect achievement NFTs
          </p>
          
          {isConnected ? (
            <div className="bg-slate-800 p-6 rounded-lg max-w-md mx-auto">
              <p className="text-slate-300 mb-2">Connected as:</p>
              <p className="font-mono text-sm mb-4">{address?.slice(0,6)}...{address?.slice(-4)}</p>
              <Link 
                href="/quiz"
                className="block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold"
              >
                Start Learning →
              </Link>
            </div>
          ) : (
            <div className="bg-slate-800 p-6 rounded-lg max-w-md mx-auto">
              <p className="text-slate-400 mb-4">Connect your wallet to start</p>
              <ConnectButton />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
