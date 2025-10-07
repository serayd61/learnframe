const { ethers } = require('ethers');
const QuizManagerABI = require('../lib/contracts/QuizManagerV2.json');

// Bu script mainnet'te quiz'leri oluşturur
async function deployQuizzes() {
  try {
    console.log('🚀 Deploying quizzes to Base Mainnet...');
    
    // Base mainnet provider
    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    
    // Hardcoded private key for urgent deployment (güvenlik riski - sadece test için)
    // PROD'da environment variable kullanılmalı
    const TEMP_DEPLOYER_KEY = process.env.TEMP_DEPLOYER_KEY;
    
    if (!TEMP_DEPLOYER_KEY) {
      console.log('❌ TEMP_DEPLOYER_KEY required');
      console.log('Set with: export TEMP_DEPLOYER_KEY=0x...');
      return;
    }
    
    const wallet = new ethers.Wallet(TEMP_DEPLOYER_KEY, provider);
    console.log('📝 Deployer address:', wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log('💰 Balance:', ethers.formatEther(balance), 'ETH');
    
    if (balance < ethers.parseEther('0.001')) {
      console.log('❌ Insufficient balance for gas fees');
      return;
    }
    
    const CONTRACT_ADDRESS = '0xEfb23c57042C21271ff19e1FB5CfFD1A49bD5f61';
    const contract = new ethers.Contract(CONTRACT_ADDRESS, QuizManagerABI.abi, wallet);
    
    // Check if we're the owner
    try {
      const owner = await contract.owner();
      console.log('🔐 Contract owner:', owner);
      console.log('🔑 Our address:', wallet.address);
      
      if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
        console.log('❌ Not the contract owner! Cannot create quizzes.');
        return;
      }
    } catch (error) {
      console.error('❌ Cannot check owner:', error.message);
      return;
    }
    
    // Quiz data matching the frontend
    const quizzes = [
      { answer: "ETH", reward: 10, category: "Base", difficulty: 1 },
      { answer: "Coinbase", reward: 10, category: "Base", difficulty: 1 },
      { answer: "Optimism", reward: 15, category: "Base", difficulty: 2 },
      { answer: "Yes", reward: 10, category: "Base", difficulty: 1 },
      { answer: "Proof of Stake", reward: 20, category: "Consensus", difficulty: 3 }
    ];
    
    console.log('🎯 Creating quizzes...');
    
    for (let i = 0; i < quizzes.length; i++) {
      const quiz = quizzes[i];
      console.log(`\n📝 Creating Quiz ${i + 1}:`);
      console.log(`   Answer: "${quiz.answer}"`);
      console.log(`   Reward: ${quiz.reward} LEARN`);
      console.log(`   Category: ${quiz.category}`);
      
      try {
        // Estimate gas first
        const gasEstimate = await contract.createQuiz.estimateGas(
          quiz.answer, quiz.reward, quiz.category, quiz.difficulty
        );
        console.log(`   Gas estimate: ${gasEstimate.toString()}`);
        
        // Create transaction with gas limit
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
          console.log(`   ✅ Quiz ${i + 1} created successfully!`);
          console.log(`   ⛽ Gas used: ${receipt.gasUsed.toString()}`);
        } else {
          console.log(`   ❌ Quiz ${i + 1} transaction failed`);
        }
        
        // Wait 2 seconds between transactions
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`   ❌ Failed to create Quiz ${i + 1}:`);
        console.error(`   Error: ${error.message}`);
        
        if (error.message.includes('insufficient funds')) {
          console.log('   💸 Insufficient gas fees - stopping');
          break;
        }
      }
    }
    
    // Verify final state
    console.log('\n🔍 Verification:');
    const nextQuizId = await contract.nextQuizId();
    console.log(`Next Quiz ID: ${nextQuizId}`);
    
    for (let i = 1; i < nextQuizId; i++) {
      try {
        const quiz = await contract.quizzes(i);
        console.log(`Quiz ${i}: active=${quiz.active}, reward=${quiz.reward}, category="${quiz.category}"`);
      } catch (error) {
        console.log(`Quiz ${i}: Error reading - ${error.message}`);
      }
    }
    
    console.log('\n🎉 Quiz deployment complete!');
    console.log('🔗 Users can now take quizzes on LearnFrame');
    
  } catch (error) {
    console.error('💥 Deployment failed:', error);
  }
}

// Run deployment
if (require.main === module) {
  deployQuizzes();
}

module.exports = { deployQuizzes };