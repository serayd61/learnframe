'use client';

import { useAccount, useReadContract } from 'wagmi';
import { useEffect, useState } from 'react';

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
  const [balance, setBalance] = useState('0');

  const { data, refetch } = useReadContract({
    address: (process.env.NEXT_PUBLIC_LEARN_TOKEN || '0xcc2768B27B389aE8999fBF93478E8BBa8485c461') as `0x${string}`,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  useEffect(() => {
    if (data) {
      const tokenBalance = (Number(data) / 10**18).toFixed(2);
      setBalance(tokenBalance);
    }
  }, [data]);

  // Refetch balance every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-lg">
      <span className="text-sm text-gray-400">Balance:</span>
      <span className="ml-2 font-bold">{balance} LEARN</span>
    </div>
  );
}
