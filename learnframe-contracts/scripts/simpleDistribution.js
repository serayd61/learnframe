import hre from "hardhat";
const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();
  
  const LearnToken = await ethers.getContractAt(
    "LearnToken", 
    "0xcc2768B27B389aE8999fBF93478E8BBa8485c461"
  );
  
  // Sadece quiz rewards'ı transfer et (40M)
  const batchQuiz = "0x749cdd9355254782828eDae7D85212A2e408D14c";
  const rewardAmount = ethers.parseUnits("40000000", 18);
  
  console.log("Transferring 40M LEARN to Quiz Contract...");
  const tx = await LearnToken.transfer(batchQuiz, rewardAmount);
  await tx.wait();
  
  console.log("✅ Done! Quiz contract now has 40M LEARN");
  console.log("📊 Remaining in your wallet: 60M LEARN");
  console.log("\nYou can distribute the rest later as needed:");
  console.log("- 20M for team");
  console.log("- 20M for liquidity");
  console.log("- 10M for marketing");
  console.log("- 10M for treasury");
}

main();
