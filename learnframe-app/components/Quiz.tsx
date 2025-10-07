'use client';

import { useState, useEffect } from 'react';
import { useFarcaster } from '@/components/FarcasterProvider';
import QuizManagerABI from '@/lib/contracts/QuizManagerV2.json';
import { ethers } from 'ethers';

const QUIZ_DATA = [
  { id: 1, question: "What is the native token of Base?", answer: "ETH", reward: 10 },
  { id: 2, question: "Which company developed Base?", answer: "Coinbase", reward: 10 },
  { id: 3, question: "What is Base built on?", answer: "Optimism", reward: 15 },
  { id: 4, question: "Is Base EVM compatible?", answer: "Yes", reward: 10 },
  { id: 5, question: "What is the consensus mechanism?", answer: "Proof of Stake", reward: 20 }
];

export function Quiz() {
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  const { ethProvider, isConnected, user } = useFarcaster();

  // Get user address when Farcaster wallet connects
  useEffect(() => {
    const getUserAddress = async () => {
      if (ethProvider && isConnected) {
        try {
          const provider = new ethers.BrowserProvider(ethProvider as ethers.Eip1193Provider);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setUserAddress(address);
          console.log('🔗 Connected address:', address);
        } catch (error) {
          console.error('Failed to get address:', error);
        }
      } else {
        setUserAddress(null);
      }
    };
    
    getUserAddress();
  }, [ethProvider, isConnected]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim() || isSubmitting) return;

    // Check if we have wallet connection
    if (!isConnected || !ethProvider || !userAddress) {
      setFeedback('❌ Wallet not connected. Please open in Farcaster frame.');
      return;
    }

    setIsSubmitting(true);
    setFeedback('⏳ Submitting answer to blockchain...');

    try {
      console.log('🎯 Submitting answer:', {
        quizId: currentQuiz + 1,
        answer: userAnswer,
        contract: process.env.NEXT_PUBLIC_QUIZ_MANAGER,
        user: user?.fid,
        address: userAddress
      });

      // Use ethers directly with Farcaster provider
      const provider = new ethers.BrowserProvider(ethProvider as ethers.Eip1193Provider);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_QUIZ_MANAGER!,
        QuizManagerABI.abi,
        signer
      );

      // First check if quiz exists and is active
      try {
        const quiz = await contract.quizzes(BigInt(currentQuiz + 1));
        if (!quiz.active) {
          setFeedback('❌ This quiz is not active on the blockchain yet. Please contact the admin.');
          setIsSubmitting(false);
          return;
        }
        console.log('Quiz found:', { active: quiz.active, reward: quiz.reward.toString(), category: quiz.category });
      } catch (error) {
        console.error('Quiz check error:', error);
        setFeedback('❌ Quiz not found on blockchain. Please contact the admin.');
        setIsSubmitting(false);
        return;
      }

      const tx = await contract.submitAnswer(BigInt(currentQuiz + 1), userAnswer);
      setFeedback('⏳ Transaction submitted... waiting for confirmation');
      
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed:', receipt);
      
      setFeedback(`✅ Answer submitted! You earned ${QUIZ_DATA[currentQuiz].reward} LEARN tokens!`);
      setIsSubmitting(false);

    } catch (error) {
      console.error('❌ Transaction error:', error);
      let errorMessage = 'Unknown error occurred';
      
      if (error instanceof Error) {
        if (error.message.includes('Quiz not active')) {
          errorMessage = 'Quiz is not active on blockchain';
        } else if (error.message.includes('Already completed')) {
          errorMessage = 'You have already completed this quiz';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient gas fees';
        } else {
          errorMessage = error.message;
        }
      }
      
      setFeedback('❌ Transaction failed: ' + errorMessage);
      setIsSubmitting(false);
    }
  };

  // Transaction handling is now done directly in handleSubmit

  const quiz = QUIZ_DATA[currentQuiz];

  return (
    <div className="bg-slate-800 p-6 rounded-lg max-w-2xl mx-auto">
      {/* Connection Status */}
      <div className="mb-4 text-center">
        {isConnected && userAddress ? (
          <div className="text-green-400 text-sm">
            ✅ Connected as {user?.username || `FID ${user?.fid}`} ({userAddress.slice(0, 6)}...{userAddress.slice(-4)})
          </div>
        ) : isConnected ? (
          <div className="text-yellow-400 text-sm">
            🔗 Connecting wallet...
          </div>
        ) : (
          <div className="text-yellow-400 text-sm">
            ⚠️ Open in Farcaster frame to connect wallet
          </div>
        )}
      </div>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-slate-400">Question {currentQuiz + 1} of {QUIZ_DATA.length}</span>
          <span className="text-sm text-green-400">{quiz.reward} LEARN</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuiz + 1) / QUIZ_DATA.length) * 100}%` }}
          />
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4">{quiz.question}</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Your answer..."
          className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        />

        <button
          type="submit"
          disabled={isSubmitting || !userAnswer.trim() || !isConnected || !userAddress}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 px-4 py-2 rounded-lg font-bold"
        >
          {isSubmitting ? 'Submitting...' : !isConnected || !userAddress ? 'Connect Wallet' : 'Submit Answer'}
        </button>
      </form>

      {feedback && (
        <div className={`mt-4 p-3 rounded-lg ${feedback.includes('✅') ? 'bg-green-900' : 'bg-blue-900'}`}>
          {feedback}
        </div>
      )}

      {currentQuiz < QUIZ_DATA.length - 1 && feedback?.includes('✅') && (
        <button
          onClick={() => {
            setCurrentQuiz(currentQuiz + 1);
            setUserAnswer('');
            setFeedback(null);
          }}
          className="w-full mt-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-bold"
        >
          Next Question →
        </button>
      )}
    </div>
  );
}
