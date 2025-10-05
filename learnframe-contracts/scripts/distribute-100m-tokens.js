import hre from "hardhat";
const { ethers } = hre;

// 100M Total Supply Distribution
const DISTRIBUTION = {
  QUIZ_REWARDS: ethers.parseEther("20000000"),     // 20% - Quiz rewards
  TEAM: ethers.parseEther("15000000"),             // 15% - 6 ay locked
  DEV_SPONSOR: ethers.parseEther("10000000"),      // 10% - Unlocked
  DEX_LIQUIDITY: ethers.parseEther("40000000"),    // 40% - For DEX
  VESTING: ethers.parseEther("15000000"),          // 15% - 24 ay vesting
};

const TOTAL = ethers.parseEther("100000000"); // 100M LEARN

async function main() {
  const learnTokenAddress = "0x1Cd95030e189e54755C1ccA28e24891250A79d50";
  const quizManagerAddress = "0xEfb23c57042C21271ff19e1FB5CfFD1A49bD5f61";
  
  console.log("📊 100M LEARN Token Distribution");
  console.log("═══════════════════════════════════════");
  console.log("Total Supply:", ethers.formatEther(TOTAL), "LEARN\n");
  console.log("Distribution Breakdown:");
  console.log("• Quiz Rewards (20%):", ethers.formatEther(DISTRIBUTION.QUIZ_REWARDS));
  console.log("• Team (15%, 6mo lock):", ethers.formatEther(DISTRIBUTION.TEAM));
  console.log("• Dev/Sponsor (10%):", ethers.formatEther(DISTRIBUTION.DEV_SPONSOR));
  console.log("• DEX Liquidity (40%):", ethers.formatEther(DISTRIBUTION.DEX_LIQUIDITY));
  console.log("• Vesting (15%, 24mo):", ethers.formatEther(DISTRIBUTION.VESTING));
  console.log("═══════════════════════════════════════\n");
  
  const ADDRESSES = {
    TEAM_WALLET: "0x35abe5D33ca54352415B057D6F51ab2EFd8Ad709",
    DEV_WALLET: "0x43970F132829f7D72a99B2aFeB033F097D2c877b",
    DEX_WALLET: "0x27650088aD441cE2a10256381246F952F80d51b3",
    VESTING_WALLET: "0x103c70C2bc757BDA481B685Fc75E95d4aE5319E6",
  };
  
  const LearnToken = await ethers.getContractAt("LearnToken", learnTokenAddress);
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying from:", deployer.address);
  const balance = await LearnToken.balanceOf(deployer.address);
  console.log("Current Balance:", ethers.formatEther(balance), "LEARN\n");
  
  // Yeterli bakiye kontrolü
  if (balance < TOTAL) {
    console.log("❌ ERROR: Insufficient balance!");
    console.log("Need:", ethers.formatEther(TOTAL));
    console.log("Have:", ethers.formatEther(balance));
    return;
  }
  
  let totalDistributed = 0n;
  
  // 1. Quiz Rewards (QuizManager kontratına)
  console.log("1️⃣ Transferring Quiz Rewards to QuizManager...");
  try {
    const tx1 = await LearnToken.transfer(quizManagerAddress, DISTRIBUTION.QUIZ_REWARDS);
    await tx1.wait();
    totalDistributed += DISTRIBUTION.QUIZ_REWARDS;
    console.log("✅ Quiz Rewards sent!");
    console.log("   Amount:", ethers.formatEther(DISTRIBUTION.QUIZ_REWARDS));
    console.log("   Tx:", tx1.hash);
  } catch (error) {
    console.log("❌ Failed:", error.message);
  }
  
  // 2. Team Tokens
  console.log("\n2️⃣ Transferring Team Tokens (6 months locked)...");
  try {
    const tx2 = await LearnToken.transfer(ADDRESSES.TEAM_WALLET, DISTRIBUTION.TEAM);
    await tx2.wait();
    totalDistributed += DISTRIBUTION.TEAM;
    console.log("✅ Team tokens sent!");
    console.log("   Amount:", ethers.formatEther(DISTRIBUTION.TEAM));
    console.log("   To:", ADDRESSES.TEAM_WALLET);
    console.log("   Tx:", tx2.hash);
  } catch (error) {
    console.log("❌ Failed:", error.message);
  }
  
  // 3. Dev/Sponsor Tokens
  console.log("\n3️⃣ Transferring Dev/Sponsor Tokens...");
  try {
    const tx3 = await LearnToken.transfer(ADDRESSES.DEV_WALLET, DISTRIBUTION.DEV_SPONSOR);
    await tx3.wait();
    totalDistributed += DISTRIBUTION.DEV_SPONSOR;
    console.log("✅ Dev/Sponsor tokens sent!");
    console.log("   Amount:", ethers.formatEther(DISTRIBUTION.DEV_SPONSOR));
    console.log("   To:", ADDRESSES.DEV_WALLET);
    console.log("   Tx:", tx3.hash);
  } catch (error) {
    console.log("❌ Failed:", error.message);
  }
  
  // 4. DEX Liquidity
  console.log("\n4️⃣ Transferring DEX Liquidity...");
  try {
    const tx4 = await LearnToken.transfer(ADDRESSES.DEX_WALLET, DISTRIBUTION.DEX_LIQUIDITY);
    await tx4.wait();
    totalDistributed += DISTRIBUTION.DEX_LIQUIDITY;
    console.log("✅ DEX liquidity sent!");
    console.log("   Amount:", ethers.formatEther(DISTRIBUTION.DEX_LIQUIDITY));
    console.log("   To:", ADDRESSES.DEX_WALLET);
    console.log("   Tx:", tx4.hash);
  } catch (error) {
    console.log("❌ Failed:", error.message);
  }
  
  // 5. Vesting Tokens
  console.log("\n5️⃣ Transferring Vesting Tokens (24 months)...");
  try {
    const tx5 = await LearnToken.transfer(ADDRESSES.VESTING_WALLET, DISTRIBUTION.VESTING);
    await tx5.wait();
    totalDistributed += DISTRIBUTION.VESTING;
    console.log("✅ Vesting tokens sent!");
    console.log("   Amount:", ethers.formatEther(DISTRIBUTION.VESTING));
    console.log("   Monthly unlock:", ethers.formatEther(DISTRIBUTION.VESTING / 24n), "LEARN");
    console.log("   To:", ADDRESSES.VESTING_WALLET);
    console.log("   Tx:", tx5.hash);
  } catch (error) {
    console.log("❌ Failed:", error.message);
  }
  
  console.log("\n═══════════════════════════════════════");
  console.log("📊 Distribution Summary:");
  console.log("Total Distributed:", ethers.formatEther(totalDistributed), "LEARN");
  const finalBalance = await LearnToken.balanceOf(deployer.address);
  console.log("Remaining Balance:", ethers.formatEther(finalBalance), "LEARN");
  console.log("\n🎉 Distribution Complete!");
}

main().catch(console.error);
