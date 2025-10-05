import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("\n🔍 Checking LEARN Token Supply...\n");
  
  // Base Sepolia'daki mevcut contract adresleri
  const contracts = {
    LearnToken: "0xcc2768B27B389aE8999fBF93478E8BBa8485c461",
    QuizManagerV2: "0x23b0AD74eC0B170396584d3226aF65Af8446990f",
    BatchQuizManager: "0x749cdd9355254782828eDae7D85212A2e408D14c"
  };
  
  // Token contract'a bağlan
  const LearnToken = await ethers.getContractAt(
    "LearnToken", 
    contracts.LearnToken
  );
  
  // Deployer address
  const [deployer] = await ethers.getSigners();
  
  // Total supply kontrolü
  const totalSupply = await LearnToken.totalSupply();
  const decimals = await LearnToken.decimals();
  
  console.log("Token Details:");
  console.log("==============");
  console.log("Total Supply (raw):", totalSupply.toString());
  console.log("Total Supply (formatted):", ethers.formatUnits(totalSupply, decimals), "LEARN");
  console.log("Decimals:", decimals.toString());
  
  // Deployer balance
  const deployerBalance = await LearnToken.balanceOf(deployer.address);
  console.log("\nDeployer Wallet:");
  console.log("Address:", deployer.address);
  console.log("Balance:", ethers.formatUnits(deployerBalance, decimals), "LEARN");
  
  // Quiz Manager balances
  const quizManagerBalance = await LearnToken.balanceOf(contracts.QuizManagerV2);
  const batchQuizBalance = await LearnToken.balanceOf(contracts.BatchQuizManager);
  
  console.log("\nContract Balances:");
  console.log("QuizManagerV2:", ethers.formatUnits(quizManagerBalance, decimals), "LEARN");
  console.log("BatchQuizManager:", ethers.formatUnits(batchQuizBalance, decimals), "LEARN");
  
  // Minting permissions
  const quizManagerRole = await LearnToken.quizManager();
  console.log("\nMinting Permissions:");
  console.log("Current Quiz Manager:", quizManagerRole);
  
  // Max supply check
  const maxSupply = await LearnToken.maxSupply();
  console.log("\nSupply Limits:");
  console.log("Max Supply:", ethers.formatUnits(maxSupply, decimals), "LEARN");
  console.log("Remaining mintable:", ethers.formatUnits(maxSupply - totalSupply, decimals), "LEARN");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
