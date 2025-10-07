'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useAccount, useReadContract } from 'wagmi';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFarcaster } from '@/components/FarcasterProvider';

const TOKEN_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

const STATS = [
  { label: "Total Supply", value: "100M LEARN", icon: "💎" },
  { label: "Rewards Per Quiz", value: "100 LEARN", icon: "🎁" },
  { label: "Network", value: "Base Mainnet", icon: "🌐" },
  { label: "Success Rate", value: "87%", icon: "📊" }
];

const FEATURES = [
  {
    icon: "🧠",
    title: "Smart Learning",
    description: "AI-powered questions that adapt to your knowledge level",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: "⚡",
    title: "Instant Rewards",
    description: "Get LEARN tokens immediately after perfect score",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: "🏆",
    title: "Global Ranking",
    description: "Compete with learners worldwide on the leaderboard",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: "🔒",
    title: "Blockchain Secured",
    description: "All rewards verified and secured on Base network",
    color: "from-orange-500 to-red-500"
  }
];

export default function Home() {
  const { address, isConnected } = useAccount();
  const { context, isLoading: isFarcasterLoading } = useFarcaster();
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [farcasterAddress, setFarcasterAddress] = useState<string | null>(null);

  // Farcaster wallet connect
  useEffect(() => {
    const connectFarcasterWallet = async () => {
      if (context && !farcasterAddress) {
        try {
          const sdk = (await import("@farcaster/miniapp-sdk")).sdk;
          const provider = sdk.wallet.ethProvider;
          const accounts = await provider.request({ 
            method: 'eth_requestAccounts' 
          }) as string[];
          if (accounts && accounts[0]) {
            setFarcasterAddress(accounts[0]);
            console.log('✅ Farcaster wallet connected:', accounts[0]);
          } else {
            console.log('❌ No Farcaster accounts found');
          }
        } catch (error) {
          console.error('Farcaster wallet error:', error);
        }
      }
    };
    
    if (context && !isFarcasterLoading) {
      connectFarcasterWallet();
    }
  }, [context, isFarcasterLoading, farcasterAddress]);

  const displayAddress = farcasterAddress || address;
  const isUserConnected = isConnected || !!farcasterAddress;

  // MAINNET TOKEN CONTRACT (hardcoded to avoid environment cache issues)
  const TOKEN_CONTRACT = '0x1Cd95030e189e54755C1ccA28e24891250A79d50' as `0x${string}`;

  const { data: tokenBalance, refetch: refetchBalance, error: balanceError, isLoading: balanceLoading } = useReadContract({
    address: TOKEN_CONTRACT,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: displayAddress ? [displayAddress] : undefined,
    query: {
      enabled: !!displayAddress,
    }
  });

  // Contract test için totalSupply oku
  const { data: totalSupply, error: totalSupplyError } = useReadContract({
    address: TOKEN_CONTRACT,
    abi: TOKEN_ABI,
    functionName: 'totalSupply',
  });

  // Debug logs
  useEffect(() => {
    console.log('🔍 Balance Debug Info:');
    console.log('- Display Address:', displayAddress);
    console.log('- Farcaster Address:', farcasterAddress);
    console.log('- Wagmi Address:', address);
    console.log('- Token Contract (hardcoded mainnet):', '0x1Cd95030e189e54755C1ccA28e24891250A79d50');
    console.log('- Token Balance:', tokenBalance);
    console.log('- Balance Error:', balanceError);
    console.log('- Is Loading:', balanceLoading);
    console.log('- Is Connected:', isUserConnected);
    console.log('- Has Context:', !!context);
    console.log('- Farcaster Loading:', isFarcasterLoading);
    console.log('- Total Supply:', totalSupply);
    console.log('- Total Supply Error:', totalSupplyError);
  }, [displayAddress, farcasterAddress, address, tokenBalance, balanceError, balanceLoading, isUserConnected, context, isFarcasterLoading, totalSupply, totalSupplyError]);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    
    // Token balance refresh her 30 saniyede bir
    const interval = setInterval(() => {
      if (displayAddress) {
        refetchBalance();
      }
    }, 30000);

    // Quiz completion listener
    const handleQuizCompleted = () => {
      console.log('Quiz completed, refreshing balance...');
      refetchBalance();
    };
    
    window.addEventListener('quizCompleted', handleQuizCompleted);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('quizCompleted', handleQuizCompleted);
      clearInterval(interval);
    };
  }, [displayAddress, refetchBalance]);

  const balance = tokenBalance ? (Number(tokenBalance) / 10**18).toFixed(2) : '0.00';

  // Quiz tamamlandığında balance refresh et (şu an için event listener kullanıyoruz)
  // const handleQuizComplete = () => {
  //   refetchBalance();
  // };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-black overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.15), transparent 50%)`
          }}
        />
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -100, 0] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-[128px] opacity-30"
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, 100, 0] }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-[128px] opacity-30"
        />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 border-b border-white/10 backdrop-blur-xl bg-black/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-8"
            >
              <Link href="/" className="flex items-center space-x-2 group">
                <span className="text-3xl group-hover:animate-bounce">🎓</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  LearnFrame
                </span>
              </Link>
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/quiz" className="relative group">
                  <span className="text-gray-300 hover:text-white transition">Quiz</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all"></span>
                </Link>
                <Link href="/leaderboard" className="relative group">
                  <span className="text-gray-300 hover:text-white transition">Leaderboard</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all"></span>
                </Link>
                <Link href="/rewards" className="relative group">
                  <span className="text-gray-300 hover:text-white transition">Rewards</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all"></span>
                </Link>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              {displayAddress && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur px-4 py-2 rounded-xl border border-green-500/30"
                >
                  <span className="text-sm text-gray-300">Balance:</span>
                  <span className="ml-2 font-bold text-green-400">
                    {balanceLoading ? '⏳ Loading...' : `${balance} LEARN`}
                  </span>
                  <button 
                    onClick={() => refetchBalance()} 
                    className="ml-2 text-xs bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded"
                  >
                    🔄
                  </button>
                  {balanceError && (
                    <div className="text-xs text-red-400 mt-1">
                      Error: {balanceError.message}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    <a 
                      href={`https://basescan.org/address/${displayAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-400"
                    >
                      📊 View on Basescan
                    </a>
                  </div>
                </motion.div>
              )}
              {context ? (
                <div className="bg-purple-600/20 backdrop-blur px-4 py-2 rounded-xl border border-purple-500/30 text-sm">
                  {farcasterAddress ? `${farcasterAddress.slice(0,6)}...${farcasterAddress.slice(-4)}` : 'Connecting...'}
                </div>
              ) : (
                <ConnectButton />
              )}
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.h1 
            className="text-7xl md:text-8xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
              Learn & Earn
            </span>
          </motion.h1>
          <motion.p 
            className="text-2xl md:text-3xl text-gray-300 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Master blockchain knowledge, earn real rewards
          </motion.p>
          
          <motion.div 
            className="flex flex-col md:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Link href="/quiz">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-bold text-lg text-white shadow-2xl overflow-hidden"
              >
                <span className="relative z-10">Start Quiz Now</span>
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600"
                  initial={{ x: "100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </Link>
            
            <Link href="/leaderboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/5 backdrop-blur-xl rounded-2xl font-bold text-lg border border-white/20 hover:bg-white/10 transition"
              >
                View Rankings
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-4 gap-6 mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all"
            >
              <div className="text-3xl mb-3">{stat.icon}</div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + index * 0.1 }}
              whileHover={{ scale: 1.05, rotate: 1 }}
              className="relative group"
            >
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 h-full group-hover:border-white/30 transition-all">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <div className="fixed bottom-8 right-8 z-50">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-2xl"
        >
          Live on Base Mainnet
        </motion.div>
      </div>
    </main>
  );
}
