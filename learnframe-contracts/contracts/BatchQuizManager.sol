// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./LearnToken.sol";
import "./Leaderboard.sol";

contract BatchQuizManager is Ownable {
    LearnToken public learnToken;
    Leaderboard public leaderboard;
    
    struct QuizSession {
        bytes32[10] answerHashes;
        uint256 totalReward;
        uint256 startTime;
        uint256 endTime;
        bool completed;
    }
    
    mapping(address => QuizSession) public activeSessions;
    mapping(address => uint256) public userTotalScore;
    
    uint256 public constant SESSION_DURATION = 30 minutes;
    uint256 public constant BATCH_REWARD = 100; // 100 LEARN for all correct
    
    event SessionStarted(address indexed user, uint256 startTime);
    event SessionCompleted(address indexed user, bool allCorrect, uint256 reward);
    
    constructor(address _learnToken, address _leaderboard) Ownable(msg.sender) {
        learnToken = LearnToken(_learnToken);
        leaderboard = Leaderboard(_leaderboard);
    }
    
    function startQuizSession() external {
        require(!activeSessions[msg.sender].completed || 
                block.timestamp > activeSessions[msg.sender].endTime, 
                "Session active");
        
        // Base blockchain quiz answers (hashed)
        bytes32[10] memory answers;
        answers[0] = keccak256(abi.encodePacked("eth")); // Native token
        answers[1] = keccak256(abi.encodePacked("coinbase")); // Developer
        answers[2] = keccak256(abi.encodePacked("optimism")); // Built on
        answers[3] = keccak256(abi.encodePacked("yes")); // EVM compatible
        answers[4] = keccak256(abi.encodePacked("layer2")); // Network type
        answers[5] = keccak256(abi.encodePacked("ethereum")); // Base layer
        answers[6] = keccak256(abi.encodePacked("2023")); // Launch year
        answers[7] = keccak256(abi.encodePacked("optimistic")); // Rollup type
        answers[8] = keccak256(abi.encodePacked("lower")); // Gas fees
        answers[9] = keccak256(abi.encodePacked("bedrock")); // Upgrade name
        
        activeSessions[msg.sender] = QuizSession({
            answerHashes: answers,
            totalReward: BATCH_REWARD,
            startTime: block.timestamp,
            endTime: block.timestamp + SESSION_DURATION,
            completed: false
        });
        
        emit SessionStarted(msg.sender, block.timestamp);
    }
    
    function submitBatchAnswers(string[10] memory userAnswers) external {
        QuizSession storage session = activeSessions[msg.sender];
        require(session.startTime > 0, "No active session");
        require(!session.completed, "Session already completed");
        require(block.timestamp <= session.endTime, "Session expired");
        
        uint8 correctCount = 0;
        
        for(uint i = 0; i < 10; i++) {
            bytes32 userHash = keccak256(abi.encodePacked(_toLower(userAnswers[i])));
            if(userHash == session.answerHashes[i]) {
                correctCount++;
            }
        }
        
        session.completed = true;
        uint256 reward = 0;
        
        if(correctCount == 10) {
            // All correct - get full reward
            reward = BATCH_REWARD * 10**18;
            learnToken.mint(msg.sender, reward);
            userTotalScore[msg.sender] += BATCH_REWARD;
            leaderboard.updateUserStats(msg.sender, BATCH_REWARD, true);
        } else {
            // Some wrong - no reward but record attempt
            leaderboard.updateUserStats(msg.sender, 0, false);
        }
        
        emit SessionCompleted(msg.sender, correctCount == 10, reward);
    }
    
    function _toLower(string memory str) internal pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);
        
        for (uint i = 0; i < bStr.length; i++) {
            if ((uint8(bStr[i]) >= 65) && (uint8(bStr[i]) <= 90)) {
                bLower[i] = bytes1(uint8(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }
        return string(bLower);
    }
}
