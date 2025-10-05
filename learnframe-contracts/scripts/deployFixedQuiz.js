import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("\n🚀 Deploying Fixed BatchQuizManager\n");
  
  const [deployer] = await ethers.getSigners();
  const tokenAddress = "0xcc2768B27B389aE8999fBF93478E8BBa8485c461";
  
  // Deploy new contract
  const BatchQuizManagerFixed = await ethers.getContractFactory("BatchQuizManagerFixed");
  const batchQuiz = await BatchQuizManagerFixed.deploy(tokenAddress);
  await batchQuiz.waitForDeployment();
  
  const quizAddress = await batchQuiz.getAddress();
  console.log("✅ BatchQuizManagerFixed deployed to:", quizAddress);
  
  // Transfer 10M LEARN to the contract
  const LearnToken = await ethers.getContractAt("LearnToken", tokenAddress);
  const amount = ethers.parseUnits("10000000", 18);
  
  console.log("\nTransferring 10M LEARN to new contract...");
  const tx = await LearnToken.transfer(quizAddress, amount);
  await tx.wait();
  console.log("✅ 10M LEARN transferred");
  
  // Verify
  const balance = await LearnToken.balanceOf(quizAddress);
  console.log("\nContract balance:", ethers.formatUnits(balance, 18), "LEARN");
  
  console.log("\n📋 IMPORTANT: Update your .env.local file:");
  console.log("NEXT_PUBLIC_BATCH_QUIZ=" + quizAddress);
  
  // Also update Vercel env
  console.log("\nAlso update in Vercel Dashboard:");
  console.log("1. Go to vercel.com/dashboard");
  console.log("2. Select your project");
  console.log("3. Settings > Environment Variables");
  console.log("4. Update NEXT_PUBLIC_BATCH_QUIZ");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
