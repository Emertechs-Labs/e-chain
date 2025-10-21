// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {POAPAttendance} from "../contracts/modules/POAPAttendance.sol";
import {EventFactory} from "../contracts/core/EventFactory.sol";

contract POAPAttendanceTest is Test {
    POAPAttendance public poap;
    EventFactory public factory;
    
    address public owner = address(1);
    address public organizer = address(2);
    address public attendee = address(3);
    address public attendee2 = address(4);
    address public treasury = address(5);
    
    uint256 public constant EVENT_ID = 1;
    
    // EIP-712 domain separator components
    bytes32 private constant MINT_ATTENDANCE_TYPEHASH =
        keccak256(
            "MintAttendance(uint256 eventId,address attendee,uint256 nonce,uint256 deadline)"
        );
    
    uint256 private organizerPrivateKey = 0xA11CE;
    address private organizerSigner;
    
    event AttendanceMinted(uint256 indexed eventId, address indexed attendee, uint256 tokenId);
    
    function setUp() public {
        organizerSigner = vm.addr(organizerPrivateKey);
        
        // Deploy factory (needed for POAP contract)
        vm.prank(owner);
        factory = new EventFactory(address(0), treasury);
        
        // Deploy POAP contract
        vm.prank(owner);
        poap = new POAPAttendance(address(factory));
    }
    
    // ============ Deployment Tests ============
    
    function test_Deployment() public view {
        assertEq(poap.name(), "POAP Attendance");
        assertEq(poap.symbol(), "POAP");
        assertEq(poap.eventFactory(), address(factory));
        assertEq(poap.owner(), owner);
    }
    
    // ============ Signature Helper Functions ============
    
    function _getDigest(
        uint256 eventId,
        address _attendee,
        uint256 nonce,
        uint256 deadline
    ) internal view returns (bytes32) {
        bytes32 structHash = keccak256(
            abi.encode(MINT_ATTENDANCE_TYPEHASH, eventId, _attendee, nonce, deadline)
        );
        
        return keccak256(
            abi.encodePacked(
                "\x19\x01",
                poap.DOMAIN_SEPARATOR(),
                structHash
            )
        );
    }
    
    function _signMintAttendance(
        uint256 eventId,
        address _attendee,
        uint256 nonce,
        uint256 deadline
    ) internal view returns (bytes memory) {
        bytes32 digest = _getDigest(eventId, _attendee, nonce, deadline);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(organizerPrivateKey, digest);
        return abi.encodePacked(r, s, v);
    }
    
    // ============ Minting Tests ============
    
    function test_MintAttendance() public {
        uint256 nonce = poap.nonces(attendee);
        uint256 deadline = block.timestamp + 1 hours;
        
        bytes memory signature = _signMintAttendance(EVENT_ID, attendee, nonce, deadline);
        
        vm.prank(owner);
        poap.setEventOrganizer(EVENT_ID, organizerSigner);
        
        vm.expectEmit(true, true, false, true);
        emit AttendanceMinted(EVENT_ID, attendee, 0);
        
        vm.prank(attendee);
        poap.mintAttendance(EVENT_ID, attendee, nonce, deadline, signature);
        
        assertEq(poap.ownerOf(0), attendee);
        assertTrue(poap.hasClaimed(EVENT_ID, attendee));
        assertEq(poap.nonces(attendee), nonce + 1);
    }
    
    function test_MintMultipleAttendees() public {
        uint256 deadline = block.timestamp + 1 hours;
        
        vm.prank(owner);
        poap.setEventOrganizer(EVENT_ID, organizerSigner);
        
        // Mint for attendee 1
        uint256 nonce1 = poap.nonces(attendee);
        bytes memory sig1 = _signMintAttendance(EVENT_ID, attendee, nonce1, deadline);
        
        vm.prank(attendee);
        poap.mintAttendance(EVENT_ID, attendee, nonce1, deadline, sig1);
        
        // Mint for attendee 2
        uint256 nonce2 = poap.nonces(attendee2);
        bytes memory sig2 = _signMintAttendance(EVENT_ID, attendee2, nonce2, deadline);
        
        vm.prank(attendee2);
        poap.mintAttendance(EVENT_ID, attendee2, nonce2, deadline, sig2);
        
        assertEq(poap.ownerOf(0), attendee);
        assertEq(poap.ownerOf(1), attendee2);
        assertTrue(poap.hasClaimed(EVENT_ID, attendee));
        assertTrue(poap.hasClaimed(EVENT_ID, attendee2));
    }
    
    function test_RevertAlreadyClaimed() public {
        uint256 nonce = poap.nonces(attendee);
        uint256 deadline = block.timestamp + 1 hours;
        
        bytes memory signature = _signMintAttendance(EVENT_ID, attendee, nonce, deadline);
        
        vm.prank(owner);
        poap.setEventOrganizer(EVENT_ID, organizerSigner);
        
        vm.prank(attendee);
        poap.mintAttendance(EVENT_ID, attendee, nonce, deadline, signature);
        
        // Try to claim again
        uint256 newNonce = poap.nonces(attendee);
        bytes memory newSignature = _signMintAttendance(EVENT_ID, attendee, newNonce, deadline);
        
        vm.prank(attendee);
        vm.expectRevert(POAPAttendance.AlreadyClaimed.selector);
        poap.mintAttendance(EVENT_ID, attendee, newNonce, deadline, newSignature);
    }
    
    function test_RevertInvalidNonce() public {
        uint256 wrongNonce = 999;
        uint256 deadline = block.timestamp + 1 hours;
        
        bytes memory signature = _signMintAttendance(EVENT_ID, attendee, wrongNonce, deadline);
        
        vm.prank(owner);
        poap.setEventOrganizer(EVENT_ID, organizerSigner);
        
        vm.prank(attendee);
        vm.expectRevert("Invalid nonce");
        poap.mintAttendance(EVENT_ID, attendee, wrongNonce, deadline, signature);
    }
    
    function test_RevertExpiredDeadline() public {
        uint256 nonce = poap.nonces(attendee);
        uint256 deadline = block.timestamp - 1; // Expired
        
        bytes memory signature = _signMintAttendance(EVENT_ID, attendee, nonce, deadline);
        
        vm.prank(owner);
        poap.setEventOrganizer(EVENT_ID, organizerSigner);
        
        vm.prank(attendee);
        vm.expectRevert("Signature expired");
        poap.mintAttendance(EVENT_ID, attendee, nonce, deadline, signature);
    }
    
    function test_RevertInvalidSignature() public {
        uint256 nonce = poap.nonces(attendee);
        uint256 deadline = block.timestamp + 1 hours;
        
        // Create signature with wrong private key
        uint256 wrongPrivateKey = 0xBAD;
        bytes32 digest = _getDigest(EVENT_ID, attendee, nonce, deadline);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(wrongPrivateKey, digest);
        bytes memory wrongSignature = abi.encodePacked(r, s, v);
        
        vm.prank(owner);
        poap.setEventOrganizer(EVENT_ID, organizerSigner);
        
        vm.prank(attendee);
        vm.expectRevert(POAPAttendance.InvalidSignature.selector);
        poap.mintAttendance(EVENT_ID, attendee, nonce, deadline, wrongSignature);
    }
    
    function test_RevertNotRegistered() public {
        uint256 nonce = poap.nonces(attendee);
        uint256 deadline = block.timestamp + 1 hours;
        
        bytes memory signature = _signMintAttendance(EVENT_ID, attendee, nonce, deadline);
        
        // Don't set event organizer
        
        vm.prank(attendee);
        vm.expectRevert(POAPAttendance.NotRegistered.selector);
        poap.mintAttendance(EVENT_ID, attendee, nonce, deadline, signature);
    }
    
    // ============ Soulbound Tests ============
    
    function test_RevertTransfer() public {
        uint256 nonce = poap.nonces(attendee);
        uint256 deadline = block.timestamp + 1 hours;
        
        bytes memory signature = _signMintAttendance(EVENT_ID, attendee, nonce, deadline);
        
        vm.prank(owner);
        poap.setEventOrganizer(EVENT_ID, organizerSigner);
        
        vm.prank(attendee);
        poap.mintAttendance(EVENT_ID, attendee, nonce, deadline, signature);
        
        // Try to transfer (should fail - soulbound)
        vm.prank(attendee);
        vm.expectRevert(POAPAttendance.SoulboundTransfer.selector);
        poap.transferFrom(attendee, attendee2, 0);
    }
    
    function test_RevertSafeTransfer() public {
        uint256 nonce = poap.nonces(attendee);
        uint256 deadline = block.timestamp + 1 hours;
        
        bytes memory signature = _signMintAttendance(EVENT_ID, attendee, nonce, deadline);
        
        vm.prank(owner);
        poap.setEventOrganizer(EVENT_ID, organizerSigner);
        
        vm.prank(attendee);
        poap.mintAttendance(EVENT_ID, attendee, nonce, deadline, signature);
        
        // Try to safe transfer (should fail - soulbound)
        vm.prank(attendee);
        vm.expectRevert(POAPAttendance.SoulboundTransfer.selector);
        poap.safeTransferFrom(attendee, attendee2, 0);
    }
    
    // ============ Admin Functions Tests ============
    
    function test_SetEventOrganizer() public {
        vm.prank(owner);
        poap.setEventOrganizer(EVENT_ID, organizer);
        
        assertEq(poap.eventOrganizers(EVENT_ID), organizer);
    }
    
    function test_RevertSetEventOrganizerUnauthorized() public {
        vm.prank(attendee);
        vm.expectRevert();
        poap.setEventOrganizer(EVENT_ID, organizer);
    }
    
    function test_SetEventFactory() public {
        address newFactory = address(999);
        
        vm.prank(owner);
        poap.setEventFactory(newFactory);
        
        assertEq(poap.eventFactory(), newFactory);
    }
    
    // ============ View Functions Tests ============
    
    function test_GetAttendanceInfo() public {
        uint256 nonce = poap.nonces(attendee);
        uint256 deadline = block.timestamp + 1 hours;
        
        bytes memory signature = _signMintAttendance(EVENT_ID, attendee, nonce, deadline);
        
        vm.prank(owner);
        poap.setEventOrganizer(EVENT_ID, organizerSigner);
        
        vm.prank(attendee);
        poap.mintAttendance(EVENT_ID, attendee, nonce, deadline, signature);
        
        (
            uint256 eventId,
            uint256 tokenId,
            address _attendee,
            uint256 timestamp
        ) = poap.attendances(0);
        
        assertEq(eventId, EVENT_ID);
        assertEq(tokenId, 0);
        assertEq(_attendee, attendee);
        assertGt(timestamp, 0);
    }
    
    function test_CheckHasClaimed() public {
        assertFalse(poap.hasClaimed(EVENT_ID, attendee));
        
        uint256 nonce = poap.nonces(attendee);
        uint256 deadline = block.timestamp + 1 hours;
        
        bytes memory signature = _signMintAttendance(EVENT_ID, attendee, nonce, deadline);
        
        vm.prank(owner);
        poap.setEventOrganizer(EVENT_ID, organizerSigner);
        
        vm.prank(attendee);
        poap.mintAttendance(EVENT_ID, attendee, nonce, deadline, signature);
        
        assertTrue(poap.hasClaimed(EVENT_ID, attendee));
    }
    
    function test_DomainSeparator() public view {
        bytes32 domainSeparator = poap.DOMAIN_SEPARATOR();
        assertNotEq(domainSeparator, bytes32(0));
    }
}
