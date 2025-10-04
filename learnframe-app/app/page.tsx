'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { TokenBalance } from '@/components/TokenBalance';
import { useFarcaster } from '@/components/FarcasterProvider';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { context, user, isLoading } = useFarcaster();

  // Loading durumunda basit bir şey göster
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-4xl animate-pulse">🎓</div>
      </div>
    );
  }

  const isInFrame = !!context;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <nav className="border-b border-slate-700 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🎓 LearnFrame</h1>
          <div className="flex items-center gap-4">
            {isConnected && <TokenBalance />}
            {!isInFrame && <ConnectButton />}
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        {isInFrame && user && (
          <div className="bg-purple-600/20 border border-purple-600 rounded-lg p-4 mb-6">
            <p>👋 Welcome from Farcaster, @{user.username}!</p>
            <p className="text-sm opacity-80">FID: {user.fid}</p>
          </div>
        )}

        <div className="text-center py-20">
          <h2 className="text-5xl font-bold mb-4">Learn & Earn on Base</h2>
          <p className="text-xl text-slate-300 mb-8">
            Complete quizzes, earn LEARN tokens, collect achievement NFTs
          </p>
          
          {isConnected || isInFrame ? (
            <div className="bg-slate-800 p-6 rounded-lg max-w-md mx-auto">
              {isConnected && (
                <>
                  <p className="text-slate-300 mb-2">Wallet connected:</p>
                  <p className="font-mono text-sm mb-4">
                    {address?.slice(0,6)}...{address?.slice(-4)}
                  </p>
                </>
              )}
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
