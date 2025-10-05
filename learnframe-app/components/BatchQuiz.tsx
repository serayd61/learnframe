'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const QUIZ_QUESTIONS = [
  { id: 1, question: "What is the native token of Base?", answer: "ETH", hint: "3 letters", emoji: "💎" },
  { id: 2, question: "Which company developed Base?", answer: "Coinbase", hint: "8 letters", emoji: "🏢" },
  { id: 3, question: "What is Base built on?", answer: "Optimism", hint: "8 letters", emoji: "🔧" },
  { id: 4, question: "Is Base EVM compatible? (yes/no)", answer: "Yes", hint: "3 letters", emoji: "✅" },
  { id: 5, question: "What type of network is Base? (Layer1/Layer2)", answer: "Layer2", hint: "6 letters", emoji: "🔄" },
  { id: 6, question: "What is Base's underlying blockchain?", answer: "Ethereum", hint: "8 letters", emoji: "⛓️" },
  { id: 7, question: "What year was Base launched?", answer: "2023", hint: "4 digits", emoji: "📅" },
  { id: 8, question: "What type of rollup is Base? (Optimistic/ZK)", answer: "Optimistic", hint: "10 letters", emoji: "🚀" },
  { id: 9, question: "Are gas fees on Base higher or lower than Ethereum?", answer: "Lower", hint: "5 letters", emoji: "💰" },
  { id: 10, question: "What is the name of Base's major upgrade?", answer: "Bedrock", hint: "7 letters", emoji: "🪨" }
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

export function BatchQuiz() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(10).fill(''));
  const [quizPhase, setQuizPhase] = useState<'welcome' | 'starting' | 'quiz' | 'submitting' | 'done'>('welcome');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [showHint, setShowHint] = useState(false);
  
  const { writeContract: startSession, data: startHash } = useWriteContract();
  const { isSuccess: startSuccess } = useWaitForTransactionReceipt({ hash: startHash });
  
  const { writeContract: submitAnswers, data: submitHash } = useWriteContract();
  const { isSuccess: submitSuccess } = useWaitForTransactionReceipt({ hash: submitHash });

  useEffect(() => {
    if (startSuccess && quizPhase === 'starting') {
      setQuizPhase('quiz');
      setError('');
    }
  }, [startSuccess, quizPhase]);

  useEffect(() => {
    if (submitSuccess && quizPhase === 'submitting') {
      setQuizPhase('done');
    }
  }, [submitSuccess, quizPhase]);

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

  const handleStartQuiz = async () => {
    try {
      setError('');
      setQuizPhase('starting');
      
      await startSession({
        address: QUIZ_CONTRACT as `0x${string}`,
        abi: BATCH_QUIZ_ABI,
        functionName: 'startQuizSession',
      });
    } catch (err) {
      console.error('Start error:', err);
      setError('Failed to start. Please try again.');
      setQuizPhase('welcome');
    }
  };

  const handleSubmitAll = async () => {
    if (answers.some(a => !a.trim())) {
      setError('Please answer all questions!');
      return;
    }

    try {
      setError('');
      setQuizPhase('submitting');
      
      await submitAnswers({
        address: QUIZ_CONTRACT as `0x${string}`,
        abi: BATCH_QUIZ_ABI,
        functionName: 'submitBatchAnswers',
        args: [answers],
      });
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to submit. Please try again.');
      setQuizPhase('quiz');
    }
  };

  const checkAnswers = () => {
    let correct = 0;
    answers.forEach((answer, i) => {
      if (answer.toLowerCase() === QUIZ_QUESTIONS[i].answer.toLowerCase()) {
        correct++;
      }
    });
    return correct;
  };

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
    setShowHint(false);
  };

  if (quizPhase === 'welcome') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-xl rounded-3xl p-12 border border-white/10">
          {/* Animated Background Pattern */}
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
                animate={{
                  rotate: 360,
                }}
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
              transition={{ delay: 0.1 }}
              className="text-center mb-8"
            >
              <span className="text-6xl">🎯</span>
            </motion.div>
            
            <motion.h2 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-5xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
            >
              Base Blockchain Quiz
            </motion.h2>
            
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
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
                    <p className="text-sm text-gray-400">About Base blockchain</p>
                  </div>
                </div>
                <div className="bg-black/30 rounded-lg p-4 flex items-center gap-3">
                  <span className="text-2xl">⏱️</span>
                  <div>
                    <p className="font-semibold">30 Minutes</p>
                    <p className="text-sm text-gray-400">Time limit</p>
                  </div>
                </div>
                <div className="bg-black/30 rounded-lg p-4 flex items-center gap-3">
                  <span className="text-2xl">💯</span>
                  <div>
                    <p className="font-semibold">Perfect Score</p>
                    <p className="text-sm text-gray-400">All correct required</p>
                  </div>
                </div>
                <div className="bg-black/30 rounded-lg p-4 flex items-center gap-3">
                  <span className="text-2xl">🎁</span>
                  <div>
                    <p className="font-semibold">100 LEARN</p>
                    <p className="text-sm text-gray-400">Token reward</p>
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
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartQuiz}
              className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-2xl font-bold text-xl text-white shadow-2xl transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10">Start Quiz Challenge</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
              <span className="ml-2 text-2xl">🚀</span>
            </motion.button>
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
              Initializing Quiz Session
            </h2>
            <p className="text-gray-300 mb-2">Please confirm the transaction in your wallet</p>
            {startHash && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-black/30 rounded-lg"
              >
                <p className="text-sm text-gray-400">Transaction Hash:</p>
                <p className="text-xs font-mono text-purple-400">{startHash.slice(0,20)}...{startHash.slice(-18)}</p>
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
    
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-semibold text-purple-400">
                Question {currentQuestion + 1} of 10
              </span>
              <span className="text-sm text-gray-400">
                {answers.filter(a => a).length}/10 answered
              </span>
            </div>
            <div className="relative h-3 bg-black/30 rounded-full overflow-hidden">
              <motion.div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
          </div>

          {/* Question Card */}
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
                <div className="flex items-start gap-4 mb-6">
                  <span className="text-5xl">{question.emoji}</span>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">{question.question}</h3>
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="text-sm text-purple-400 hover:text-purple-300 transition"
                    >
                      {showHint ? '💡 Hint shown below' : '💡 Need a hint?'}
                    </button>
                  </div>
                </div>
                
                <input
                  type="text"
                  value={answers[currentQuestion]}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-xl text-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && currentQuestion < 9) {
                      setCurrentQuestion(currentQuestion + 1);
                    }
                  }}
                />
                
                <AnimatePresence>
                  {showHint && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-3 text-sm text-yellow-400 bg-yellow-500/10 px-4 py-2 rounded-lg"
                    >
                      💡 Hint: {question.hint}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Question Navigation Grid */}
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-8">
            {answers.map((answer, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentQuestion(i)}
                className={`
                  relative py-3 rounded-xl text-sm font-bold transition-all duration-300
                  ${i === currentQuestion 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                    : answer 
                      ? 'bg-green-500/30 text-green-400 border border-green-500/50' 
                      : 'bg-white/5 text-gray-500 border border-white/10 hover:border-white/30'
                  }
                `}
              >
                {i + 1}
                {answer && i !== currentQuestion && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                  />
                )}
              </motion.button>
            ))}
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4"
            >
              <p className="text-red-300">{error}</p>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCurrentQuestion(Math.max(0, currentQuestion - 1));
                setShowHint(false);
              }}
              disabled={currentQuestion === 0}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-white/10 rounded-xl font-bold text-white transition-all flex items-center gap-2"
            >
              <span>←</span> Previous
            </motion.button>

            {currentQuestion === 9 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmitAll}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl font-bold text-xl text-white shadow-2xl transition-all flex items-center justify-center gap-2"
              >
                Submit All Answers
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  ✓
                </motion.span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCurrentQuestion(Math.min(9, currentQuestion + 1));
                  setShowHint(false);
                }}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl font-bold text-white transition-all flex items-center gap-2"
              >
                Next <span>→</span>
              </motion.button>
            )}
          </div>
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
            <motion.div
              className="inline-block mb-8"
            >
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
              Verifying Your Answers
            </h2>
            <p className="text-gray-300 mb-2">Calculating your score on the blockchain...</p>
            
            {submitHash && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-black/30 rounded-lg"
              >
                <p className="text-sm text-gray-400">Transaction Hash:</p>
                <p className="text-xs font-mono text-green-400">{submitHash.slice(0,20)}...{submitHash.slice(-18)}</p>
                
                <motion.div className="mt-4 flex justify-center gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-3 bg-green-400 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </motion.div>
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
              transition={{ delay: 0.2 }}
              className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent"
            >
              {isPerfect ? 'Perfect Score!' : 'Quiz Complete!'}
            </motion.h2>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <p className="text-3xl mb-2">
                You got <span className="font-bold text-purple-400">{correctCount}</span> out of <span className="font-bold">10</span> correct
              </p>
              
              {/* Score visualization */}
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: 10 }, (_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                      ${i < correctCount 
                        ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/50'
                      }
                    `}
                  >
                    {i < correctCount ? '✓' : '✗'}
                  </motion.div>
                ))}
              </div>
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
                  <p className="text-xl text-yellow-400 mb-2">Almost there! You need all 10 correct to earn tokens.</p>
                  <p className="text-lg text-yellow-300">Try again tomorrow for another chance!</p>
                </div>
              )}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-center gap-2 text-gray-300"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full"
              />
              <p className="text-lg">Redirecting to leaderboard in {countdown} seconds...</p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
}
