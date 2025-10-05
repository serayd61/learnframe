import hre from "hardhat";
const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("\n🔒 Locking Team Tokens (20M LEARN)\n");
  
  // 1. TeamLock contract'ı deploy et
  const TeamLock = await ethers.getContractFactory("TeamLock");
  const teamLock = await TeamLock.deploy(
    "0xcc2768B27B389aE8999fBF93478E8BBa8485c461" // LearnToken address
  );
  await teamLock.waitForDeployment();
  const lockAddress = await teamLock.getAddress();
  
  console.log("✅ TeamLock deployed to:", lockAddress);
  
  // 2. 20M LEARN'i lock contract'a transfer et
  const LearnToken = await ethers.getContractAt(
    "LearnToken",
    "0xcc2768B27B389aE8999fBF93478E8BBa8485c461"
  );
  
  const amount = ethers.parseUnits("20000000", 18); // 20M
  console.log("\nTransferring 20M LEARN to lock contract...");
  
  const tx = await LearnToken.transfer(lockAddress, amount);
  await tx.wait();
  console.log("✅ 20M LEARN locked for 6 months");
  
  // 3. Özet
  const balance = await LearnToken.balanceOf(lockAddress);
  const deployerBalance = await LearnToken.balanceOf(deployer.address);
  
  console.log("\n📊 Token Distribution Summary:");
  console.log("================================");
  console.log("Team Lock (6 months):", ethers.formatUnits(balance, 18), "LEARN");
  console.log("Your Wallet:", ethers.formatUnits(deployerBalance, 18), "LEARN");
  console.log("Unlock Date:", new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toLocaleDateString());
  
  console.log("\n📋 Contract Addresses:");
  console.log("TeamLock:", lockAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
