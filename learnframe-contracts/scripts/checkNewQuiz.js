import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("\n🔍 Checking New BatchQuizManagerFixed\n");
  
  const newQuizAddress = "0xaC7A53955c5620389F880e5453e2d1c066d1A0b9";
  const tokenAddress = "0xcc2768B27B389aE8999fBF93478E8BBa8485c461";
  
  const LearnToken = await ethers.getContractAt("LearnToken", tokenAddress);
  const balance = await LearnToken.balanceOf(newQuizAddress);
  
  console.log("Contract balance:", ethers.formatUnits(balance, 18), "LEARN");
  
  // If balance is 0, transfer again
  if (balance === 0n) {
    console.log("\n⚠️ Balance is 0, transferring again...");
    const amount = ethers.parseUnits("10000000", 18);
    const tx = await LearnToken.transfer(newQuizAddress, amount);
    await tx.wait();
    
    const newBalance = await LearnToken.balanceOf(newQuizAddress);
    console.log("✅ New balance:", ethers.formatUnits(newBalance, 18), "LEARN");
  }
}

main();
