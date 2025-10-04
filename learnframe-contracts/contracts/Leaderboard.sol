// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Leaderboard is Ownable {
    struct UserStats {
        uint256 totalScore;
        uint256 weeklyScore;
        uint256 correctAnswers;
        uint256 totalAttempts;
        uint256 streakDays;
        uint256 lastPlayedTimestamp;
    }
    
    mapping(address => UserStats) public userStats;
    address[] public allUsers;
    
    uint256 public weekStartTime;
    uint256 public constant WEEK_DURATION = 7 days;
    
    event StatsUpdated(address indexed user, uint256 newScore);
    event WeeklyReset(uint256 newWeekStartTime);
    
    constructor() Ownable(msg.sender) {
        weekStartTime = block.timestamp;
    }
    
    function updateUserStats(
        address user,
        uint256 scoreToAdd,
        bool isCorrect
    ) external onlyOwner {
        UserStats storage stats = userStats[user];
        
        // Yeni kullanıcı ise listeye ekle
        if (stats.totalAttempts == 0) {
            allUsers.push(user);
        }
        
        stats.totalScore += scoreToAdd;
        stats.weeklyScore += scoreToAdd;
        stats.totalAttempts++;
        
        if (isCorrect) {
            stats.correctAnswers++;
        }
        
        // Streak hesaplama
        if (block.timestamp - stats.lastPlayedTimestamp <= 1 days) {
            stats.streakDays++;
        } else if (block.timestamp - stats.lastPlayedTimestamp > 2 days) {
            stats.streakDays = 1;
        }
        
        stats.lastPlayedTimestamp = block.timestamp;
        
        emit StatsUpdated(user, stats.totalScore);
    }
    
    function getTopUsers(uint256 count) 
        external 
        view 
        returns (address[] memory, uint256[] memory) 
    {
        require(count > 0 && count <= 100, "Invalid count");
        
        uint256 userCount = allUsers.length;
        uint256 resultCount = count > userCount ? userCount : count;
        
        address[] memory topAddresses = new address[](resultCount);
        uint256[] memory topScores = new uint256[](resultCount);
        
        // Basit sıralama (production'da daha optimize edilmeli)
        for (uint256 i = 0; i < userCount; i++) {
            uint256 score = userStats[allUsers[i]].totalScore;
            
            for (uint256 j = 0; j < resultCount; j++) {
                if (score > topScores[j]) {
                    // Kaydır ve ekle
                    for (uint256 k = resultCount - 1; k > j; k--) {
                        topAddresses[k] = topAddresses[k-1];
                        topScores[k] = topScores[k-1];
                    }
                    topAddresses[j] = allUsers[i];
                    topScores[j] = score;
                    break;
                }
            }
        }
        
        return (topAddresses, topScores);
    }
    
    function resetWeeklyScores() external onlyOwner {
        require(block.timestamp >= weekStartTime + WEEK_DURATION, "Week not ended");
        
        for (uint256 i = 0; i < allUsers.length; i++) {
            userStats[allUsers[i]].weeklyScore = 0;
        }
        
        weekStartTime = block.timestamp;
        emit WeeklyReset(weekStartTime);
    }
    
    function getUserCount() external view returns (uint256) {
        return allUsers.length;
    }
}
