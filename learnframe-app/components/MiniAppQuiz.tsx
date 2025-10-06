'use client';

import { useState, useEffect } from 'react';
import { useBaseMiniApp } from './BaseMiniAppProvider';
import { motion, AnimatePresence } from 'framer-motion';

const MINI_APP_QUIZ_DATA = [
  {
    id: 1,
    question: "What makes Base special?",
    options: ["Low fees", "Fast transactions", "Coinbase built", "All above"],
    correctAnswer: "All above",
    reward: 25
  },
  {
    id: 2, 
    question: "Base is a Layer 2 on which blockchain?",
    options: ["Bitcoin", "Ethereum", "Solana", "Polygon"],
    correctAnswer: "Ethereum", 
    reward: 25
  },
  {
    id: 3,
    question: "What's Base's native token?",
    options: ["BASE", "ETH", "CBETH", "USDC"],
    correctAnswer: "ETH",
    reward: 30
  }
];

export function MiniAppQuiz() {
  const { isMiniApp, user, share, context } = useBaseMiniApp();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const question = MINI_APP_QUIZ_DATA[currentQuestion];

  const handleSubmit = async () => {
    if (!selectedAnswer) return;

    const isCorrect = selectedAnswer === question.correctAnswer;
    
    if (isCorrect) {
      setScore(score + question.reward);
    }

    setShowFeedback(true);

    setTimeout(() => {
      if (currentQuestion < MINI_APP_QUIZ_DATA.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        setCompleted(true);
        // Share achievement in Base app
        if (isMiniApp) {
          share(
            `Just earned ${score} LEARN tokens on LearnFrame! 🎓`,
            'https://learnframe.vercel.app'
          );
        }
      }
    }, 2000);
  };

  if (completed) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-6 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-3xl"
      >
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-2xl font-bold mb-4 text-white">
          Quiz Complete!
        </h2>
        <div className="bg-black/30 rounded-2xl p-4 mb-6">
          <div className="text-3xl font-bold text-yellow-400">
            {score} LEARN
          </div>
          <div className="text-sm text-gray-300">Tokens Earned</div>
        </div>
        
        {isMiniApp && (
          <div className="space-y-3">
            <button 
              onClick={() => share(`Earned ${score} LEARN tokens! 🎓`, 'https://learnframe.vercel.app')}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-semibold"
            >
              Share Achievement 📢
            </button>
            <div className="text-xs text-gray-400">
              Connected as: {user?.username || user?.displayName}
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Mini-App Header */}
      {isMiniApp && (
        <div className="mb-4 text-center">
          <div className="text-sm text-gray-400">Base Mini-App</div>
          <div className="text-lg font-bold text-white">LearnFrame Quiz</div>
        </div>
      )}

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Question {currentQuestion + 1}/{MINI_APP_QUIZ_DATA.length}</span>
          <span>Score: {score}</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / MINI_APP_QUIZ_DATA.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-4">
          {question.question}
        </h3>
        
        <div className="space-y-3">
          {question.options.map((option) => (
            <button
              key={option}
              onClick={() => setSelectedAnswer(option)}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                selectedAnswer === option
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-xl mb-6 text-center ${
              selectedAnswer === question.correctAnswer
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {selectedAnswer === question.correctAnswer ? '✅ Correct!' : '❌ Wrong!'}
            {selectedAnswer === question.correctAnswer && (
              <div className="text-sm mt-1">+{question.reward} LEARN</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      {!showFeedback && (
        <button
          onClick={handleSubmit}
          disabled={!selectedAnswer}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 py-4 rounded-xl font-bold transition-all"
        >
          Submit Answer
        </button>
      )}
    </div>
  );
}
