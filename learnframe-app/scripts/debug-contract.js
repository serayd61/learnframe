const { ethers } = require('ethers');
const QuizManagerABI = require('../lib/contracts/QuizManagerV2.json');

async function debugContract() {
  try {
    // Base mainnet RPC
    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    
    const CONTRACT_ADDRESS = '0xEfb23c57042C21271ff19e1FB5CfFD1A49bD5f61';
    const contract = new ethers.Contract(CONTRACT_ADDRESS, QuizManagerABI.abi, provider);
    
    console.log('🔍 Debugging QuizManager contract...');
    console.log('Contract address:', CONTRACT_ADDRESS);
    
    // Check next quiz ID
    const nextQuizId = await contract.nextQuizId();
    console.log('Next quiz ID:', nextQuizId.toString());
    
    // Check quiz 1 details
    try {
      const quiz1 = await contract.quizzes(1);
      console.log('Quiz 1:', {
        creator: quiz1.creator,
        answerHash: quiz1.answerHash,
        reward: quiz1.reward.toString(),
        category: quiz1.category,
        difficulty: quiz1.difficulty,
        completions: quiz1.completions.toString(),
        active: quiz1.active
      });
    } catch (error) {
      console.log('❌ Quiz 1 does not exist');
    }
    
    // Check LearnToken address
    const learnTokenAddress = await contract.learnToken();
    console.log('LearnToken address:', learnTokenAddress);
    
    // Check Leaderboard address  
    const leaderboardAddress = await contract.leaderboard();
    console.log('Leaderboard address:', leaderboardAddress);
    
    // Check owner
    const owner = await contract.owner();
    console.log('Contract owner:', owner);
    
    console.log('✅ Contract debugging complete');
    
  } catch (error) {
    console.error('❌ Error debugging contract:', error);
  }
}

debugContract();