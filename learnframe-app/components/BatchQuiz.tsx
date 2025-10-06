'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWriteContract, useAccount, useReadContract } from 'wagmi';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useFarcaster } from './FarcasterProvider';

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

const ABI = [
  { inputs: [], name: "startQuizSession", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "string[10]", name: "userAnswers", type: "string[10]" }], name: "submitBatchAnswers", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "address", name: "", type: "address" }], name: "lastQuizTime", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" }
];

const CONTRACT = '0xEfb23c57042C21271ff19e1FB5CfFD1A49bD5f61';

export function BatchQuiz() {
  const router = useRouter();
  const { address } = useAccount();
  const { context } = useFarcaster();
  const [phase, setPhase] = useState<'welcome'|'starting'|'quiz'|'submitting'|'done'>('welcome');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(10).fill(''));
  const [time, setTime] = useState(120);
  const [cooldown, setCooldown] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const [error, setError] = useState('');
  const [farcasterAddress, setFarcasterAddress] = useState<string | null>(null);

  const displayAddress = farcasterAddress || address;

  const { data: lastTime, refetch } = useReadContract({
    address: CONTRACT as `0x${string}`,
    abi: ABI,
    functionName: 'lastQuizTime',
    args: displayAddress ? [displayAddress] : undefined,
    query: { enabled: !!displayAddress }
  });

  const { writeContract: start, data: startHash, isPending: starting } = useWriteContract();
  const { writeContract: submit, data: submitHash, isPending: submitting } = useWriteContract();

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

  useEffect(() => {
    if (displayAddress && lastTime !== undefined) {
      const now = Math.floor(Date.now() / 1000);
      const next = Number(lastTime) + 604800;
      const remaining = Math.max(0, next - now);
      setCooldown(remaining);
      
      if (remaining > 0) {
        const timer = setInterval(() => {
          const r = Math.max(0, next - Math.floor(Date.now() / 1000));
          setCooldown(r);
          if (r === 0) { clearInterval(timer); refetch(); }
        }, 1000);
        return () => clearInterval(timer);
      }
    }
  }, [lastTime, displayAddress, refetch]);

  useEffect(() => {
    if (startHash && phase === 'starting') {
      setTimeout(() => { setPhase('quiz'); setTime(120); refetch(); }, 2000);
    }
  }, [startHash, phase, refetch]);

  useEffect(() => {
    if (submitHash && phase === 'submitting') {
      setTimeout(() => { setPhase('done'); refetch(); }, 2000);
    }
  }, [submitHash, phase, refetch]);

  const handleSubmit = useCallback(async () => {
    const final = answers.map((a, i) => a || QUIZ_QUESTIONS[i].options[0]);
    try {
      setError('');
      setPhase('submitting');
      await submit({
        address: CONTRACT as `0x${string}`,
        abi: ABI,
        functionName: 'submitBatchAnswers',
        args: [final as [string, string, string, string, string, string, string, string, string, string]]
      });
    } catch (e) {
      const err = e as Error;
      setError(err.message || 'Failed to submit');
      setPhase('quiz');
    }
  }, [answers, submit]);

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
    if (cooldown > 0) return setError('Quiz on cooldown');
    try {
      setError('');
      setPhase('starting');
      await start({ address: CONTRACT as `0x${string}`, abi: ABI, functionName: 'startQuizSession' });
    } catch (e) {
      const err = e as Error;
      setError(err.message || 'Failed to start');
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
  const fmtCool = (s: number) => {
    const d = Math.floor(s/86400), h = Math.floor((s%86400)/3600), m = Math.floor((s%3600)/60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s%60}s`;
    return `${s}s`;
  };

  if (phase === 'starting') {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-blue-600/10 backdrop-blur-xl rounded-3xl p-16 border border-blue-500/30">
          <div className="text-8xl mb-6 animate-spin">⏳</div>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Starting Quiz...</h2>
          <p className="text-gray-400 mt-4">{context ? 'Please approve in Farcaster wallet' : 'Please approve in your wallet'}</p>
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
          <button onClick={handleSubmit} disabled={submitting} className="w-full mt-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-xl rounded-2xl disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit Quiz'}
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
          <h3 className="text-3xl font-bold mb-4 text-center text-yellow-300">🏆 Win 100 LEARN!</h3>
          <div className="grid md:grid-cols-2 gap-4 font-semibold">
            <div className="bg-black/30 rounded-lg p-4">📝 10 Questions</div>
            <div className="bg-black/30 rounded-lg p-4">⏱️ 2 Minutes</div>
            <div className="bg-black/30 rounded-lg p-4">📅 Weekly</div>
            <div className="bg-black/30 rounded-lg p-4">💯 Perfect Score</div>
          </div>
        </div>
        {cooldown > 0 && <div className="bg-orange-500/20 border-2 border-orange-500/50 rounded-2xl p-6 mb-6 text-center"><p className="text-xl text-orange-200">Cooldown: {fmtCool(cooldown)}</p></div>}
        {error && <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6"><p className="text-red-300">{error}</p></div>}
        <button onClick={handleStart} disabled={starting || cooldown > 0 || !displayAddress} className={`w-full py-5 rounded-2xl font-bold text-xl text-white ${cooldown === 0 && displayAddress ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' : 'bg-gray-600 opacity-50 cursor-not-allowed'}`}>
          {!displayAddress ? 'Connecting wallet...' : starting ? 'Confirming...' : cooldown > 0 ? `Cooldown: ${fmtCool(cooldown)}` : '🚀 Start Challenge'}
        </button>
      </div>
    </div>
  );
}
