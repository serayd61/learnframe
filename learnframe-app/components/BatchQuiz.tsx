'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const QUIZ_QUESTIONS = [
  { 
    id: 1, 
    question: "What is the native token of Base?",
    options: ["ETH", "BASE", "USDC", "BTC"],
    answer: "ETH",
    emoji: "💎"
  },
  { 
    id: 2, 
    question: "Which company developed Base?",
    options: ["Binance", "Coinbase", "Kraken", "OpenSea"],
    answer: "Coinbase",
    emoji: "🏢"
  },
  { 
    id: 3, 
    question: "What is Base built on?",
    options: ["Polygon", "Arbitrum", "Optimism", "Avalanche"],
    answer: "Optimism",
    emoji: "🔧"
  },
  { 
    id: 4, 
    question: "Is Base EVM compatible?",
    options: ["Yes", "No", "Partially", "Only for NFTs"],
    answer: "Yes",
    emoji: "✅"
  },
  { 
    id: 5, 
    question: "What type of network is Base?",
    options: ["Layer1", "Layer2", "Layer3", "Sidechain"],
    answer: "Layer2",
    emoji: "🔄"
  },
  { 
    id: 6, 
    question: "What is Base's underlying blockchain?",
    options: ["Bitcoin", "Solana", "Ethereum", "Cardano"],
    answer: "Ethereum",
    emoji: "⛓️"
  },
  { 
    id: 7, 
    question: "What year was Base launched?",
    options: ["2021", "2022", "2023", "2024"],
    answer: "2023",
    emoji: "📅"
  },
  { 
    id: 8, 
    question: "What type of rollup is Base?",
    options: ["Optimistic", "ZK", "Hybrid", "Plasma"],
    answer: "Optimistic",
    emoji: "🚀"
  },
  { 
    id: 9, 
    question: "Are gas fees on Base higher or lower than Ethereum?",
    options: ["Higher", "Lower", "Same", "Variable"],
    answer: "Lower",
    emoji: "💰"
  },
  { 
    id: 10, 
    question: "What is the name of Base's major upgrade?",
    options: ["Granite", "Diamond", "Bedrock", "Crystal"],
    answer: "Bedrock",
    emoji: "🪨"
  }
];

const BATCH_QUIZ_ABI = [
  {
    "inputs": [],
    "name": "startQuizSession",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string[10]", "name": "userAnswers", "type": "string[10]"}],
    "name": "submitBatchAnswers",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const QUIZ_CONTRACT = '0xaC7A53955c5620389F880e5453e2d1c066d1A0b9';
const QUIZ_DURATION = 120;

export function BatchQuiz() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(10).fill(''));
  const [quizPhase, setQuizPhase] = useState<'welcome' | 'starting' | 'quiz' | 'submitting' | 'done'>('welcome');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [timeRemaining, setTimeRemaining] = useState(QUIZ_DURATION);
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const { 
    writeContract: startSession, 
    data: startHash,
    isPending: isStartPending,
    isError: isStartError,
    error: startError 
  } = useWriteContract();
  
  const { 
    isLoading: isStartConfirming,
    isSuccess: startSuccess 
  } = useWaitForTransactionReceipt({ 
    hash: startHash,
  });
  
  const { 
    writeContract: submitAnswers, 
    data: submitHash,
    isPending: isSubmitPending,
    isError: isSubmitError,
    error: submitError
  } = useWriteContract();
  
  const { 
    isLoading: isSubmitConfirming,
    isSuccess: submitSuccess 
  } = useWaitForTransactionReceipt({ 
    hash: submitHash,
  });

  useEffect(() => {
    if (!isConnected) {
      setError('Please connect your wallet first');
    } else {
      setError('');
    }
  }, [isConnected]);

  useEffect(() => {
    if (isStartError && startError) {
      console.error('Start transaction error:', startError);
      setError(`Failed to start: ${startError.message || 'Transaction rejected'}`);
      setQuizPhase('welcome');
    }
  }, [isStartError, startError]);

  useEffect(() => {
    if (isSubmitError && submitError) {
      console.error('Submit transaction error:', submitError);
      setError(`Failed to submit: ${submitError.message || 'Transaction rejected'}`);
      setQuizPhase('quiz');
    }
  }, [isSubmitError, submitError]);

  useEffect(() => {
    if (quizPhase === 'quiz' && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitAll();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [quizPhase, timeRemaining]);

  useEffect(() => {
    console.log('Start status:', { startSuccess, quizPhase, startHash });
    if (startSuccess && quizPhase === 'starting') {
      console.log('Quiz starting successfully!');
      setQuizPhase('quiz');
      setQuizStartTime(Date.now());
      setTimeRemaining(QUIZ_DURATION);
      setError('');
    }
  }, [startSuccess, quizPhase, startHash]);

  useEffect(() => {
    console.log('Submit status:', { submitSuccess, quizPhase, submitHash });
    if (submitSuccess && quizPhase === 'submitting') {
      console.log('Quiz submitted successfully!');
      setQuizPhase('done');
    }
  }, [submitSuccess, quizPhase, submitHash]);

  useEffect(() => {
    if (quizPhase === 'done') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push('/leaderboard');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [quizPhase, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartQuiz = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setError('');
      setQuizPhase('starting');
      
      console.log('Starting quiz session...');
      
      await startSession({
        address: QUIZ_CONTRACT as `0x${string}`,
        abi: BATCH_QUIZ_ABI,
        functionName: 'startQuizSession',
      });
      
      console.log('Start transaction sent');
    } catch (err: any) {
      console.error('Start error:', err);
      setError(err?.message || 'Failed to start. Please try again.');
      setQuizPhase('welcome');
    }
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = option;
    setAnswers(newAnswers);
    
    setTimeout(() => {
      if (currentQuestion < 9) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
      } else {
        setSelectedOption(option);
      }
    }, 300);
  };

  const handleSubmitAll = useCallback(async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    const finalAnswers = answers.map((answer, index) => 
      answer || QUIZ_QUESTIONS[index].options[0]
    );

    try {
      setError('');
      setQuizPhase('submitting');
      
      console.log('Submitting answers:', finalAnswers);
      
      await submitAnswers({
        address: QUIZ_CONTRACT as `0x${string}`,
        abi: BATCH_QUIZ_ABI,
        functionName: 'submitBatchAnswers',
        args: [finalAnswers as any],
      });
      
      console.log('Submit transaction sent');
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err?.message || 'Failed to submit. Please try again.');
      setQuizPhase('quiz');
    }
  }, [answers, submitAnswers, isConnected, address]);

  const checkAnswers = () => {
    let correct = 0;
    answers.forEach((answer, i) => {
      if (answer === QUIZ_QUESTIONS[i].answer) {
        correct++;
      }
    });
    return correct;
  };

  if (!isConnected) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-gradient-to-br from-red-600/10 via-orange-600/10 to-yellow-600/10 backdrop-blur-xl rounded-3xl p-12 border border-red-500/30">
          <div className="text-center">
            <span className="text-6xl mb-6 block">🔒</span>
            <h2 className="text-3xl font-bold mb-4 text-red-400">
              Wallet Not Connected
            </h2>
            <p className="text-gray-300 mb-6">
              Please connect your MetaMask wallet to start the quiz
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (quizPhase === 'welcome') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-xl rounded-3xl p-12 border border-white/10">
          <div className="absolute inset-0 opacity-10">
            {Array.from({ length: 6 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-gradient-to-r from-indigo-400 to-purple-400"
                style={{
                  width: `${200 + i * 50}px`,
                  height: `${200 + i * 50}px`,
                  left: `${-100 + i * 20}px`,
                  top: `${-100 + i * 20}px`,
                }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 20 + i * 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </div>
          
          <div className="relative z-10">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center mb-8"
            >
              <span className="text-6xl">🎯</span>
            </motion.div>
            
            <motion.h2 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
            >
              Base Blockchain Challenge
            </motion.h2>
            
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 rounded-2xl p-8 mb-8"
            >
              <h3 className="text-3xl font-bold mb-4 text-center text-yellow-300 flex items-center justify-center gap-3">
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🏆
                </motion.span>
                Win 100 LEARN Tokens!
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-black/30 rounded-lg p-4 flex items-center gap-3">
                  <span className="text-2xl">📝</span>
                  <div>
                    <p className="font-semibold">10 Questions</p>
                    <p className="text-sm text-gray-400">Multiple choice (A,B,C,D)</p>
                  </div>
                </div>
                <div className="bg-black/30 rounded-lg p-4 flex items-center gap-3">
                  <span className="text-2xl">⏱️</span>
                  <div>
                    <p className="font-semibold">2 Minutes</p>
                    <p className="text-sm text-gray-400">Quick thinking required!</p>
                  </div>
                </div>
                <div className="bg-black/30 rounded-lg p-4 flex items-center gap-3">
                  <span className="text-2xl">🎮</span>
                  <div>
                    <p className="font-semibold">Interactive</p>
                    <p className="text-sm text-gray-400">Click to select answers</p>
                  </div>
                </div>
                <div className="bg-black/30 rounded-lg p-4 flex items-center gap-3">
                  <span className="text-2xl">💯</span>
                  <div>
                    <p className="font-semibold">Perfect Score</p>
                    <p className="text-sm text-gray-400">10/10 for rewards</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6"
              >
                <p className="text-red-300">{error}</p>
              </motion.div>
            )}
            
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartQuiz}
              disabled={isStartPending || !isConnected}
              className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold text-xl text-white shadow-2xl transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10">
                {isStartPending ? 'Confirming...' : 'Start 2-Minute Challenge'}
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
              <span className="ml-2 text-2xl">⚡</span>
            </motion.button>
            
            {address && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center mt-4 text-sm text-gray-400"
              >
                Connected: {address.slice(0, 6)}...{address.slice(-4)}
              </motion.p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (quizPhase === 'starting') {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-xl rounded-3xl p-12 border border-white/10">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-8"
            >
              <div className="w-24 h-24 border-4 border-purple-500 border-t-transparent rounded-full"></div>
            </motion.div>
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {isStartConfirming ? 'Confirming Transaction...' : 'Preparing Your Challenge'}
            </h2>
            <p className="text-gray-300 mb-2">
              {isStartPending ? 'Please confirm in MetaMask' : 'Waiting for confirmation...'}
            </p>
            {startHash && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-black/30 rounded-lg"
              >
                <p className="text-sm text-gray-400">Transaction Hash:</p>
                <p className="text-xs font-mono text-purple-400 break-all">
                  {startHash}
                </p>
              </motion.div>
            )}
            {error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 bg-red-500/20 border border-red-500 rounded-lg p-4"
              >
                <p className="text-red-300">{error}</p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (quizPhase === 'quiz') {
    const question = QUIZ_QUESTIONS[currentQuestion];
    const progress = ((currentQuestion + 1) / 10) * 100;
    const timeProgress = (timeRemaining / QUIZ_DURATION) * 100;
    const isLastQuestion = currentQuestion === 9;
    const isTimeRunningOut = timeRemaining <= 30;
    
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <motion.span 
                className={`text-lg font-bold ${isTimeRunningOut ? 'text-red-400' : 'text-purple-400'}`}
                animate={isTimeRunningOut ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                ⏱️ {formatTime(timeRemaining)}
              </motion.span>
              <span className="text-sm text-gray-400">
                Question {currentQuestion + 1}/10
              </span>
            </div>
            <div className="relative h-2 bg-black/30 rounded-full overflow-hidden mb-2">
              <motion.div 
                className={`absolute inset-y-0 left-0 ${
                  isTimeRunningOut 
                    ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-500'
                } rounded-full`}
                style={{ width: `${timeProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="relative h-3 bg-black/30 rounded-full overflow-hidden">
              <motion.div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <div className="bg-black/30 rounded-2xl p-8 border border-white/10">
                <div className="flex items-start gap-4 mb-8">
                  <motion.span 
                    className="text-5xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {question.emoji}
                  </motion.span>
                  <h3 className="text-2xl font-bold flex-1">{question.question}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {question.options.map((option, index) => {
                    const optionLetter = String.fromCharCode(65 + index);
                    const isSelected = answers[currentQuestion] === option;
                    
                    return (
                      <motion.button
                        key={option}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleOptionSelect(option)}
                        className={`
                          relative p-4 rounded-xl font-semibold text-left transition-all duration-300
                          flex items-center gap-4 group
                          ${isSelected 
                            ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-2 border-green-400' 
                            : 'bg-white/5 border-2 border-white/20 hover:border-purple-400 hover:bg-white/10'
                          }
                        `}
                      >
                        <span className={`
                          w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg
                          ${isSelected 
                            ? 'bg-green-500 text-white' 
                            : 'bg-white/10 text-gray-400 group-hover:bg-purple-500 group-hover:text-white'
                          }
                        `}>
                          {optionLetter}
                        </span>
                        <span className="flex-1">{option}</span>
                        {isSelected && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-green-400 text-xl"
                          >
                            ✓
                          </motion.span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-2 mb-6">
            {answers.map((answer, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.2 }}
                onClick={() => setCurrentQuestion(i)}
                className={`
                  w-8 h-8 rounded-lg text-xs font-bold transition-all
                  ${i === currentQuestion 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                    : answer 
                      ? 'bg-green-500/30 text-green-400' 
                      : 'bg-white/5 text-gray-500'
                  }
                `}
              >
                {i + 1}
              </motion.button>
            ))}
          </div>

          <div className="flex justify-between gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (currentQuestion > 0) {
                  setCurrentQuestion(currentQuestion - 1);
                  setSelectedOption(answers[currentQuestion - 1]);
                }
              }}
              disabled={currentQuestion === 0}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded-xl font-bold text-white transition-all"
            >
              ← Previous
            </motion.button>

            {isLastQuestion && answers.filter(a => a).length === 10 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmitAll}
                disabled={isSubmitPending}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 rounded-xl font-bold text-xl text-white shadow-2xl"
              >
                {isSubmitPending ? 'Submitting...' : 'Submit Quiz ✓'}
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (currentQuestion < 9) {
                    setCurrentQuestion(currentQuestion + 1);
                    setSelectedOption(answers[currentQuestion + 1]);
                  }
                }}
                disabled={currentQuestion === 9}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 rounded-xl font-bold text-white transition-all"
              >
                Next →
              </motion.button>
            )}
          </div>

          {isTimeRunningOut && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center text-red-400 font-semibold"
            >
              ⚠️ Less than 30 seconds remaining! Quiz will auto-submit when time runs out.
            </motion.div>
          )}
          
          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 bg-red-500/20 border border-red-500 rounded-lg p-4"
            >
              <p className="text-red-300">{error}</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }

  if (quizPhase === 'submitting') {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-xl rounded-3xl p-12 border border-white/10">
          <div className="text-center">
            <motion.div className="inline-block mb-8">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1, repeat: Infinity }
                }}
                className="w-24 h-24 border-4 border-green-500 border-t-transparent rounded-full"
              />
            </motion.div>
            
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              {isSubmitConfirming ? 'Confirming Submission...' : 'Verifying Your Answers'}
            </h2>
            <p className="text-gray-300 mb-2">
              {isSubmitPending ? 'Please confirm in MetaMask' : 'Calculating your score on the blockchain...'}
            </p>
            
            {submitHash && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-black/30 rounded-lg"
              >
                <p className="text-sm text-gray-400">Transaction Hash:</p>
                <p className="text-xs font-mono text-green-400 break-all">
                  {submitHash}
                </p>
              </motion.div>
            )}
            
            {error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 bg-red-500/20 border border-red-500 rounded-lg p-4"
              >
                <p className="text-red-300">{error}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setError('');
                    setQuizPhase('quiz');
                  }}
                  className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-white"
                >
                  Back to Quiz
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (quizPhase === 'done') {
    const correctCount = checkAnswers();
    const isPerfect = correctCount === 10;
    const timeTaken = quizStartTime ? Math.floor((Date.now() - quizStartTime) / 1000) : QUIZ_DURATION;
    
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-xl rounded-3xl p-12 border border-white/10">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="text-8xl mb-6"
            >
              {isPerfect ? '🎉' : '📊'}
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent"
            >
              {isPerfect ? 'Perfect Score!' : 'Quiz Complete!'}
            </motion.h2>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <p className="text-3xl mb-2">
                Score: <span className="font-bold text-purple-400">{correctCount}</span>/10
              </p>
              <p className="text-lg text-gray-400">
                Time: {formatTime(timeTaken)} / {formatTime(QUIZ_DURATION)}
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-10 gap-2 mb-6"
            >
              {QUIZ_QUESTIONS.map((q, i) => {
                const isCorrect = answers[i] === q.answer;
                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className={`
                      w-full h-10 rounded-lg flex items-center justify-center font-bold
                      ${isCorrect 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                        : 'bg-red-500/30 text-red-400 border border-red-500/50'
                      }
                    `}
                  >
                    {isCorrect ? '✓' : '✗'}
                  </motion.div>
                );
              })}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              {isPerfect ? (
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400 rounded-2xl p-6 mb-6">
                  <motion.p 
                    className="text-2xl font-bold text-green-400 mb-2"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🎊 You earned 100 LEARN tokens! 🎊
                  </motion.p>
                  <p className="text-lg text-green-300">Transaction confirmed on Base Sepolia</p>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400 rounded-2xl p-6 mb-6">
                  <p className="text-xl text-yellow-400 mb-2">
                    You got {correctCount} correct! Need all 10 for rewards.
                  </p>
                  <p className="text-lg text-yellow-300">Try again tomorrow!</p>
                </div>
              )}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-2 text-gray-300"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full"
              />
              <p className="text-lg">Redirecting to leaderboard in {countdown}...</p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
}
