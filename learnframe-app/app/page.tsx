'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useAccount, useReadContract } from 'wagmi';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TOKEN_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

const STATS = [
  { label: "Total Supply", value: "100M LEARN", icon: "💎" },
  { label: "Rewards Per Quiz", value: "100 LEARN", icon: "🎁" },
  { label: "Network", value: "Base Sepolia", icon: "🌐" },
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
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { data: tokenBalance } = useReadContract({
    address: '0xcc2768B27B389aE8999fBF93478E8BBa8485c461' as `0x${string}`,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const balance = tokenBalance ? (Number(tokenBalance) / 10**18).toFixed(2) : '0.00';

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
        {/* Animated orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-[128px] opacity-30"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse"
          }}
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
              {isConnected && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur px-4 py-2 rounded-xl border border-green-500/30"
                >
                  <span className="text-sm text-gray-300">Balance:</span>
                  <span className="ml-2 font-bold text-green-400">{balance} LEARN</span>
                </motion.div>
              )}
              <ConnectButton />
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
          
          {/* CTA Buttons */}
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
                <span className="ml-2">→</span>
              </motion.button>
            </Link>
            
            <Link href="/leaderboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/5 backdrop-blur-xl rounded-2xl font-bold text-lg border border-white/20 hover:bg-white/10 transition"
              >
                View Rankings 🏆
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Live Stats */}
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

        {/* Features Grid */}
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
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10"
                style={{
                  backgroundImage: `linear-gradient(to right, ${feature.color.replace('from-', '').replace('to-', '').split(' ').join(', ')})`
                }}
              />
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 h-full group-hover:border-white/30 transition-all">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* How It Works */}
        <motion.div 
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-transparent to-pink-600/20 blur-3xl"></div>
          <div className="relative bg-gradient-to-br from-purple-600/10 to-pink-600/10 backdrop-blur-xl rounded-3xl p-12 border border-purple-500/20">
            <h2 className="text-5xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              How It Works
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Connect", desc: "Link your wallet", icon: "🔗" },
                { step: "02", title: "Quiz", desc: "Answer questions", icon: "📝" },
                { step: "03", title: "Earn", desc: "Get LEARN tokens", icon: "💰" },
                { step: "04", title: "Rank", desc: "Climb leaderboard", icon: "📈" }
              ].map((item, i) => (
                <motion.div 
                  key={item.step}
                  className="text-center group"
                  whileHover={{ y: -10 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 + i * 0.1 }}
                >
                  <div className="relative mx-auto w-24 h-24 mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-lg opacity-50 group-hover:opacity-100 transition"></div>
                    <div className="relative bg-black rounded-full w-full h-full flex items-center justify-center border-2 border-purple-500">
                      <span className="text-3xl">{item.icon}</span>
                    </div>
                  </div>
                  <div className="text-sm text-purple-400 mb-2">{item.step}</div>
                  <h4 className="font-bold text-xl mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div 
          className="text-center mt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          <motion.h2 
            className="text-5xl font-bold mb-6"
            whileInView={{ scale: [0.9, 1] }}
            transition={{ duration: 0.5 }}
          >
            Ready to Start Earning?
          </motion.h2>
          <p className="text-xl text-gray-400 mb-8">Join thousands of learners earning rewards daily</p>
          <Link href="/quiz">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="px-12 py-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl font-bold text-xl text-white shadow-2xl hover:shadow-green-500/25 transition"
            >
              Launch Quiz App 🚀
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Floating Elements */}
      <div className="fixed bottom-8 right-8 z-50">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-2xl"
        >
          🔥 Live on Base Sepolia
        </motion.div>
      </div>
    </main>
  );
}
