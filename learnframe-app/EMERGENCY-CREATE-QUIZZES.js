#!/usr/bin/env node

/**
 * EMERGENCY QUIZ CREATOR
 * 
 * This script creates quizzes with a funded wallet to solve the immediate crisis.
 * Contract owner needs private key to run this.
 */

const { ethers } = require('ethers');

// Base mainnet configuration
const BASE_RPC = 'https://mainnet.base.org';
const CONTRACT_ADDRESS = '0xEfb23c57042C21271ff19e1FB5CfFD1A49bD5f61';
const KNOWN_OWNER = '0x27650088aD441cE2a10256381246F952F80d51b3';

const ABI = [
  'function createQuiz(string memory _correctAnswer, uint256 _reward, string memory _category, uint8 _difficulty) external returns (uint256)',
  'function owner() view returns (address)',
  'function nextQuizId() view returns (uint256)',
  'function quizzes(uint256) view returns (address creator, bytes32 answerHash, uint256 reward, string memory category, uint8 difficulty, uint256 completions, bool active)'
];

const QUIZ_DATA = [
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

async function emergencyCreateQuizzes() {
  console.log('🚨 EMERGENCY QUIZ CREATION - SOLVING USER TRANSACTION FAILURES\n');

  try {
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY || process.env.OWNER_PRIVATE_KEY || process.env.PRIVATE_KEY;
    
    if (!privateKey) {
      console.error('❌ CRITICAL: No private key provided!');
      console.error('Usage:');
      console.error('  DEPLOYER_PRIVATE_KEY=0x... node EMERGENCY-CREATE-QUIZZES.js');
      console.error('  OR');
      console.error('  OWNER_PRIVATE_KEY=0x... node EMERGENCY-CREATE-QUIZZES.js');
      console.error('  OR');
      console.error('  PRIVATE_KEY=0x... node EMERGENCY-CREATE-QUIZZES.js');
      console.error('\n🔑 Required: Contract owner private key');
      console.error(`📍 Owner address: ${KNOWN_OWNER}`);
      process.exit(1);
    }

    // Connect to Base mainnet
    console.log('🔗 Connecting to Base mainnet...');
    const provider = new ethers.JsonRpcProvider(BASE_RPC);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log(`🔑 Wallet address: ${wallet.address}`);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);
    
    if (balance < ethers.parseEther('0.001')) {
      console.error('❌ INSUFFICIENT BALANCE!');
      console.error('Need at least 0.001 ETH for gas fees');
      console.error('Please add ETH to wallet and try again');
      process.exit(1);
    }

    // Connect to contract
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
    
    // Verify ownership
    console.log('\n🔐 Verifying contract ownership...');
    const actualOwner = await contract.owner();
    console.log(`Contract owner: ${actualOwner}`);
    console.log(`Your address: ${wallet.address}`);
    
    if (actualOwner.toLowerCase() !== wallet.address.toLowerCase()) {
      console.error('❌ OWNERSHIP ERROR!');
      console.error('You are not the contract owner.');
      console.error(`Expected: ${actualOwner}`);
      console.error(`Got: ${wallet.address}`);
      process.exit(1);
    }
    
    console.log('✅ Ownership verified!');

    // Check current state
    const nextQuizId = await contract.nextQuizId();
    console.log(`\n📊 Current state: nextQuizId = ${nextQuizId}`);
    
    if (nextQuizId > 1n) {
      console.log('⚠️ Some quizzes may already exist');
      
      // Check existing quizzes
      for (let i = 1; i < nextQuizId; i++) {
        try {
          const quiz = await contract.quizzes(i);
          console.log(`Quiz ${i}: active=${quiz.active}, reward=${quiz.reward}`);
        } catch (error) {
          console.log(`Quiz ${i}: Error reading`);
        }
      }
    }

    console.log(`\n🎯 CREATING ${QUIZ_DATA.length} QUIZZES TO FIX USER TRANSACTIONS...\n`);

    let successCount = 0;
    
    for (let i = 0; i < QUIZ_DATA.length; i++) {
      const quiz = QUIZ_DATA[i];
      const quizNum = i + 1;
      
      console.log(`\n📝 [${quizNum}/10] Creating quiz: "${quiz.answer}"`);
      console.log(`   Category: ${quiz.category}`);
      console.log(`   Reward: ${quiz.reward} LEARN`);
      console.log(`   Difficulty: ${quiz.difficulty}`);
      
      try {
        // Estimate gas
        console.log('   ⛽ Estimating gas...');
        const gasEstimate = await contract.createQuiz.estimateGas(
          quiz.answer, quiz.reward, quiz.category, quiz.difficulty
        );
        console.log(`   Gas estimate: ${gasEstimate.toString()}`);
        
        // Create transaction
        console.log('   📡 Sending transaction...');
        const tx = await contract.createQuiz(
          quiz.answer,
          quiz.reward,
          quiz.category,
          quiz.difficulty,
          {
            gasLimit: gasEstimate * 120n / 100n, // 20% extra
            gasPrice: ethers.parseUnits('0.1', 'gwei') // Low gas for Base
          }
        );
        
        console.log(`   TX: ${tx.hash}`);
        console.log('   ⏳ Waiting for confirmation...');
        
        const receipt = await tx.wait();
        
        if (receipt?.status === 1) {
          successCount++;
          console.log(`   ✅ SUCCESS! Quiz ${quizNum} created`);
          console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
        } else {
          console.log(`   ❌ FAILED! Transaction reverted`);
        }
        
        // Wait between transactions
        if (i < QUIZ_DATA.length - 1) {
          console.log('   ⏸️ Waiting 3 seconds...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
      } catch (error) {
        console.error(`   ❌ ERROR: ${error.message}`);
        
        if (error.message.includes('insufficient funds')) {
          console.error('   💸 Insufficient gas - aborting');
          break;
        }
      }
    }

    // Final verification
    console.log('\n🔍 VERIFICATION:');
    const finalNextQuizId = await contract.nextQuizId();
    const totalQuizzes = parseInt(finalNextQuizId.toString()) - 1;
    
    console.log(`Created: ${successCount}/${QUIZ_DATA.length}`);
    console.log(`Total on blockchain: ${totalQuizzes}`);
    
    if (totalQuizzes >= 10) {
      console.log('\n🎉 SUCCESS! QUIZ SYSTEM IS NOW LIVE!');
      console.log('✅ Users can now take quizzes without transaction failures');
      console.log('✅ LEARN tokens will be minted for correct answers');
      console.log('✅ Advanced scoring system is active');
      console.log('\n🔗 Verify on BaseScan:');
      console.log(`https://basescan.org/address/${CONTRACT_ADDRESS}`);
    } else {
      console.log('\n⚠️ PARTIAL SUCCESS');
      console.log(`Only ${totalQuizzes}/10 quizzes available`);
      console.log('Users may still encounter some transaction failures');
      console.log('Consider running this script again');
    }

  } catch (error) {
    console.error('\n💥 EMERGENCY DEPLOYMENT FAILED:');
    console.error(error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  emergencyCreateQuizzes();
}

module.exports = { emergencyCreateQuizzes };