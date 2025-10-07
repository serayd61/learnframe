'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { TokenBalance } from '@/components/TokenBalance';
import { useAccount } from 'wagmi';

export function Navigation() {
  const { isConnected } = useAccount();
  
  return (
    <nav className="border-b border-slate-700 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-bold">
            🎓 LearnFrame
          </Link>
          <div className="flex gap-4">
            <Link href="/quiz" className="hover:text-blue-400">
              Quiz
            </Link>
            <Link href="/leaderboard" className="hover:text-blue-400">
              Leaderboard
            </Link>
            <Link href="/admin" className="hover:text-orange-400 text-sm">
              🔧 Admin
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isConnected && <TokenBalance />}
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
}
