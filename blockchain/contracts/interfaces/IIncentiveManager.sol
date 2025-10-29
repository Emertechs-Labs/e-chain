// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IIncentiveManager {
    struct Reward {
        uint256 rewardId;
        address user;
        string rewardType;
        uint256 eventId;
        uint256 timestamp;
    }

    function earlyBirdClaimed(
        uint256 eventId,
        address user
    ) external view returns (bool);
    function loyaltyPoints(address user) external view returns (uint256);
    function referralCodes(bytes32 code) external view returns (address);
    function referralRewards(address user) external view returns (uint256);

    function claimEarlyBird(uint256 eventId, address ticketContract, uint256 tokenId) external;
    function updateLoyaltyPoints(address user) external;
    function generateReferralCode(bytes32 code) external;
    function useReferralCode(bytes32 code, address invitee) external;
    function claimLoyaltyReward(uint256 threshold) external;

    function getReward(uint256 rewardId) external view returns (Reward memory);
    function setEventFactory(address _eventFactory) external;
    function setEventTicket(address _eventTicket) external;
    function setPoapAttendance(address _poapAttendance) external;
    function setEarlyBirdLimit(uint256 _limit) external;
    function setEarlyBirdRequirements(uint256 minTicketPrice, uint256 minSupply) external;
}
