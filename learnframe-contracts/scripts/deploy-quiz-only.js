import hre from "hardhat";
const { ethers } = hre;

async function main() {
  const learnTokenAddress = "0x1Cd95030e189e54755C1ccA28e24891250A79d50";
  
  console.log("Deploying QuizManager...");
  const QuizManager = await ethers.getContractFactory("QuizManager");
  const quizManager = await QuizManager.deploy(learnTokenAddress);
  await quizManager.waitForDeployment();
  const quizManagerAddress = await quizManager.getAddress();
  console.log("✅ QuizManager deployed to:", quizManagerAddress);
  
  console.log("\nSetting permissions...");
  const LearnToken = await ethers.getContractAt("LearnToken", learnTokenAddress);
  await LearnToken.setQuizManager(quizManagerAddress);
  console.log("✅ QuizManager authorized");
  
  console.log("\n📋 Final Addresses:");
  console.log("LearnToken:", learnTokenAddress);
  console.log("QuizManager:", quizManagerAddress);
}

main().catch(console.error);
