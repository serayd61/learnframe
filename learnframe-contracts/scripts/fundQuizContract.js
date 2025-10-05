import hre from "hardhat";
const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("\n💰 Funding BatchQuizManager with LEARN tokens\n");
  
  const LearnToken = await ethers.getContractAt(
    "LearnToken",
    "0xcc2768B27B389aE8999fBF93478E8BBa8485c461"
  );
  
  const batchQuizAddress = "0x749cdd9355254782828eDae7D85212A2e408D14c";
  
  // Check current balance
  const currentBalance = await LearnToken.balanceOf(batchQuizAddress);
  console.log("Current balance:", ethers.formatUnits(currentBalance, 18), "LEARN");
  
  // Transfer 10M LEARN (test için yeterli)
  const amount = ethers.parseUnits("10000000", 18);
  
  console.log("\nTransferring 10M LEARN to BatchQuizManager...");
  const tx = await LearnToken.transfer(batchQuizAddress, amount);
  console.log("TX Hash:", tx.hash);
  await tx.wait();
  
  console.log("✅ Transfer complete!");
  
  // Verify new balance
  const newBalance = await LearnToken.balanceOf(batchQuizAddress);
  console.log("New balance:", ethers.formatUnits(newBalance, 18), "LEARN");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
