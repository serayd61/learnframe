'use client';

import { useAccount, useReadContract } from 'wagmi';
import LearnTokenABI from '@/lib/contracts/LearnToken.json';

export function TokenBalance() {
  const { address } = useAccount();
  
  const { data: balance } = useReadContract({
    address: process.env.NEXT_PUBLIC_LEARN_TOKEN as `0x${string}`,
    abi: LearnTokenABI.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const formattedBalance = balance ? (Number(balance) / 1e18).toFixed(2) : '0';

  return (
    <div className="bg-slate-800 p-4 rounded-lg">
      <div className="text-sm text-slate-400">Your Balance</div>
      <div className="text-2xl font-bold">{formattedBalance} LEARN</div>
    </div>
  );
}
