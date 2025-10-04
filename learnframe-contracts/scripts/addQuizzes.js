import hre from "hardhat";
const { ethers } = hre;

async function main() {
  const quizManagerAddress = "0x61c798f9fE3bF4B0f54433820786110b8c331Ec8";
  
  const QuizManager = await ethers.getContractFactory("QuizManager");
  const quizManager = QuizManager.attach(quizManagerAddress);
  
  const quizzes = [
    { answer: "ETH", reward: 10, category: "Blockchain", difficulty: 2 },
    { answer: "Coinbase", reward: 15, category: "Crypto", difficulty: 1 },
    { answer: "Solidity", reward: 20, category: "Programming", difficulty: 3 },
    { answer: "Layer 2", reward: 25, category: "Scaling", difficulty: 4 }
  ];
  
  for (const quiz of quizzes) {
    console.log(`Adding quiz: ${quiz.category}`);
    const tx = await quizManager.createQuiz(
      quiz.answer,
      quiz.reward,
      quiz.category,
      quiz.difficulty
    );
    await tx.wait();
    console.log(`✅ Quiz added!`);
  }
  
  console.log("All quizzes added successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
