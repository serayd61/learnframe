import hre from "hardhat";
const { ethers } = hre;

async function main() {
  const [signer] = await ethers.getSigners();
  
  console.log("\n🧪 Testing Quiz Manually\n");
  console.log("Your address:", signer.address);
  
  const batchQuizAddress = "0x749cdd9355254782828eDae7D85212A2e408D14c";
  const tokenAddress = "0xcc2768B27B389aE8999fBF93478E8BBa8485c461";
  
  // Get contracts with actual deployed ABI
  const BatchQuiz = await ethers.getContractAt("BatchQuizManager", batchQuizAddress);
  const LearnToken = await ethers.getContractAt("LearnToken", tokenAddress);
  
  // Check initial balance
  const initialBalance = await LearnToken.balanceOf(signer.address);
  console.log("Initial balance:", ethers.formatUnits(initialBalance, 18), "LEARN");
  
  try {
    // 1. Start session
    console.log("\n1. Starting quiz session...");
    const tx1 = await BatchQuiz.startQuizSession({
      gasLimit: 500000
    });
    await tx1.wait();
    console.log("✅ Session started");
    
    // 2. Submit correct answers
    console.log("\n2. Submitting correct answers...");
    const correctAnswers = [
      "ETH", 
      "Coinbase", 
      "Optimism", 
      "Yes", 
      "Layer2",
      "Ethereum", 
      "2023", 
      "Optimistic", 
      "Lower", 
      "Bedrock"
    ];
    
    const tx2 = await BatchQuiz.submitBatchAnswers(correctAnswers, {
      gasLimit: 1000000
    });
    console.log("TX Hash:", tx2.hash);
    console.log("Waiting for confirmation...");
    
    const receipt = await tx2.wait();
    console.log("✅ Transaction confirmed!");
    console.log("Gas used:", receipt.gasUsed.toString());
    
    // 3. Check new balance
    const newBalance = await LearnToken.balanceOf(signer.address);
    console.log("\n3. Results:");
    console.log("New balance:", ethers.formatUnits(newBalance, 18), "LEARN");
    console.log("Tokens earned:", ethers.formatUnits(newBalance - initialBalance, 18), "LEARN");
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    
    // Detailed error info
    if (error.reason) {
      console.log("Reason:", error.reason);
    }
    if (error.data) {
      console.log("Error data:", error.data);
    }
    
    // Try to decode the error
    if (error.transaction) {
      console.log("\nFailed transaction:");
      console.log("To:", error.transaction.to);
      console.log("Data:", error.transaction.data?.slice(0, 100) + "...");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
