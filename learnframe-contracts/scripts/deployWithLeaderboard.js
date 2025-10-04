import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("Deploying LearnFrame with Leaderboard...");
  
  // 1. LearnToken
  console.log("\n1. Deploying LearnToken...");
  const LearnToken = await ethers.getContractFactory("LearnToken");
  const learnToken = await LearnToken.deploy();
  await learnToken.waitForDeployment();
  const learnTokenAddress = await learnToken.getAddress();
  console.log("✅ LearnToken deployed to:", learnTokenAddress);
  
  // 2. Leaderboard
  console.log("\n2. Deploying Leaderboard...");
  const Leaderboard = await ethers.getContractFactory("Leaderboard");
  const leaderboard = await Leaderboard.deploy();
  await leaderboard.waitForDeployment();
  const leaderboardAddress = await leaderboard.getAddress();
  console.log("✅ Leaderboard deployed to:", leaderboardAddress);
  
  // 3. QuizManagerV2
  console.log("\n3. Deploying QuizManagerV2...");
  const QuizManagerV2 = await ethers.getContractFactory("QuizManagerV2");
  const quizManager = await QuizManagerV2.deploy(learnTokenAddress, leaderboardAddress);
  await quizManager.waitForDeployment();
  const quizManagerAddress = await quizManager.getAddress();
  console.log("✅ QuizManagerV2 deployed to:", quizManagerAddress);
  
  // 4. Permissions
  console.log("\n4. Setting permissions...");
  await learnToken.setQuizManager(quizManagerAddress);
  console.log("✅ QuizManager authorized for minting");
  
  await leaderboard.transferOwnership(quizManagerAddress);
  console.log("✅ QuizManager owns Leaderboard");
  
  console.log("\n📋 Deployed Addresses:");
  console.log("================================");
  console.log("LearnToken:", learnTokenAddress);
  console.log("Leaderboard:", leaderboardAddress);
  console.log("QuizManagerV2:", quizManagerAddress);
  console.log("================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
