// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./LearnToken.sol";
import "./Leaderboard.sol";

contract QuizManagerV2 is Ownable {
    LearnToken public learnToken;
    Leaderboard public leaderboard;
    
    struct Quiz {
        address creator;
        bytes32 answerHash;
        uint256 reward;
        string category;
        uint8 difficulty;
        uint256 completions;
        bool active;
    }
    
    mapping(uint256 => Quiz) public quizzes;
    mapping(address => mapping(uint256 => bool)) public hasCompleted;
    mapping(address => uint256) public userScores;
    mapping(address => uint256) public userCompletions;
    
    uint256 public nextQuizId = 1;
    
    event QuizCreated(uint256 indexed quizId, address indexed creator, uint256 reward);
    event QuizCompleted(address indexed user, uint256 indexed quizId, bool correct, uint256 reward);
    
    constructor(address _learnToken, address _leaderboard) Ownable(msg.sender) {
        learnToken = LearnToken(_learnToken);
        leaderboard = Leaderboard(_leaderboard);
    }
    
    function createQuiz(
        string memory _correctAnswer,
        uint256 _reward,
        string memory _category,
        uint8 _difficulty
    ) external returns (uint256) {
        require(_difficulty >= 1 && _difficulty <= 5, "Invalid difficulty");
        
        bytes32 answerHash = keccak256(abi.encodePacked(_toLower(_correctAnswer)));
        uint256 quizId = nextQuizId++;
        
        quizzes[quizId] = Quiz({
            creator: msg.sender,
            answerHash: answerHash,
            reward: _reward,
            category: _category,
            difficulty: _difficulty,
            completions: 0,
            active: true
        });
        
        emit QuizCreated(quizId, msg.sender, _reward);
        return quizId;
    }
    
    function submitAnswer(uint256 _quizId, string memory _answer) external {
        Quiz storage quiz = quizzes[_quizId];
        
        require(quiz.active, "Quiz not active");
        require(!hasCompleted[msg.sender][_quizId], "Already completed");
        
        bytes32 answerHash = keccak256(abi.encodePacked(_toLower(_answer)));
        bool isCorrect = (answerHash == quiz.answerHash);
        
        hasCompleted[msg.sender][_quizId] = true;
        
        if (isCorrect) {
            quiz.completions++;
            userScores[msg.sender] += quiz.reward;
            userCompletions[msg.sender]++;
            
            // Token mint
            learnToken.mint(msg.sender, quiz.reward * 10**18);
            
            // Leaderboard güncelle
            leaderboard.updateUserStats(msg.sender, quiz.reward, true);
            
            emit QuizCompleted(msg.sender, _quizId, true, quiz.reward);
        } else {
            // Yanlış cevap için de leaderboard güncelle (attempt sayısı için)
            leaderboard.updateUserStats(msg.sender, 0, false);
            emit QuizCompleted(msg.sender, _quizId, false, 0);
        }
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
    
    function setLeaderboard(address _leaderboard) external onlyOwner {
        leaderboard = Leaderboard(_leaderboard);
    }
}
