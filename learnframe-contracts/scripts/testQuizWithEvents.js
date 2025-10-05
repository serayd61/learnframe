import hre from "hardhat";
const { ethers } = hre;

async function main() {
  const [signer] = await ethers.getSigners();
  
  console.log("\n🔍 Testing Quiz with Event Monitoring\n");
  console.log("Your address:", signer.address);
  
  const quizAddress = "0xaC7A53955c5620389F880e5453e2d1c066d1A0b9";
  const tokenAddress = "0xcc2768B27B389aE8999fBF93478E8BBa8485c461";
  
  // Get contracts
  const BatchQuiz = await ethers.getContractAt("BatchQuizManagerFixed", quizAddress);
  const LearnToken = await ethers.getContractAt("LearnToken", tokenAddress);
  
  // Check initial state
  const contractBalance = await BatchQuiz.getContractBalance();
  const userBalance = await LearnToken.balanceOf(signer.address);
  console.log("Contract has:", ethers.formatUnits(contractBalance, 18), "LEARN");
  console.log("You have:", ethers.formatUnits(userBalance, 18), "LEARN");
  
  // Check if session already exists
  const session = await BatchQuiz.userSessions(signer.address);
  console.log("\nCurrent session state:");
  console.log("- Active:", session.isActive);
  console.log("- Has completed:", session.hasCompleted);
  
  if (session.hasCompleted) {
    console.log("\n⚠️ You already completed the quiz today!");
    console.log("Resetting your session...");
    
    // Reset session (only owner can do this)
    try {
      const resetTx = await BatchQuiz.resetUserSession(signer.address);
      await resetTx.wait();
      console.log("✅ Session reset");
    } catch (e) {
      console.log("Cannot reset (not owner)");
    }
  }
  
  try {
    // 1. Start session
    console.log("\n1. Starting quiz session...");
    const tx1 = await BatchQuiz.startQuizSession({
      gasLimit: 300000
    });
    console.log("TX sent:", tx1.hash);
    
    const receipt1 = await tx1.wait();
    console.log("✅ Session started (Block:", receipt1.blockNumber, ")");
    
    // Wait a bit
    await new Promise(r => setTimeout(r, 2000));
    
    // 2. Submit answers
    console.log("\n2. Submitting correct answers...");
    const answers = [
      "ETH", "Coinbase", "Optimism", "Yes", "Layer2",
      "Ethereum", "2023", "Optimistic", "Lower", "Bedrock"
    ];
    
    const tx2 = await BatchQuiz.submitBatchAnswers(answers, {
      gasLimit: 500000
    });
    console.log("TX sent:", tx2.hash);
    
    const receipt2 = await tx2.wait();
    console.log("✅ Answers submitted (Block:", receipt2.blockNumber, ")");
    
    // Parse events
    if (receipt2.logs && receipt2.logs.length > 0) {
      console.log("\n📋 Events emitted:");
      for (const log of receipt2.logs) {
        console.log("- Event at index", log.index);
      }
    }
    
    // 3. Check final balance
    const newBalance = await LearnToken.balanceOf(signer.address);
    const earned = newBalance - userBalance;
    
    console.log("\n✅ SUCCESS!");
    console.log("New balance:", ethers.formatUnits(newBalance, 18), "LEARN");
    console.log("Tokens earned:", ethers.formatUnits(earned, 18), "LEARN");
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    
    if (error.data) {
      try {
        const reason = BatchQuiz.interface.parseError(error.data);
        console.log("Revert reason:", reason);
      } catch (e) {
        console.log("Raw error data:", error.data);
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
