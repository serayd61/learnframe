const { ethers } = require('ethers');
const QuizManagerABI = require('../lib/contracts/QuizManagerV2.json');

// Bu script quiz'leri kontrata ekler - sadece contract owner çalıştırabilir
async function addQuizzes() {
  try {
    // Base mainnet RPC
    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    
    // Contract owner private key gerekli (güvenlik için env'den alınmalı)
    const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
    
    if (!PRIVATE_KEY) {
      console.log('❌ DEPLOYER_PRIVATE_KEY environment variable required');
      console.log('This script must be run by the contract owner');
      return;
    }
    
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    const CONTRACT_ADDRESS = '0xEfb23c57042C21271ff19e1FB5CfFD1A49bD5f61';
    const contract = new ethers.Contract(CONTRACT_ADDRESS, QuizManagerABI.abi, wallet);
    
    console.log('🎯 Adding quizzes to QuizManager...');
    console.log('Contract:', CONTRACT_ADDRESS);
    console.log('Signer:', wallet.address);
    
    // Quiz'ler (Quiz component'teki ile aynı)
    const quizzes = [
      { answer: "ETH", reward: 10, category: "Base", difficulty: 1 },
      { answer: "Coinbase", reward: 10, category: "Base", difficulty: 1 },
      { answer: "Optimism", reward: 15, category: "Base", difficulty: 2 },
      { answer: "Yes", reward: 10, category: "Base", difficulty: 1 },
      { answer: "Proof of Stake", reward: 20, category: "Consensus", difficulty: 3 }
    ];
    
    for (let i = 0; i < quizzes.length; i++) {
      const quiz = quizzes[i];
      console.log(`\n📝 Creating Quiz ${i + 1}: ${quiz.category}`);
      console.log(`Answer: ${quiz.answer}, Reward: ${quiz.reward}`);
      
      try {
        const tx = await contract.createQuiz(
          quiz.answer,
          quiz.reward,
          quiz.category,
          quiz.difficulty
        );
        
        console.log('⏳ Transaction submitted:', tx.hash);
        const receipt = await tx.wait();
        console.log('✅ Quiz created successfully!');
        
      } catch (error) {
        console.error(`❌ Failed to create quiz ${i + 1}:`, error.message);
      }
    }
    
    // Verify quizzes were created
    console.log('\n🔍 Verifying quizzes...');
    const nextQuizId = await contract.nextQuizId();
    console.log('Next quiz ID:', nextQuizId.toString());
    
    for (let i = 1; i < nextQuizId; i++) {
      const quiz = await contract.quizzes(i);
      console.log(`Quiz ${i}: active=${quiz.active}, reward=${quiz.reward}, category=${quiz.category}`);
    }
    
    console.log('✅ All quizzes added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding quizzes:', error);
  }
}

// Only run if called directly
if (require.main === module) {
  addQuizzes();
}

module.exports = { addQuizzes };