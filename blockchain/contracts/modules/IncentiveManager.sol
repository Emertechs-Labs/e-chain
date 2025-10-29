// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {IEventFactory} from "../interfaces/IEventFactory.sol";
import {IEventTicket} from "../interfaces/IEventTicket.sol";

interface IPOAPAttendance {
    function balanceOf(address owner) external view returns (uint256);
}

contract IncentiveManager is ERC721, Ownable, Pausable {
    struct Reward {
        uint256 rewardId;
        address user;
        string rewardType;
        uint256 eventId;
        uint256 timestamp;
    }

    mapping(uint256 => Reward) public rewards;
    uint256 public nextRewardId;

    // Early bird: per event, per user
    mapping(uint256 => mapping(address => bool)) public earlyBirdClaimed;

    // Loyalty: points based on POAP count
    mapping(address => uint256) public loyaltyPoints;

    // Referrals
    mapping(bytes32 => address) public referralCodes; // code => inviter
    mapping(address => uint256) public referralRewards; // inviter => successful invites
    mapping(address => address) public referredBy; // invitee => inviter

    address public eventFactory;
    address public eventTicket;
    address public poapAttendance;

    uint256 public earlyBirdLimit = 10; // First 10 buyers per event

    event RewardMinted(
        uint256 rewardId,
        address user,
        string rewardType,
        uint256 eventId
    );
    event ReferralCodeGenerated(bytes32 code, address inviter);
    event ReferralUsed(address invitee, address inviter);

    constructor(
        address _eventFactory,
        address _eventTicket,
        address _poapAttendance
    ) ERC721("Incentive Reward", "INC") Ownable(msg.sender) {
        require(_eventFactory != address(0), "Invalid event factory");
        require(_eventTicket != address(0), "Invalid event ticket");
        require(_poapAttendance != address(0), "Invalid POAP attendance");

        eventFactory = _eventFactory;
        eventTicket = _eventTicket;
        poapAttendance = _poapAttendance;
    }

    // Early bird claim - requires event-specific ticket contract address
    function claimEarlyBird(
        uint256 eventId,
        address ticketContract
    ) external whenNotPaused {
        require(!earlyBirdClaimed[eventId][msg.sender], "Already claimed");
        require(
            IEventTicket(ticketContract).eventId() == eventId,
            "Invalid ticket contract"
        );

        uint256 ticketCount = IEventTicket(ticketContract)
            .balanceOf(msg.sender);
        require(ticketCount > 0, "No tickets purchased");

        uint256 totalTickets = IEventTicket(ticketContract)
            .totalSold();
        require(totalTickets <= earlyBirdLimit, "Early bird period ended");

        earlyBirdClaimed[eventId][msg.sender] = true;
        _mintReward(msg.sender, "EARLY_BIRD", eventId);
    }

    // Update loyalty points (call after POAP mint)
    function updateLoyaltyPoints(address user) external {
        uint256 poapCount = IPOAPAttendance(poapAttendance).balanceOf(user);
        loyaltyPoints[user] = poapCount;
    }

    // Generate referral code
    function generateReferralCode(bytes32 code) external {
        require(referralCodes[code] == address(0), "Code already exists");
        referralCodes[code] = msg.sender;
        emit ReferralCodeGenerated(code, msg.sender);
    }

    // Use referral code (during ticket purchase or POAP mint)
    function useReferralCode(bytes32 code, address invitee) external {
        address inviter = referralCodes[code];
        require(inviter != address(0), "Invalid code");
        require(referredBy[invitee] == address(0), "Already referred");

        referredBy[invitee] = inviter;
        referralRewards[inviter]++;
        emit ReferralUsed(invitee, inviter);

        // Mint referral reward for inviter
        _mintReward(inviter, "REFERRAL", 0); // eventId 0 for global
    }

    // Claim loyalty reward if points > threshold
    function claimLoyaltyReward(uint256 threshold) external {
        require(loyaltyPoints[msg.sender] >= threshold, "Not enough points");
        _mintReward(msg.sender, "LOYALTY", 0);
        // Reset or deduct points? For now, just claim once
    }

    // Internal mint reward NFT
    function _mintReward(
        address user,
        string memory rewardType,
        uint256 eventId
    ) internal {
        uint256 rewardId = nextRewardId++;
        _mint(user, rewardId);
        rewards[rewardId] = Reward({
            rewardId: rewardId,
            user: user,
            rewardType: rewardType,
            eventId: eventId,
            timestamp: block.timestamp
        });
        emit RewardMinted(rewardId, user, rewardType, eventId);
    }

    // Set addresses (only owner)
    function setEventFactory(address _eventFactory) external onlyOwner {
        eventFactory = _eventFactory;
    }

    function setEventTicket(address _eventTicket) external onlyOwner {
        eventTicket = _eventTicket;
    }

    function setPoapAttendance(address _poapAttendance) external onlyOwner {
        poapAttendance = _poapAttendance;
    }

    function setEarlyBirdLimit(uint256 _limit) external onlyOwner {
        earlyBirdLimit = _limit;
    }

    // Pause / unpause contract (emergency)
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // View functions
    function getReward(uint256 rewardId) external view returns (Reward memory) {
        return rewards[rewardId];
    }

    function getReferralCode(bytes32 code) external view returns (address) {
        return referralCodes[code];
    }
}
