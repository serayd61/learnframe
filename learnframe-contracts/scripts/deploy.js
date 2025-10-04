import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("Deploying LearnFrame contracts...");
  
  // 1. LearnToken deploy
  console.log("\n1. Deploying LearnToken...");
  const LearnToken = await ethers.getContractFactory("LearnToken");
  const learnToken = await LearnToken.deploy();
  await learnToken.waitForDeployment();
  const learnTokenAddress = await learnToken.getAddress();
  console.log("✅ LearnToken deployed to:", learnTokenAddress);
  
  // 2. QuizManager deploy
  console.log("\n2. Deploying QuizManager...");
  const QuizManager = await ethers.getContractFactory("QuizManager");
  const quizManager = await QuizManager.deploy(learnTokenAddress);
  await quizManager.waitForDeployment();
  const quizManagerAddress = await quizManager.getAddress();
  console.log("✅ QuizManager deployed to:", quizManagerAddress);
  
  // 3. Set permissions
  console.log("\n3. Setting permissions...");
  await learnToken.setQuizManager(quizManagerAddress);
  console.log("✅ QuizManager authorized for minting");
  
  console.log("\n📋 Deployed Contract Addresses:");
  console.log("================================");
  console.log("LearnToken:", learnTokenAddress);
  console.log("QuizManager:", quizManagerAddress);
  console.log("================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
