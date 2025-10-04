// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LearnToken is ERC20, Ownable {
    address public quizManager;
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    
    constructor() ERC20("Learn Token", "LEARN") Ownable(msg.sender) {
        // Initial mint: 100 million tokens to deployer
        _mint(msg.sender, 100_000_000 * 10**18);
    }
    
    function setQuizManager(address _quizManager) external onlyOwner {
        quizManager = _quizManager;
    }
    
    function mint(address to, uint256 amount) external {
        require(msg.sender == quizManager, "Only quiz manager can mint");
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
    }
    
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
