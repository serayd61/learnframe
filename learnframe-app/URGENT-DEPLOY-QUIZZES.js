#!/usr/bin/env node

/**
 * URGENT QUIZ DEPLOYMENT SCRIPT
 * 
 * This script MUST be run by the contract owner to fix the "Quiz not active" error
 * 
 * Usage:
 * 1. Get the contract owner private key
 * 2. Run: DEPLOYER_PRIVATE_KEY=0x[your-private-key] node URGENT-DEPLOY-QUIZZES.js
 */

const { ethers } = require('ethers');

const QUIZ_MANAGER_ADDRESS = '0xEfb23c57042C21271ff19e1FB5CfFD1A49bD5f61';
const BASE_RPC = 'https://mainnet.base.org';

const ABI = [
  'function createQuiz(string memory _correctAnswer, uint256 _reward, string memory _category, uint8 _difficulty) external returns (uint256)',
  'function owner() view returns (address)',
  'function nextQuizId() view returns (uint256)'
];

const QUIZZES = [
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

async function deployQuizzes() {
  console.log('🚨 URGENT QUIZ DEPLOYMENT STARTING...\n');

  try {
    // Check private key
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    if (!privateKey) {
      console.error('❌ ERROR: DEPLOYER_PRIVATE_KEY environment variable is required');
      console.error('Usage: DEPLOYER_PRIVATE_KEY=0x... node URGENT-DEPLOY-QUIZZES.js');
      process.exit(1);
    }

    // Connect to Base
    console.log('🔗 Connecting to Base mainnet...');
    const provider = new ethers.JsonRpcProvider(BASE_RPC);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log(`🔑 Deployer address: ${wallet.address}`);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);
    
    if (balance < ethers.parseEther('0.002')) {
      console.error('❌ Insufficient balance! Need at least 0.002 ETH for gas fees');
      process.exit(1);
    }

    // Connect to contract
    const contract = new ethers.Contract(QUIZ_MANAGER_ADDRESS, ABI, wallet);
    
    // Verify owner
    const owner = await contract.owner();
    if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
      console.error(`❌ Access denied! Contract owner is ${owner}, you are ${wallet.address}`);
      process.exit(1);
    }
    
    console.log('✅ Contract owner verified!');
    
    // Check current state
    const nextQuizId = await contract.nextQuizId();
    console.log(`📊 Current nextQuizId: ${nextQuizId}`);
    
    if (nextQuizId > 1n) {
      console.log('⚠️  Some quizzes may already exist. Continuing...');
    }

    console.log(`\n🎯 Deploying ${QUIZZES.length} quizzes to Base blockchain...\n`);

    let successCount = 0;
    
    for (let i = 0; i < QUIZZES.length; i++) {
      const quiz = QUIZZES[i];
      const quizNum = i + 1;
      
      try {
        console.log(`📝 Quiz ${quizNum}/10: "${quiz.answer}" (${quiz.category})`);
        
        // Estimate gas
        const gasEstimate = await contract.createQuiz.estimateGas(
          quiz.answer, quiz.reward, quiz.category, quiz.difficulty
        );
        
        // Create quiz
        const tx = await contract.createQuiz(
          quiz.answer,
          quiz.reward,
          quiz.category,
          quiz.difficulty,
          {
            gasLimit: gasEstimate * 2n,
            gasPrice: ethers.parseUnits('0.1', 'gwei') // Low gas price for Base
          }
        );
        
        console.log(`   📡 TX: ${tx.hash}`);
        console.log(`   ⏳ Confirming...`);
        
        const receipt = await tx.wait();
        
        if (receipt?.status === 1) {
          successCount++;
          console.log(`   ✅ SUCCESS! Gas used: ${receipt.gasUsed}`);
        } else {
          console.log(`   ❌ FAILED! Transaction reverted`);
        }
        
        // Delay between transactions
        if (i < QUIZZES.length - 1) {
          console.log(`   ⏸️  Waiting 2 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error) {
        console.error(`   ❌ ERROR: ${error.message}`);
      }
      
      console.log(); // Empty line for readability
    }

    // Final verification
    console.log('🔍 Final verification...');
    const finalNextQuizId = await contract.nextQuizId();
    const totalQuizzes = parseInt(finalNextQuizId.toString()) - 1;
    
    console.log(`\n📊 DEPLOYMENT SUMMARY:`);
    console.log(`   Successful: ${successCount}/${QUIZZES.length}`);
    console.log(`   Total quizzes on chain: ${totalQuizzes}`);
    
    if (totalQuizzes >= 10) {
      console.log(`\n🎉 SUCCESS! Quiz system is now LIVE on Base!`);
      console.log(`Users can now participate in quizzes and earn LEARN tokens.`);
      console.log(`\n🔗 Check your contract: https://basescan.org/address/${QUIZ_MANAGER_ADDRESS}`);
    } else {
      console.log(`\n⚠️  Warning: Only ${totalQuizzes} quizzes available. Users may still see errors.`);
      console.log(`Consider running this script again to ensure all 10 quizzes are created.`);
    }

  } catch (error) {
    console.error(`\n💥 DEPLOYMENT FAILED: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  deployQuizzes().catch(console.error);
}

module.exports = { deployQuizzes };