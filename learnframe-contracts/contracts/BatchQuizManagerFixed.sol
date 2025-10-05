// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./LearnToken.sol";

contract BatchQuizManagerFixed is Ownable {
    LearnToken public learnToken;
    uint256 public constant REWARD_AMOUNT = 100 * 10**18; // 100 LEARN
    uint256 public constant SESSION_TIMEOUT = 30 minutes;
    
    struct QuizSession {
        bool isActive;
        uint256 startTime;
        bool hasCompleted;
    }
    
    mapping(address => QuizSession) public userSessions;
    
    string[10] private correctAnswers = [
        "eth",
        "coinbase", 
        "optimism",
        "yes",
        "layer2",
        "ethereum",
        "2023",
        "optimistic",
        "lower",
        "bedrock"
    ];
    
    event SessionStarted(address indexed user, uint256 timestamp);
    event QuizCompleted(address indexed user, uint256 score, uint256 reward);
    
    constructor(address _learnToken) Ownable(msg.sender) {
        learnToken = LearnToken(_learnToken);
    }
    
    function startQuizSession() external {
        require(!userSessions[msg.sender].isActive, "Session already active");
        require(!userSessions[msg.sender].hasCompleted, "Already completed today");
        
        userSessions[msg.sender] = QuizSession({
            isActive: true,
            startTime: block.timestamp,
            hasCompleted: false
        });
        
        emit SessionStarted(msg.sender, block.timestamp);
    }
    
    function submitBatchAnswers(string[10] memory userAnswers) external {
        QuizSession storage session = userSessions[msg.sender];
        
        require(session.isActive, "No active session");
        require(block.timestamp <= session.startTime + SESSION_TIMEOUT, "Session expired");
        require(!session.hasCompleted, "Already submitted");
        
        uint256 score = 0;
        for (uint i = 0; i < 10; i++) {
            if (keccak256(bytes(_toLower(userAnswers[i]))) == keccak256(bytes(correctAnswers[i]))) {
                score++;
            }
        }
        
        session.isActive = false;
        session.hasCompleted = true;
        
        if (score == 10) {
            // Transfer from contract balance
            require(learnToken.balanceOf(address(this)) >= REWARD_AMOUNT, "Insufficient contract balance");
            learnToken.transfer(msg.sender, REWARD_AMOUNT);
        }
        
        emit QuizCompleted(msg.sender, score, score == 10 ? REWARD_AMOUNT : 0);
    }
    
    function _toLower(string memory str) private pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);
        for (uint i = 0; i < bStr.length; i++) {
            if ((bStr[i] >= 0x41) && (bStr[i] <= 0x5A)) {
                bLower[i] = bytes1(uint8(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }
        return string(bLower);
    }
    
    function resetUserSession(address user) external onlyOwner {
        delete userSessions[user];
    }
    
    function getContractBalance() external view returns (uint256) {
        return learnToken.balanceOf(address(this));
    }
}
