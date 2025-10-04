import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("Deploying BatchQuizManager...");
  
  // Existing contract addresses on Base Sepolia
  const learnTokenAddress = "0xcc2768B27B389aE8999fBF93478E8BBa8485c461";
  const leaderboardAddress = "0x62Ad46dA54b11358A73b3A009a56BDe154C38AF8";
  
  const BatchQuizManager = await ethers.getContractFactory("BatchQuizManager");
  const batchQuiz = await BatchQuizManager.deploy(learnTokenAddress, leaderboardAddress);
  await batchQuiz.waitForDeployment();
  
  const batchQuizAddress = await batchQuiz.getAddress();
  console.log("✅ BatchQuizManager deployed to:", batchQuizAddress);
  
  // Grant minting permission
  const LearnToken = await ethers.getContractAt("LearnToken", learnTokenAddress);
  await LearnToken.setQuizManager(batchQuizAddress);
  console.log("✅ BatchQuizManager authorized for minting");
  
  console.log("\n📋 BatchQuizManager Address:", batchQuizAddress);
  console.log("✅ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
