'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useFarcaster } from './FarcasterProvider';
import { encodeFunctionData, parseAbi } from 'viem';

// Quiz questions matching the contract setup (first 5 are in contract)
const QUIZ_QUESTIONS = [
  { id: 1, question: "What is the native token of Base?", options: ["ETH", "BASE", "USDC", "BTC"], answer: "ETH", emoji: "💎" },
  { id: 2, question: "Which company developed Base?", options: ["Binance", "Coinbase", "Kraken", "OpenSea"], answer: "Coinbase", emoji: "🏢" },
  { id: 3, question: "What is Base built on?", options: ["Polygon", "Arbitrum", "Optimism", "Avalanche"], answer: "Optimism", emoji: "🔧" },
  { id: 4, question: "Is Base EVM compatible?", options: ["Yes", "No", "Partially", "Only for NFTs"], answer: "Yes", emoji: "✅" },
  { id: 5, question: "What is the consensus mechanism?", options: ["Proof of Work", "Proof of Stake", "Proof of Authority", "Delegated PoS"], answer: "Proof of Stake", emoji: "🔒" }
];

// Force mainnet contract address
const CONTRACT = '0xEfb23c57042C21271ff19e1FB5CfFD1A49bD5f61';
const ABI = parseAbi([
  'function submitAnswer(uint256 _quizId, string memory _answer)',
  'function quizzes(uint256) view returns (address creator, bytes32 answerHash, uint256 reward, string memory category, uint8 difficulty, uint256 completions, bool active)',
  'function hasCompleted(address, uint256) view returns (bool)',
  'function userScores(address) view returns (uint256)',
  'function nextQuizId() view returns (uint256)',
  'function learnToken() view returns (address)'
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
  const [answers, setAnswers] = useState<string[]>(Array(5).fill(''));
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
            console.log('Quiz contract (hardcoded mainnet):', CONTRACT);
            console.log('Final contract address:', CONTRACT);
            console.log('Address is valid:', CONTRACT.length === 42);
            console.log('🔗 Check your quiz history:', `https://basescan.org/address/${accounts[0]}`);
            console.log('🔗 Check contract:', `https://basescan.org/address/${CONTRACT}`);
            
            // Contract bilgilerini oku (Farcaster provider eth_call desteklemiyor, bu normal)
            console.log('ℹ️ Contract reading skipped - Farcaster provider limitations');
          }
        } catch (err) {
          console.error('Farcaster init error:', err);
        }
      }
    };
    if (context) initFarcaster();
  }, [context, farcasterAddress]);

  const handleSubmit = useCallback(async () => {
    const final = answers.map((a, i) => a || QUIZ_QUESTIONS[i].options[0]);
    
    try {
      setError('');
      setPhase('submitting');
      
      if (provider && farcasterAddress) {
        console.log('🎯 Submitting answers one by one to contract...');
        console.log('User answers:', final);
        console.log('Correct answers:', QUIZ_QUESTIONS.map(q => q.answer));
        
        let correctCount = 0;
        let successfulSubmissions = 0;
        
        // Submit each answer individually
        for (let i = 0; i < final.length; i++) {
          const answer = final[i];
          const quizId = i + 1; // Quiz IDs are 1-indexed
          
          try {
            console.log(`Submitting Quiz ${quizId}: "${answer}"`);
            
            const data = encodeFunctionData({
              abi: ABI,
              functionName: 'submitAnswer',
              args: [BigInt(quizId), answer]
            });
            
            const txHash = await provider.request({
              method: 'eth_sendTransaction',
              params: [{
                from: farcasterAddress,
                to: CONTRACT,
                data: data,
                gas: '0x186A0', // 100,000 gas per transaction
                value: '0x0'
              }]
            });
            
            console.log(`✅ Quiz ${quizId} submitted: ${txHash}`);
            successfulSubmissions++;
            
            // Check if answer was correct
            if (answer === QUIZ_QUESTIONS[i].answer) {
              correctCount++;
              console.log(`✅ Quiz ${quizId} correct!`);
            } else {
              console.log(`❌ Quiz ${quizId} incorrect. Expected: ${QUIZ_QUESTIONS[i].answer}, Got: ${answer}`);
            }
            
            // Wait 1 second between transactions to avoid nonce issues
            await new Promise(resolve => setTimeout(resolve, 1000));
            
          } catch (error) {
            console.error(`❌ Failed to submit Quiz ${quizId}:`, error);
            
            // If quiz doesn't exist or already completed, skip
            if ((error as Error)?.message?.includes('Quiz not active')) {
              console.log(`⚠️ Quiz ${quizId} not active on blockchain, skipping...`);
              continue;
            } else if ((error as Error)?.message?.includes('Already completed')) {
              console.log(`⚠️ Quiz ${quizId} already completed, skipping...`);
              continue;
            }
            
            // For other errors, throw to stop the process
            throw error;
          }
        }
        
        console.log(`🏆 Final Score: ${correctCount}/${final.length} correct answers`);
        console.log(`📤 Successful submissions: ${successfulSubmissions}/${final.length}`);
        
        if (correctCount > 0) {
          console.log(`🎉 You should receive ${correctCount * 10} LEARN tokens!`);
        }
        
        // Quiz completion event
        localStorage.setItem('quizCompleted', Date.now().toString());
        localStorage.setItem('lastQuizScore', correctCount.toString());
        window.dispatchEvent(new Event('quizCompleted'));
        
        setTimeout(() => setPhase('done'), 2000);
        
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
      } else if ((e as { message?: string })?.message?.includes('Quiz not active')) {
        errorMessage = 'Quizzes not active on blockchain. Please contact admin to set up quizzes.';
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
      console.log('🚀 Starting quiz directly - no pre-transaction needed');
      setPhase('quiz'); 
      setTime(120);
    } catch (e: unknown) {
      console.error('Start error:', e);
      setError('Failed to start quiz');
      setPhase('welcome');
    }
  };

  const select = (opt: string) => {
    const newA = [...answers];
    newA[currentQ] = opt;
    setAnswers(newA);
    setTimeout(() => { if (currentQ < 4) setCurrentQ(currentQ + 1); }, 300);
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
          <span className="text-2xl font-bold">Q {currentQ + 1}/5</span>
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
        {currentQ === 4 && (
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
        <div className={`bg-gradient-to-br ${correct === 5 ? 'from-green-600/10 border-green-500/30' : 'from-orange-600/10 border-orange-500/30'} backdrop-blur-xl rounded-3xl p-16 border`}>
          <div className="text-9xl mb-6">{correct === 5 ? '🎉' : '😔'}</div>
          <h2 className={`text-5xl font-bold mb-4 bg-gradient-to-r ${correct === 5 ? 'from-green-400 to-emerald-400' : 'from-orange-400 to-red-400'} bg-clip-text text-transparent`}>
            {correct === 5 ? 'Perfect Score!' : 'Quiz Complete!'}
          </h2>
          <p className="text-3xl text-white mb-8">{correct}/5 Correct</p>
          {correct > 0 && <p className="text-2xl text-green-300 mb-6">{correct * 10} LEARN earned!</p>}
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
          <h3 className="text-3xl font-bold mb-4 text-center text-yellow-300">Earn LEARN Tokens!</h3>
          <div className="grid md:grid-cols-2 gap-4 font-semibold">
            <div className="bg-black/30 rounded-lg p-4">📝 5 Questions</div>
            <div className="bg-black/30 rounded-lg p-4">⏱️ 2 Minutes</div>
            <div className="bg-black/30 rounded-lg p-4">🪙 10 LEARN per correct</div>
            <div className="bg-black/30 rounded-lg p-4">🚀 Max 50 LEARN</div>
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
