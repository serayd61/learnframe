import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("LearnToken", function () {
  let learnToken;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const LearnToken = await ethers.getContractFactory("LearnToken");
    learnToken = await LearnToken.deploy();
    await learnToken.waitForDeployment();
  });

  it("Should have correct name and symbol", async function () {
    expect(await learnToken.name()).to.equal("Learn Token");
    expect(await learnToken.symbol()).to.equal("LEARN");
  });

  it("Should mint initial supply to owner", async function () {
    const ownerBalance = await learnToken.balanceOf(owner.address);
    expect(ownerBalance).to.equal(ethers.parseEther("100000000"));
  });

  it("Should only allow quiz manager to mint", async function () {
    await learnToken.setQuizManager(addr1.address);
    
    // addr1 (quiz manager) can mint
    await learnToken.connect(addr1).mint(addr2.address, ethers.parseEther("100"));
    
    // addr2 cannot mint
    await expect(
      learnToken.connect(addr2).mint(addr2.address, ethers.parseEther("100"))
    ).to.be.revertedWith("Only quiz manager can mint");
  });
});
