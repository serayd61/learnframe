import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("Leaderboard", function () {
  let leaderboard;
  let owner, user1, user2, user3;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();
    
    const Leaderboard = await ethers.getContractFactory("Leaderboard");
    leaderboard = await Leaderboard.deploy();
    await leaderboard.waitForDeployment();
  });

  it("Should update user stats correctly", async function () {
    await leaderboard.updateUserStats(user1.address, 100, true);
    
    const stats = await leaderboard.userStats(user1.address);
    expect(stats.totalScore).to.equal(100);
    expect(stats.correctAnswers).to.equal(1);
  });

  it("Should return top users", async function () {
    await leaderboard.updateUserStats(user1.address, 100, true);
    await leaderboard.updateUserStats(user2.address, 200, true);
    await leaderboard.updateUserStats(user3.address, 150, true);
    
    const [addresses, scores] = await leaderboard.getTopUsers(3);
    
    expect(addresses[0]).to.equal(user2.address);
    expect(scores[0]).to.equal(200);
    expect(addresses[1]).to.equal(user3.address);
    expect(scores[1]).to.equal(150);
  });
});
