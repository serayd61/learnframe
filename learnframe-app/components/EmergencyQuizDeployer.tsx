'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import QuizManagerABI from '@/lib/contracts/QuizManagerV2.json';

const EMERGENCY_QUIZZES = [
  { answer: "ETH", reward: 10, category: "Base", difficulty: 1 },
  { answer: "Coinbase", reward: 10, category: "Base", difficulty: 1 },
  { answer: "Optimism", reward: 15, category: "Base", difficulty: 2 },
  { answer: "Yes", reward: 10, category: "Base", difficulty: 1 },
  { answer: "Proof of Stake", reward: 20, category: "Consensus", difficulty: 3 },
  { answer: "Layer2", reward: 15, category: "Scaling", difficulty: 2 },
  { answer: "Ethereum", reward: 15, category: "Base", difficulty: 2 },
  { answer: "2023", reward: 10, category: "History", difficulty: 1 },
  { answer: "Optimistic", reward: 20, category: "Technology", difficulty: 3 },
  { answer: "Lower", reward: 15, category: "Economics", difficulty: 2 }
];

export function EmergencyQuizDeployer() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState<string>('');
  const [deployedCount, setDeployedCount] = useState(0);

  const deployQuizzes = async () => {
    try {
      setIsDeploying(true);
      setDeployStatus('🔍 Checking if MetaMask is connected and on Base network...');

      // Check if MetaMask is available
      if (!(window as unknown as { ethereum?: unknown }).ethereum) {
        throw new Error('MetaMask not installed. Please install MetaMask and try again.');
      }

      const ethereum = (window as unknown as { ethereum: unknown }).ethereum;
      const provider = new ethers.BrowserProvider(ethereum as ethers.Eip1193Provider);
      
      // Request account access
      await (ethereum as ethers.Eip1193Provider).request({ method: 'eth_requestAccounts' });
      
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      
      setDeployStatus(`🔗 Connected as: ${userAddress}`);

      // Check if user is the contract owner
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_QUIZ_MANAGER!,
        QuizManagerABI.abi,
        signer
      );

      const owner = await contract.owner();
      if (owner.toLowerCase() !== userAddress.toLowerCase()) {
        throw new Error(`❌ You are not the contract owner. Owner is: ${owner}`);
      }

      setDeployStatus('✅ Contract owner verified! Starting quiz deployment...');

      // Check current network
      const network = await provider.getNetwork();
      if (network.chainId !== 8453n) {
        throw new Error('❌ Please switch to Base network (Chain ID: 8453)');
      }

      setDeployStatus('✅ Base network confirmed. Deploying quizzes...');

      let successCount = 0;
      for (let i = 0; i < EMERGENCY_QUIZZES.length; i++) {
        const quiz = EMERGENCY_QUIZZES[i];
        const quizNum = i + 1;

        try {
          setDeployStatus(`📝 Creating Quiz ${quizNum}/10: "${quiz.answer}"...`);

          // Estimate gas
          const gasEstimate = await contract.createQuiz.estimateGas(
            quiz.answer, quiz.reward, quiz.category, quiz.difficulty
          );

          // Create quiz with higher gas limit
          const tx = await contract.createQuiz(
            quiz.answer,
            quiz.reward,
            quiz.category,
            quiz.difficulty,
            {
              gasLimit: gasEstimate * 2n, // 2x safety margin
            }
          );

          setDeployStatus(`⏳ Quiz ${quizNum} submitted. Waiting for confirmation... (${tx.hash.slice(0, 10)}...)`);

          const receipt = await tx.wait();
          
          if (receipt?.status === 1) {
            successCount++;
            setDeployedCount(successCount);
            setDeployStatus(`✅ Quiz ${quizNum} deployed successfully! (${successCount}/10 complete)`);
          } else {
            throw new Error(`Transaction failed for Quiz ${quizNum}`);
          }

          // Wait 2 seconds between transactions
          if (i < EMERGENCY_QUIZZES.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }

        } catch (error) {
          console.error(`Failed to create Quiz ${quizNum}:`, error);
          setDeployStatus(`❌ Quiz ${quizNum} failed: ${(error as Error).message}`);
          
          // Continue with next quiz instead of stopping
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (successCount === 10) {
        setDeployStatus(`🎉 SUCCESS! All 10 quizzes deployed to Base blockchain! Users can now participate.`);
      } else {
        setDeployStatus(`⚠️ Partial success: ${successCount}/10 quizzes deployed. Some quizzes may need retry.`);
      }

      // Final verification
      const nextQuizId = await contract.nextQuizId();
      const totalQuizzes = parseInt(nextQuizId.toString()) - 1;
      
      if (totalQuizzes >= 10) {
        setDeployStatus(`🎊 DEPLOYMENT COMPLETE! ${totalQuizzes} quizzes now available on blockchain. Quiz system is LIVE!`);
      }

    } catch (error) {
      console.error('Deployment error:', error);
      setDeployStatus(`❌ Deployment failed: ${(error as Error).message}`);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="bg-red-600/20 border border-red-500 rounded-lg p-6">
      <div className="text-center space-y-4">
        <div className="text-4xl mb-4">🚨</div>
        <h3 className="text-2xl font-bold text-red-300">Emergency Quiz Deployment</h3>
        
        <div className="bg-black/30 rounded-lg p-4 space-y-2">
          <p className="text-red-200">
            <strong>Critical Issue:</strong> No quizzes exist on Base blockchain
          </p>
          <p className="text-red-200">
            <strong>Required Action:</strong> Contract owner must deploy quiz questions
          </p>
          <p className="text-yellow-200">
            <strong>Owner Address:</strong> 0x27650088aD441cE2a10256381246F952F80d51b3
          </p>
        </div>

        {deployStatus && (
          <div className="bg-blue-600/20 border border-blue-500 rounded-lg p-4">
            <p className="text-blue-200 font-mono text-sm">{deployStatus}</p>
            {deployedCount > 0 && (
              <div className="mt-2">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(deployedCount / 10) * 100}%` }}
                  />
                </div>
                <p className="text-green-400 text-sm mt-1">{deployedCount}/10 quizzes deployed</p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={deployQuizzes}
          disabled={isDeploying}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-bold text-white"
        >
          {isDeploying ? '🔄 Deploying Quizzes...' : '🚀 Emergency Deploy Quizzes'}
        </button>

        <p className="text-xs text-gray-400">
          This will create 10 quiz questions on Base blockchain.
          <br />
          Only the contract owner can execute this action.
        </p>
      </div>
    </div>
  );
}