// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./LearnToken.sol";

contract TeamLock {
    LearnToken public learnToken;
    address public owner;
    uint256 public unlockTime;
    uint256 public lockedAmount;
    bool public withdrawn = false;
    
    event TokensLocked(uint256 amount, uint256 unlockTime);
    event TokensWithdrawn(uint256 amount);
    
    constructor(address _token) {
        learnToken = LearnToken(_token);
        owner = msg.sender;
        unlockTime = block.timestamp + 180 days; // 6 ay kilit
        lockedAmount = 20_000_000 * 10**18; // 20M LEARN
    }
    
    function withdraw() external {
        require(msg.sender == owner, "Not owner");
        require(block.timestamp >= unlockTime, "Still locked");
        require(!withdrawn, "Already withdrawn");
        
        withdrawn = true;
        uint256 balance = learnToken.balanceOf(address(this));
        require(balance > 0, "No tokens");
        
        learnToken.transfer(owner, balance);
        emit TokensWithdrawn(balance);
    }
    
    function getRemainingTime() public view returns (uint256) {
        if (block.timestamp >= unlockTime) {
            return 0;
        }
        return unlockTime - block.timestamp;
    }
}
