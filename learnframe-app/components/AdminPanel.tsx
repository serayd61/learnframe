'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useFarcaster } from '@/components/FarcasterProvider';
import QuizManagerABI from '@/lib/contracts/QuizManagerV2.json';

const QUIZ_DATA = [
  { answer: "ETH", reward: 10, category: "Base", difficulty: 1 },
  { answer: "Coinbase", reward: 10, category: "Base", difficulty: 1 },
  { answer: "Optimism", reward: 15, category: "Base", difficulty: 2 },
  { answer: "Yes", reward: 10, category: "Base", difficulty: 1 },
  { answer: "Proof of Stake", reward: 20, category: "Consensus", difficulty: 3 }
];

export function AdminPanel() {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const { ethProvider, isConnected, user } = useFarcaster();
  const [userAddress, setUserAddress] = useState<string | null>(null);

  // Get user address when connected
  useEffect(() => {
    const getUserAddress = async () => {
      if (ethProvider && isConnected) {
        try {
          const provider = new ethers.BrowserProvider(ethProvider as ethers.Eip1193Provider);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setUserAddress(address);
        } catch (error) {
          console.error('Failed to get address:', error);
        }
      } else {
        setUserAddress(null);
      }
    };
    
    getUserAddress();
  }, [ethProvider, isConnected]);

  const checkQuizzes = async () => {
    if (!isConnected || !ethProvider) {
      setFeedback('❌ Wallet not connected');
      return;
    }

    setIsWorking(true);
    setFeedback('🔍 Checking quiz status...');

    try {
      const provider = new ethers.BrowserProvider(ethProvider as ethers.Eip1193Provider);
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_QUIZ_MANAGER!,
        QuizManagerABI.abi,
        provider
      );

      const nextQuizId = await contract.nextQuizId();
      let status = `Next Quiz ID: ${nextQuizId}\n\n`;

      for (let i = 1; i < Math.min(nextQuizId, 6); i++) {
        try {
          const quiz = await contract.quizzes(i);
          status += `Quiz ${i}: ${quiz.active ? '✅' : '❌'} Active, Reward: ${quiz.reward}, Category: ${quiz.category}\n`;
        } catch {
          status += `Quiz ${i}: ❌ Not found\n`;
        }
      }

      setFeedback(status);
    } catch (error) {
      console.error(error);
      setFeedback('❌ Error checking quizzes: ' + (error as Error).message);
    } finally {
      setIsWorking(false);
    }
  };

  const createQuizzes = async () => {
    if (!isConnected || !ethProvider) {
      setFeedback('❌ Wallet not connected');
      return;
    }

    setIsWorking(true);
    setFeedback('⏳ Creating quizzes... (This requires admin permissions)');

    try {
      const provider = new ethers.BrowserProvider(ethProvider as ethers.Eip1193Provider);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_QUIZ_MANAGER!,
        QuizManagerABI.abi,
        signer
      );

      let results = '';
      
      for (let i = 0; i < QUIZ_DATA.length; i++) {
        const quiz = QUIZ_DATA[i];
        results += `\nCreating Quiz ${i + 1}: ${quiz.category}...\n`;
        
        try {
          const tx = await contract.createQuiz(
            quiz.answer,
            quiz.reward,
            quiz.category,
            quiz.difficulty
          );
          
          results += `TX: ${tx.hash}\n`;
          await tx.wait();
          results += `✅ Quiz ${i + 1} created!\n`;
          
        } catch (error) {
          results += `❌ Quiz ${i + 1} failed: ${(error as Error).message}\n`;
        }
      }

      setFeedback(results);
      
    } catch (error) {
      console.error(error);
      setFeedback('❌ Error creating quizzes: ' + (error as Error).message);
    } finally {
      setIsWorking(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-center">
        <p className="text-red-400">⚠️ Admin panel requires Farcaster wallet connection</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-6 rounded-lg max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">🔧 Admin Panel</h2>
      <p className="text-sm text-slate-400 mb-4 text-center">
        Connected: {userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}
      </p>
      
      <div className="space-y-4">
        <button
          onClick={checkQuizzes}
          disabled={isWorking}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 px-4 py-2 rounded-lg font-bold"
        >
          {isWorking ? 'Checking...' : 'Check Quiz Status'}
        </button>

        <button
          onClick={createQuizzes}
          disabled={isWorking}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-600 px-4 py-2 rounded-lg font-bold"
        >
          {isWorking ? 'Creating...' : 'Create Missing Quizzes (Admin Only)'}
        </button>
      </div>

      {feedback && (
        <div className="mt-4 p-3 rounded-lg bg-slate-700">
          <pre className="text-sm whitespace-pre-wrap">{feedback}</pre>
        </div>
      )}

      <div className="mt-4 text-xs text-slate-500">
        <p>Contract: {process.env.NEXT_PUBLIC_QUIZ_MANAGER}</p>
        <p>Only contract owner can create quizzes</p>
      </div>
    </div>
  );
}