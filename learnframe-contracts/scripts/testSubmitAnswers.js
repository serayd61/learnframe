import hre from "hardhat";
const { ethers } = hre;

async function main() {
  const [signer] = await ethers.getSigners();
  
  console.log("\n🧪 Testing submitBatchAnswers manually\n");
  
  const batchQuizAddress = "0x749cdd9355254782828eDae7D85212A2e408D14c";
  
  const BatchQuizABI = [
    {
      "inputs": [],
      "name": "startQuizSession",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "string[10]", "name": "userAnswers", "type": "string[10]"}],
      "name": "submitBatchAnswers",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
  
  const BatchQuiz = await ethers.getContractAt(BatchQuizABI, batchQuizAddress);
  
  try {
    // Start session first
    console.log("1. Starting quiz session...");
    const tx1 = await BatchQuiz.startQuizSession();
    await tx1.wait();
    console.log("✅ Session started");
    
    // Submit answers
    console.log("\n2. Submitting answers...");
    const correctAnswers = [
      "ETH", "Coinbase", "Optimism", "Yes", "Layer2",
      "Ethereum", "2023", "Optimistic", "Lower", "Bedrock"
    ];
    
    const tx2 = await BatchQuiz.submitBatchAnswers(correctAnswers);
    console.log("TX Hash:", tx2.hash);
    const receipt = await tx2.wait();
    
    console.log("✅ Answers submitted!");
    console.log("Gas used:", receipt.gasUsed.toString());
    
    // Check token balance
    const LearnToken = await ethers.getContractAt(
      "LearnToken",
      "0xcc2768B27B389aE8999fBF93478E8BBa8485c461"
    );
    
    const balance = await LearnToken.balanceOf(signer.address);
    console.log("\nYour LEARN balance:", ethers.formatUnits(balance, 18));
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.data) {
      console.log("Error data:", error.data);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
