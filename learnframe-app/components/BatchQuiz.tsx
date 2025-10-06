'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useFarcaster } from './FarcasterProvider';
import { encodeFunctionData, parseAbi, isAddress, getAddress } from 'viem';

const QUIZ_QUESTIONS = [
  { id: 1, question: "What is the native token of Base?", options: ["ETH", "BASE", "USDC", "BTC"], answer: "ETH", emoji: "💎" },
  { id: 2, question: "Which company developed Base?", options: ["Binance", "Coinbase", "Kraken", "OpenSea"], answer: "Coinbase", emoji: "🏢" },
  { id: 3, question: "What is Base built on?", options: ["Polygon", "Arbitrum", "Optimism", "Avalanche"], answer: "Optimism", emoji: "🔧" },
  { id: 4, question: "Is Base EVM compatible?", options: ["Yes", "No", "Partially", "Only for NFTs"], answer: "Yes", emoji: "✅" },
  { id: 5, question: "What type of network is Base?", options: ["Layer1", "Layer2", "Layer3", "Sidechain"], answer: "Layer2", emoji: "🔄" },
  { id: 6, question: "What is Base's underlying blockchain?", options: ["Bitcoin", "Solana", "Ethereum", "Cardano"], answer: "Ethereum", emoji: "⛓️" },
  { id: 7, question: "What year was Base launched?", options: ["2021", "2022", "2023", "2024"], answer: "2023", emoji: "📅" },
  { id: 8, question: "What type of rollup is Base?", options: ["Optimistic", "ZK", "Hybrid", "Plasma"], answer: "Optimistic", emoji: "🚀" },
  { id: 9, question: "Are gas fees on Base higher or lower than Ethereum?", options: ["Higher", "Lower", "Same", "Variable"], answer: "Lower", emoji: "💰" },
  { id: 10, question: "What is the name of Base's major upgrade?", options: ["Granite", "Diamond", "Bedrock", "Crystal"], answer: "Bedrock", emoji: "🪨" }
];

const rawAddress = (process.env.NEXT_PUBLIC_BATCH_QUIZ || '0xEfb23c57042C21271ff19e1FB5CfFD1A49bD5f61').trim();
const CONTRACT = isAddress(rawAddress) ? getAddress(rawAddress) : '0xEfb23c57042C21271ff19e1FB5CfFD1A49bD5f61';
const ABI = parseAbi([
  'function startQuizSession()',
  'function submitBatchAnswers(string[10] memory userAnswers)',
  'function lastQuizTime(address) view returns (uint256)'
]);

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

export function BatchQuiz() {
  const router = useRouter();
  const { address: wagmiAddress } = useAccount();
  const { context } = useFarcaster();
  const [phase, setPhase] = useState<'welcome'|'starting'|'quiz'|'submitting'|'done'>('welcome');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(10).fill(''));
  const [time, setTime] = useState(120);
  const [countdown, setCountdown] = useState(5);
  const [error, setError] = useState('');
  const [farcasterAddress, setFarcasterAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<EthereumProvider | null>(null);

  const address = farcasterAddress || wagmiAddress;

  useEffect(() => {
    const initFarcaster = async () => {
      if (context && !farcasterAddress) {
        try {
          const sdk = (await import('@farcaster/frame-sdk')).default;
          const ethProvider = sdk.wallet.ethProvider;
          
          // Chain kontrolü
          const chainId = await ethProvider.request({ method: 'eth_chainId' });
          console.log('Current chain ID:', chainId, 'Expected: 0x2105 (Base Mainnet)');
          
          const accounts = await ethProvider.request({ method: 'eth_requestAccounts' }) as string[];
          if (accounts?.[0]) {
            setFarcasterAddress(accounts[0]);
            setProvider(ethProvider);
            console.log('Farcaster wallet connected:', accounts[0]);
            console.log('Raw contract from env:', process.env.NEXT_PUBLIC_BATCH_QUIZ);
            console.log('Final contract address:', CONTRACT);
            console.log('Address is valid:', isAddress(CONTRACT));
          }
        } catch (err) {
          console.error('Farcaster init error:', err);
        }
      }
    };
    if (context) initFarcaster();
  }, [context, farcasterAddress]);

  const handleSubmit = useCallback(async () => {
    const final = answers.map((a, i) => a || QUIZ_QUESTIONS[i].options[0]) as [string, string, string, string, string, string, string, string, string, string];
    try {
      setError('');
      setPhase('submitting');
      
      if (provider && farcasterAddress) {
        const data = encodeFunctionData({
          abi: ABI,
          functionName: 'submitBatchAnswers',
          args: [final]
        });
        
        const txHash = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: farcasterAddress,
            to: CONTRACT,
            data: data,
            gas: '0x493E0', // 300,000
            value: '0x0'
          }]
        });
        
        console.log('Submit tx hash:', txHash);
        setTimeout(() => setPhase('done'), 3000);
      } else {
        throw new Error('Wallet not connected');
      }
    } catch (e: unknown) {
      console.error('Submit error:', e);
      
      let errorMessage = 'Failed to submit quiz';
      if ((e as { code?: number })?.code === 4001) {
        errorMessage = 'Transaction rejected by user';
      } else if ((e as { message?: string })?.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas';
      } else if ((e as { message?: string })?.message?.includes('nonce')) {
        errorMessage = 'Nonce too high, please reset wallet';
      } else if ((e as { message?: string })?.message?.includes('reverted')) {
        errorMessage = 'Contract execution failed - Check if quiz is already completed';
      } else if ((e as { message?: string })?.message) {
        errorMessage = (e as { message: string }).message;
      }
      
      setError(errorMessage);
      setPhase('quiz');
    }
  }, [answers, provider, farcasterAddress]);

  useEffect(() => {
    if (phase === 'quiz' && time > 0) {
      const t = setInterval(() => setTime(p => {
        if (p <= 1) {
          handleSubmit();
          return 0;
        }
        return p - 1;
      }), 1000);
      return () => clearInterval(t);
    }
  }, [phase, time, handleSubmit]);

  useEffect(() => {
    if (phase === 'done') {
      const timer = setInterval(() => {
        setCountdown(prev => prev <= 1 ? 0 : prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'done' && countdown === 0) {
      router.push('/leaderboard');
    }
  }, [phase, countdown, router]);

  const handleStart = async () => {
    try {
      setError('');
      setPhase('starting');
      
      if (provider && farcasterAddress) {
        const data = encodeFunctionData({
          abi: ABI,
          functionName: 'startQuizSession',
          args: []
        });
        
        const txHash = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: farcasterAddress,
            to: CONTRACT,
            data: data,
            gas: '0x249F0', // 150,000
            value: '0x0'
          }]
        });
        
        console.log('Start tx hash:', txHash);
        setTimeout(() => { setPhase('quiz'); setTime(120); }, 3000);
      } else {
        throw new Error('Wallet not connected');
      }
    } catch (e: unknown) {
      console.error('Start error:', e);
      
      let errorMessage = 'Failed to start quiz';
      if ((e as { code?: number })?.code === 4001) {
        errorMessage = 'Transaction rejected by user';
      } else if ((e as { message?: string })?.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas';
      } else if ((e as { message?: string })?.message?.includes('nonce')) {
        errorMessage = 'Nonce too high, please reset wallet';
      } else if ((e as { message?: string })?.message?.includes('reverted')) {
        errorMessage = 'Contract execution failed - Check cooldown period';
      } else if ((e as { message?: string })?.message) {
        errorMessage = (e as { message: string }).message;
      }
      
      setError(errorMessage);
      setPhase('welcome');
    }
  };

  const select = (opt: string) => {
    const newA = [...answers];
    newA[currentQ] = opt;
    setAnswers(newA);
    setTimeout(() => { if (currentQ < 9) setCurrentQ(currentQ + 1); }, 300);
  };

  const correct = answers.filter((a, i) => a === QUIZ_QUESTIONS[i].answer).length;
  const fmtTime = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

  if (phase === 'starting') {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-blue-600/10 backdrop-blur-xl rounded-3xl p-16 border border-blue-500/30">
          <div className="text-8xl mb-6 animate-spin">⏳</div>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Starting Quiz...</h2>
          <p className="text-gray-400 mt-4">Please approve the transaction in Farcaster</p>
        </div>
      </div>
    );
  }

  if (phase === 'quiz') {
    const q = QUIZ_QUESTIONS[currentQ];
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between bg-indigo-600/20 backdrop-blur-xl rounded-2xl p-4">
          <span className="text-2xl font-bold">Q {currentQ + 1}/10</span>
          <span className={`text-2xl font-bold ${time < 30 ? 'text-red-400 animate-pulse' : ''}`}>{fmtTime(time)}</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={currentQ} initial={{opacity:0,x:50}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-50}} className="bg-indigo-600/10 backdrop-blur-xl rounded-3xl p-12 border border-white/10">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{q.emoji}</div>
              <h2 className="text-3xl font-bold text-white">{q.question}</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {q.options.map((opt, i) => (
                <button key={opt} onClick={() => select(opt)} className={`p-6 rounded-xl font-bold text-lg transition ${answers[currentQ] === opt ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>
                  {String.fromCharCode(65+i)}. {opt}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
        {currentQ === 9 && (
          <button onClick={handleSubmit} className="w-full mt-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-xl rounded-2xl">
            Submit Quiz
          </button>
        )}
      </div>
    );
  }

  if (phase === 'submitting') {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-green-600/10 backdrop-blur-xl rounded-3xl p-16 border border-green-500/30">
          <div className="text-8xl mb-6 animate-spin">📤</div>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Submitting...</h2>
        </div>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className={`bg-gradient-to-br ${correct === 10 ? 'from-green-600/10 border-green-500/30' : 'from-orange-600/10 border-orange-500/30'} backdrop-blur-xl rounded-3xl p-16 border`}>
          <div className="text-9xl mb-6">{correct === 10 ? '🎉' : '😔'}</div>
          <h2 className={`text-5xl font-bold mb-4 bg-gradient-to-r ${correct === 10 ? 'from-green-400 to-emerald-400' : 'from-orange-400 to-red-400'} bg-clip-text text-transparent`}>
            {correct === 10 ? 'Perfect Score!' : 'Quiz Complete!'}
          </h2>
          <p className="text-3xl text-white mb-8">{correct}/10 Correct</p>
          {correct === 10 && <p className="text-2xl text-green-300 mb-6">100 LEARN earned!</p>}
          <p className="text-xl text-gray-300">Redirecting in {countdown}s...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-indigo-600/10 backdrop-blur-xl rounded-3xl p-12 border border-white/10">
        <div className="text-center mb-8 text-6xl">🎯</div>
        <h2 className="text-5xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Base Blockchain Challenge</h2>
        <div className="bg-yellow-500/20 border-2 border-yellow-500/50 rounded-2xl p-8 mb-8">
          <h3 className="text-3xl font-bold mb-4 text-center text-yellow-300">Win 100 LEARN!</h3>
          <div className="grid md:grid-cols-2 gap-4 font-semibold">
            <div className="bg-black/30 rounded-lg p-4">📝 10 Questions</div>
            <div className="bg-black/30 rounded-lg p-4">⏱️ 2 Minutes</div>
            <div className="bg-black/30 rounded-lg p-4">📅 Weekly</div>
            <div className="bg-black/30 rounded-lg p-4">💯 Perfect Score</div>
          </div>
        </div>
        {error && <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6"><p className="text-red-300">{error}</p></div>}
        <button onClick={handleStart} disabled={!address} className={`w-full py-5 rounded-2xl font-bold text-xl text-white ${address ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' : 'bg-gray-600 opacity-50 cursor-not-allowed'}`}>
          {!address ? 'Connecting wallet...' : 'Start Challenge'}
        </button>
      </div>
    </div>
  );
}
