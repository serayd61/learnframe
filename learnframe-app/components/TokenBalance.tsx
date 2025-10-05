'use client';

import { useAccount, useReadContract } from 'wagmi';
import { useEffect } from 'react';

const TOKEN_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export function TokenBalance() {
  const { address } = useAccount();
  
  const { data, refetch } = useReadContract({
    address: '0xcc2768B27B389aE8999fBF93478E8BBa8485c461' as `0x${string}`,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  const balance = data ? (Number(data) / 10**18).toFixed(2) : '0.00';

  return (
    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur px-4 py-2 rounded-lg border border-green-500/30">
      <span className="text-sm text-gray-300">Balance:</span>
      <span className="ml-2 font-bold text-green-400">{balance} LEARN</span>
    </div>
  );
}
