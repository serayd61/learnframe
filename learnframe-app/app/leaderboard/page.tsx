'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useFarcaster } from '@/components/FarcasterProvider';

// Interfaces and ABIs removed - will be implemented later when backend integration is ready

export default function LeaderboardPage() {
  const { address } = useAccount();
  const { context } = useFarcaster();
  const [farcasterAddress, setFarcasterAddress] = useState<string | null>(null);
  const displayAddress = farcasterAddress || address;

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

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <nav className="mb-8 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">🎓 LearnFrame</Link>
        {context ? (
          <div className="bg-purple-600/20 px-4 py-2 rounded-xl border border-purple-500/30 text-sm">
            {farcasterAddress ? `${farcasterAddress.slice(0,6)}...${farcasterAddress.slice(-4)}` : 'Connecting...'}
          </div>
        ) : (
          <ConnectButton />
        )}
      </nav>
      
      <h1 className="text-4xl font-bold mb-8">🏆 Global Leaderboard</h1>
      
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
        <p className="text-gray-400">Leaderboard data will load here...</p>
        {displayAddress && (
          <p className="mt-4 text-sm text-gray-500">Connected: {displayAddress.slice(0,6)}...{displayAddress.slice(-4)}</p>
        )}
      </div>
    </div>
  );
}
