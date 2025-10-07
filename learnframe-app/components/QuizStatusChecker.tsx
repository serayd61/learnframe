'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import QuizManagerABI from '@/lib/contracts/QuizManagerV2.json';

export function QuizStatusChecker() {
  const [quizStatus, setQuizStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [quizCount, setQuizCount] = useState(0);

  useEffect(() => {
    async function checkQuizAvailability() {
      try {
        console.log('🔍 Checking quiz availability on blockchain...');
        
        const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_QUIZ_MANAGER!,
          QuizManagerABI.abi,
          provider
        );

        const nextQuizId = await contract.nextQuizId();
        const availableQuizzes = parseInt(nextQuizId.toString()) - 1;
        
        console.log(`📊 Available quizzes: ${availableQuizzes}`);
        
        setQuizCount(availableQuizzes);
        
        if (availableQuizzes >= 10) {
          setQuizStatus('available');
        } else {
          setQuizStatus('unavailable');
        }
        
      } catch (error) {
        console.error('Error checking quiz status:', error);
        setQuizStatus('unavailable');
      }
    }

    checkQuizAvailability();
  }, []);

  if (quizStatus === 'checking') {
    return (
      <div className="bg-blue-600/20 border border-blue-500 rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
          <p className="text-blue-300">🔍 Checking quiz availability on Base blockchain...</p>
        </div>
      </div>
    );
  }

  if (quizStatus === 'unavailable') {
    return (
      <div className="bg-red-600/20 border border-red-500 rounded-lg p-6 mb-6">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🚧</div>
          <h3 className="text-2xl font-bold text-red-300">Quiz System Temporarily Unavailable</h3>
          
          <div className="space-y-3 text-left">
            <p className="text-red-200">
              <strong>Issue:</strong> Quizzes are not yet deployed on the Base blockchain.
            </p>
            <p className="text-red-200">
              <strong>Current Status:</strong> {quizCount}/10 quizzes available
            </p>
            <p className="text-red-200">
              <strong>What&apos;s happening:</strong> The contract owner needs to deploy the quiz questions to the blockchain before users can participate.
            </p>
          </div>

          <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 mt-4">
            <h4 className="font-bold text-yellow-300 mb-2">📞 For the Contract Owner:</h4>
            <div className="text-sm text-yellow-200 space-y-2">
              <p><strong>Owner Address:</strong> 0x27650088aD441cE2a10256381246F952F80d51b3</p>
              <p><strong>Quick Fix:</strong></p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to <code className="bg-black/30 px-2 py-1 rounded">https://learnframe.vercel.app/admin</code></li>
                <li>Connect your owner wallet</li>
                <li>Click &quot;Create Missing Quizzes&quot;</li>
              </ol>
              <p><strong>Or run:</strong> <code className="bg-black/30 px-2 py-1 rounded">DEPLOYER_PRIVATE_KEY=0x... node scripts/create-quizzes-urgent.js</code></p>
            </div>
          </div>

          <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4">
            <h4 className="font-bold text-blue-300 mb-2">📱 For Users:</h4>
            <p className="text-blue-200">
              Please check back in a few minutes. The system will automatically detect when quizzes become available.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-3 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-bold"
            >
              🔄 Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-600/20 border border-green-500 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-3">
        <div className="text-2xl">✅</div>
        <p className="text-green-300">
          <strong>Quiz System Ready!</strong> {quizCount} quizzes available on blockchain.
        </p>
      </div>
    </div>
  );
}