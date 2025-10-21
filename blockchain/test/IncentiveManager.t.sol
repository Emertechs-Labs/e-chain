// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {IncentiveManager} from "../contracts/modules/IncentiveManager.sol";
import {EventTicket} from "../contracts/core/EventTicket.sol";
import {POAPAttendance} from "../contracts/modules/POAPAttendance.sol";
import {EventFactory} from "../contracts/core/EventFactory.sol";

contract IncentiveManagerTest is Test {
    IncentiveManager public incentives;
    EventFactory public factory;
    EventTicket public ticket;
    POAPAttendance public poap;
    
    address public owner = address(1);
    address public user1 = address(2);
    address public user2 = address(3);
    address public user3 = address(4);
    address public treasury = address(5);
    
    uint256 public constant EVENT_ID = 1;
    uint256 public constant TICKET_PRICE = 0.1 ether;
    
    event RewardMinted(uint256 rewardId, address user, string rewardType, uint256 eventId);
    event ReferralCodeGenerated(bytes32 code, address inviter);
    event ReferralUsed(address invitee, address inviter);
    
    function setUp() public {
        // Deploy EventTicket template
        EventTicket template = new EventTicket();
        
        // Deploy EventFactory
        vm.prank(owner);
        factory = new EventFactory(address(template), treasury);
        
        // Deploy POAP
        vm.prank(owner);
        poap = new POAPAttendance(address(factory));
        
        // Deploy EventTicket instance
        ticket = new EventTicket();
        vm.prank(address(factory));
        ticket.initialize(
            EVENT_ID,
            owner,
            TICKET_PRICE,
            100,
            "Test Event",
            "TET",
            address(factory)
        );
        
        // Deploy IncentiveManager
        vm.prank(owner);
        incentives = new IncentiveManager(
            address(factory),
            address(ticket),
            address(poap)
        );
        
        // Fund test accounts
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
        vm.deal(user3, 10 ether);
    }
    
    // ============ Deployment Tests ============
    
    function test_Deployment() public view {
        assertEq(incentives.name(), "Incentive Reward");
        assertEq(incentives.symbol(), "INC");
        assertEq(incentives.eventFactory(), address(factory));
        assertEq(incentives.eventTicket(), address(ticket));
        assertEq(incentives.poapAttendance(), address(poap));
        assertEq(incentives.earlyBirdLimit(), 10);
    }
    
    // ============ Early Bird Tests ============
    
    function test_ClaimEarlyBird() public {
        // Mint a ticket first
        vm.prank(user1);
        ticket.mintTicket{value: TICKET_PRICE}(user1, "ipfs://metadata");
        
        vm.expectEmit(true, true, false, true);
        emit RewardMinted(0, user1, "early_bird", EVENT_ID);
        
        vm.prank(user1);
        incentives.claimEarlyBird(EVENT_ID, address(ticket));
        
        assertEq(incentives.ownerOf(0), user1);
        assertTrue(incentives.earlyBirdClaimed(EVENT_ID, user1));
        
        (
            uint256 rewardId,
            address user,
            string memory rewardType,
            uint256 eventId,
            uint256 timestamp
        ) = incentives.rewards(0);
        
        assertEq(rewardId, 0);
        assertEq(user, user1);
        assertEq(rewardType, "early_bird");
        assertEq(eventId, EVENT_ID);
        assertGt(timestamp, 0);
    }
    
    function test_RevertEarlyBirdAlreadyClaimed() public {
        vm.prank(user1);
        ticket.mintTicket{value: TICKET_PRICE}(user1, "ipfs://metadata");
        
        vm.prank(user1);
        incentives.claimEarlyBird(EVENT_ID, address(ticket));
        
        vm.prank(user1);
        vm.expectRevert("Already claimed");
        incentives.claimEarlyBird(EVENT_ID, address(ticket));
    }
    
    function test_RevertEarlyBirdNoTicket() public {
        vm.prank(user1);
        vm.expectRevert("Must own ticket");
        incentives.claimEarlyBird(EVENT_ID, address(ticket));
    }
    
    function test_RevertEarlyBirdLimitExceeded() public {
        // Mint tickets for 10 users (early bird limit)
        for (uint256 i = 0; i < 10; i++) {
            address user = address(uint160(100 + i));
            vm.deal(user, 1 ether);
            
            vm.prank(user);
            ticket.mintTicket{value: TICKET_PRICE}(user, "ipfs://metadata");
            
            vm.prank(user);
            incentives.claimEarlyBird(EVENT_ID, address(ticket));
        }
        
        // Try to claim as 11th user
        vm.prank(user1);
        ticket.mintTicket{value: TICKET_PRICE}(user1, "ipfs://metadata");
        
        vm.prank(user1);
        vm.expectRevert("Early bird limit reached");
        incentives.claimEarlyBird(EVENT_ID, address(ticket));
    }
    
    // ============ Loyalty Points Tests ============
    
    function test_ClaimLoyaltyReward() public {
        // Simulate user having POAPs (would need to mint POAPs in real scenario)
        vm.mockCall(
            address(poap),
            abi.encodeWithSelector(poap.balanceOf.selector, user1),
            abi.encode(5)
        );
        
        vm.expectEmit(true, true, false, true);
        emit RewardMinted(0, user1, "loyalty", 0);
        
        vm.prank(user1);
        incentives.claimLoyaltyReward();
        
        assertEq(incentives.ownerOf(0), user1);
        assertEq(incentives.loyaltyPoints(user1), 5);
    }
    
    function test_RevertLoyaltyRewardInsufficientPOAPs() public {
        vm.mockCall(
            address(poap),
            abi.encodeWithSelector(poap.balanceOf.selector, user1),
            abi.encode(2)
        );
        
        vm.prank(user1);
        vm.expectRevert("Need at least 3 POAPs");
        incentives.claimLoyaltyReward();
    }
    
    // ============ Referral Tests ============
    
    function test_GenerateReferralCode() public {
        vm.expectEmit(false, true, false, false);
        emit ReferralCodeGenerated(bytes32(0), user1);
        
        vm.prank(user1);
        bytes32 code = incentives.generateReferralCode();
        
        assertNotEq(code, bytes32(0));
        assertEq(incentives.referralCodes(code), user1);
    }
    
    function test_UseReferralCode() public {
        // User1 generates referral code
        vm.prank(user1);
        bytes32 code = incentives.generateReferralCode();
        
        // User2 uses the referral code
        vm.expectEmit(true, true, false, false);
        emit ReferralUsed(user2, user1);
        
        vm.prank(user2);
        incentives.useReferralCode(code);
        
        assertEq(incentives.referredBy(user2), user1);
        assertEq(incentives.referralRewards(user1), 1);
    }
    
    function test_RevertUseInvalidReferralCode() public {
        bytes32 invalidCode = keccak256("invalid");
        
        vm.prank(user2);
        vm.expectRevert("Invalid referral code");
        incentives.useReferralCode(invalidCode);
    }
    
    function test_RevertUseOwnReferralCode() public {
        vm.prank(user1);
        bytes32 code = incentives.generateReferralCode();
        
        vm.prank(user1);
        vm.expectRevert("Cannot refer yourself");
        incentives.useReferralCode(code);
    }
    
    function test_RevertAlreadyReferred() public {
        vm.prank(user1);
        bytes32 code = incentives.generateReferralCode();
        
        vm.prank(user2);
        incentives.useReferralCode(code);
        
        vm.prank(user2);
        vm.expectRevert("Already referred");
        incentives.useReferralCode(code);
    }
    
    function test_ClaimReferralReward() public {
        // User1 generates code
        vm.prank(user1);
        bytes32 code = incentives.generateReferralCode();
        
        // 3 users use the code
        vm.prank(user2);
        incentives.useReferralCode(code);
        
        vm.prank(user3);
        incentives.useReferralCode(code);
        
        address user4 = address(6);
        vm.prank(user4);
        incentives.useReferralCode(code);
        
        // User1 claims referral reward
        vm.expectEmit(true, true, false, true);
        emit RewardMinted(0, user1, "referral", 0);
        
        vm.prank(user1);
        incentives.claimReferralReward();
        
        assertEq(incentives.ownerOf(0), user1);
    }
    
    function test_RevertClaimReferralRewardInsufficient() public {
        vm.prank(user1);
        bytes32 code = incentives.generateReferralCode();
        
        // Only 1 referral (need 3)
        vm.prank(user2);
        incentives.useReferralCode(code);
        
        vm.prank(user1);
        vm.expectRevert("Need at least 3 referrals");
        incentives.claimReferralReward();
    }
    
    // ============ Admin Functions Tests ============
    
    function test_SetEarlyBirdLimit() public {
        vm.prank(owner);
        incentives.setEarlyBirdLimit(20);
        
        assertEq(incentives.earlyBirdLimit(), 20);
    }
    
    function test_RevertSetEarlyBirdLimitUnauthorized() public {
        vm.prank(user1);
        vm.expectRevert();
        incentives.setEarlyBirdLimit(20);
    }
    
    function test_SetEventFactory() public {
        address newFactory = address(999);
        
        vm.prank(owner);
        incentives.setEventFactory(newFactory);
        
        assertEq(incentives.eventFactory(), newFactory);
    }
    
    function test_SetEventTicket() public {
        address newTicket = address(888);
        
        vm.prank(owner);
        incentives.setEventTicket(newTicket);
        
        assertEq(incentives.eventTicket(), newTicket);
    }
    
    function test_SetPOAPAttendance() public {
        address newPOAP = address(777);
        
        vm.prank(owner);
        incentives.setPOAPAttendance(newPOAP);
        
        assertEq(incentives.poapAttendance(), newPOAP);
    }
    
    // ============ Pause/Unpause Tests ============
    
    function test_PauseUnpause() public {
        vm.prank(owner);
        incentives.pause();
        assertTrue(incentives.paused());
        
        vm.prank(owner);
        incentives.unpause();
        assertFalse(incentives.paused());
    }
    
    function test_RevertClaimWhenPaused() public {
        vm.prank(user1);
        ticket.mintTicket{value: TICKET_PRICE}(user1, "ipfs://metadata");
        
        vm.prank(owner);
        incentives.pause();
        
        vm.prank(user1);
        vm.expectRevert();
        incentives.claimEarlyBird(EVENT_ID, address(ticket));
    }
    
    // ============ View Functions Tests ============
    
    function test_GetRewardInfo() public {
        vm.prank(user1);
        ticket.mintTicket{value: TICKET_PRICE}(user1, "ipfs://metadata");
        
        vm.prank(user1);
        incentives.claimEarlyBird(EVENT_ID, address(ticket));
        
        (
            uint256 rewardId,
            address user,
            string memory rewardType,
            uint256 eventId,
            uint256 timestamp
        ) = incentives.rewards(0);
        
        assertEq(rewardId, 0);
        assertEq(user, user1);
        assertEq(rewardType, "early_bird");
        assertEq(eventId, EVENT_ID);
        assertGt(timestamp, 0);
    }
    
    function test_CheckReferralRewards() public {
        vm.prank(user1);
        bytes32 code = incentives.generateReferralCode();
        
        assertEq(incentives.referralRewards(user1), 0);
        
        vm.prank(user2);
        incentives.useReferralCode(code);
        
        assertEq(incentives.referralRewards(user1), 1);
    }
}
