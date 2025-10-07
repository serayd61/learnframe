const { ethers } = require('ethers');
const QuizManagerABI = require('../lib/contracts/QuizManagerV2.json');

async function checkOwner() {
  try {
    console.log('🔍 Checking contract owner...');
    
    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    const CONTRACT_ADDRESS = '0xEfb23c57042C21271ff19e1FB5CfFD1A49bD5f61';
    const contract = new ethers.Contract(CONTRACT_ADDRESS, QuizManagerABI.abi, provider);
    
    // Check owner
    const owner = await contract.owner();
    console.log('🔐 Contract owner:', owner);
    
    // Check owner balance
    const balance = await provider.getBalance(owner);
    console.log('💰 Owner balance:', ethers.formatEther(balance), 'ETH');
    
    // Check if owner has enough for transactions
    if (balance < ethers.parseEther('0.001')) {
      console.log('⚠️ Owner has insufficient balance for gas fees');
    } else {
      console.log('✅ Owner has sufficient balance for transactions');
    }
    
    // Check contract state
    const nextQuizId = await contract.nextQuizId();
    console.log('📊 Current nextQuizId:', nextQuizId.toString());
    
    if (nextQuizId === 1n) {
      console.log('❌ NO QUIZZES CREATED - Contract is empty!');
      console.log('🚨 URGENT: Owner needs to create quizzes immediately');
      console.log('');
      console.log('📋 TO FIX THIS:');
      console.log('1. Get the owner private key');
      console.log('2. Run: DEPLOYER_PRIVATE_KEY=0x... node scripts/create-quizzes-urgent.js');
      console.log('3. Or use the /admin panel on the website');
    } else {
      console.log('✅ Quizzes exist on contract');
    }
    
    // Suggest immediate action
    console.log('\n🔧 EMERGENCY QUIZ CREATION:');
    console.log('Since users are getting "Quiz not active" errors,');
    console.log('the contract owner MUST create quizzes NOW:');
    console.log('');
    console.log('Option 1 - Command Line:');
    console.log('export DEPLOYER_PRIVATE_KEY=0x[owner-private-key]');
    console.log('node scripts/create-quizzes-urgent.js');
    console.log('');
    console.log('Option 2 - Web Interface:');
    console.log('1. Go to https://learnframe.vercel.app/admin');
    console.log('2. Connect with owner wallet');
    console.log('3. Click "Create Missing Quizzes"');
    
  } catch (error) {
    console.error('❌ Error checking owner:', error.message);
  }
}

checkOwner();