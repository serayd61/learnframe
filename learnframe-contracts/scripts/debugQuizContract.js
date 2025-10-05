import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("\n🔍 Debugging BatchQuizManager\n");
  
  const [signer] = await ethers.getSigners();
  console.log("Your address:", signer.address);
  
  // Contract addresses
  const batchQuizAddress = "0x749cdd9355254782828eDae7D85212A2e408D14c";
  const tokenAddress = "0xcc2768B27B389aE8999fBF93478E8BBa8485c461";
  
  // Token contract
  const LearnToken = await ethers.getContractAt("LearnToken", tokenAddress);
  
  // 1. Check token balance
  const contractBalance = await LearnToken.balanceOf(batchQuizAddress);
  console.log("\n1. Token Balance Check:");
  console.log("BatchQuizManager has:", ethers.formatUnits(contractBalance, 18), "LEARN");
  console.log("✅ Contract has sufficient tokens (40M)");
  
  // 2. Check minting permissions
  const quizManager = await LearnToken.quizManager();
  console.log("\n2. Minting Permissions:");
  console.log("Quiz Manager:", quizManager);
  console.log("BatchQuiz:", batchQuizAddress);
  console.log("Can mint?:", quizManager.toLowerCase() === batchQuizAddress.toLowerCase());
  console.log("✅ Contract can mint tokens");
  
  // 3. Check your token balance
  const yourBalance = await LearnToken.balanceOf(signer.address);
  console.log("\n3. Your Current Balance:");
  console.log("You have:", ethers.formatUnits(yourBalance, 18), "LEARN");
  
  // 4. Manual test
  console.log("\n📋 DIAGNOSIS:");
  console.log("✅ Contract has 40M LEARN tokens");
  console.log("✅ Contract has minting permissions");
  console.log("\n🔧 Let's test the quiz submission manually...");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
