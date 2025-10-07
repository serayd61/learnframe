const { ethers } = require('ethers');
const QuizManagerABI = require('../lib/contracts/QuizManagerV2.json');

// URGENT: Create missing quizzes on mainnet
async function createQuizzesUrgent() {
  try {
    console.log('🚨 URGENT: Creating missing quizzes on Base Mainnet...');
    
    // Base mainnet RPC
    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    
    // You need to provide the deployer private key
    const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
    
    if (!DEPLOYER_PRIVATE_KEY) {
      console.log('❌ DEPLOYER_PRIVATE_KEY environment variable required');
      console.log('Usage: DEPLOYER_PRIVATE_KEY=0x... node scripts/create-quizzes-urgent.js');
      return;
    }
    
    const wallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);
    console.log('🔑 Deployer address:', wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log('💰 Balance:', ethers.formatEther(balance), 'ETH');
    
    if (balance < ethers.parseEther('0.002')) {
      console.log('❌ Insufficient balance for gas fees (need at least 0.002 ETH)');
      return;
    }
    
    const CONTRACT_ADDRESS = '0xEfb23c57042C21271ff19e1FB5CfFD1A49bD5f61';
    const contract = new ethers.Contract(CONTRACT_ADDRESS, QuizManagerABI.abi, wallet);
    
    // Check current state
    console.log('\n📊 Current contract state:');
    const nextQuizId = await contract.nextQuizId();
    console.log('Next Quiz ID:', nextQuizId.toString());
    
    // Check if we're the owner
    const owner = await contract.owner();
    console.log('Contract owner:', owner);
    console.log('Our address:', wallet.address);
    
    if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
      console.log('❌ ERROR: You are not the contract owner!');
      console.log('Only the contract owner can create quizzes.');
      return;
    }
    
    // Extended quiz data - 10 questions total
    const quizzes = [
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
    
    console.log(`\n🎯 Creating ${quizzes.length} quizzes...`);
    
    let createdCount = 0;
    
    for (let i = 0; i < quizzes.length; i++) {
      const quiz = quizzes[i];
      const quizId = i + 1;
      
      try {
        // Check if quiz already exists
        const existingQuiz = await contract.quizzes(quizId);
        if (existingQuiz.active) {
          console.log(`📝 Quiz ${quizId} already exists and is active`);
          continue;
        }
        
        console.log(`\n📝 Creating Quiz ${quizId}:`);
        console.log(`   Question: Quiz ${quizId}`);
        console.log(`   Answer: "${quiz.answer}"`);
        console.log(`   Reward: ${quiz.reward} LEARN`);
        console.log(`   Category: ${quiz.category}`);
        
        // Estimate gas
        const gasEstimate = await contract.createQuiz.estimateGas(
          quiz.answer, quiz.reward, quiz.category, quiz.difficulty
        );
        console.log(`   Gas estimate: ${gasEstimate.toString()}`);
        
        // Create quiz
        const tx = await contract.createQuiz(
          quiz.answer,
          quiz.reward, 
          quiz.category,
          quiz.difficulty,
          {
            gasLimit: gasEstimate * 2n, // 2x safety margin
            gasPrice: ethers.parseUnits('0.1', 'gwei') // Low gas price for Base
          }
        );
        
        console.log(`   📡 TX Hash: ${tx.hash}`);
        console.log(`   ⏳ Waiting for confirmation...`);
        
        const receipt = await tx.wait();
        
        if (receipt?.status === 1) {
          console.log(`   ✅ Quiz ${quizId} created successfully!`);
          console.log(`   ⛽ Gas used: ${receipt.gasUsed.toString()}`);
          createdCount++;
        } else {
          console.log(`   ❌ Quiz ${quizId} transaction failed`);
        }
        
        // Wait 2 seconds between transactions
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`   ❌ Failed to create Quiz ${quizId}:`);
        console.error(`   Error: ${error.message}`);
        
        if (error.message.includes('insufficient funds')) {
          console.log('   💸 Insufficient gas fees - stopping');
          break;
        }
      }
    }
    
    // Final verification
    console.log('\n🔍 Final verification:');
    const finalNextQuizId = await contract.nextQuizId();
    console.log(`Next Quiz ID: ${finalNextQuizId}`);
    console.log(`Quizzes created this session: ${createdCount}`);
    
    for (let i = 1; i < finalNextQuizId; i++) {
      try {
        const quiz = await contract.quizzes(i);
        console.log(`Quiz ${i}: ✅ active=${quiz.active}, reward=${quiz.reward}, category="${quiz.category}"`);
      } catch (error) {
        console.log(`Quiz ${i}: ❌ Error reading - ${error.message}`);
      }
    }
    
    if (createdCount > 0) {
      console.log('\n🎉 Quiz creation complete!');
      console.log('🔗 Users can now take quizzes on LearnFrame');
      console.log(`📊 Total active quizzes: ${finalNextQuizId - 1}`);
    } else {
      console.log('\n⚠️ No new quizzes created (they may already exist)');
    }
    
  } catch (error) {
    console.error('💥 Quiz creation failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  createQuizzesUrgent();
}

module.exports = { createQuizzesUrgent };