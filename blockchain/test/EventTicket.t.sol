// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {EventTicket} from "../contracts/core/EventTicket.sol";
import {EventFactory} from "../contracts/core/EventFactory.sol";

contract EventTicketTest is Test {
    EventTicket public ticket;
    EventFactory public factory;
    
    address public owner = address(1);
    address public organizer = address(2);
    address public buyer = address(3);
    address public buyer2 = address(4);
    address public treasury = address(5);
    
    uint256 public constant EVENT_ID = 1;
    uint256 public constant TICKET_PRICE = 0.1 ether;
    uint256 public constant MAX_SUPPLY = 100;
    
    event TicketMinted(uint256 indexed tokenId, address indexed buyer, uint256 eventId);
    event TicketUsed(uint256 indexed tokenId, address indexed user);
    event TicketRefunded(uint256 indexed tokenId, address indexed buyer, uint256 amount);
    
    function setUp() public {
        // Deploy EventTicket template
        EventTicket template = new EventTicket();
        
        // Deploy EventFactory
        vm.prank(owner);
        factory = new EventFactory(address(template), treasury);
        
        // Deploy EventTicket instance
        ticket = new EventTicket();
        
        // Initialize ticket contract
        vm.prank(address(factory));
        ticket.initialize(
            EVENT_ID,
            organizer,
            TICKET_PRICE,
            MAX_SUPPLY,
            "Test Event Ticket",
            "TET",
            address(factory)
        );
        
        // Fund test accounts
        vm.deal(buyer, 10 ether);
        vm.deal(buyer2, 10 ether);
    }
    
    // ============ Initialization Tests ============
    
    function test_Initialization() public view {
        assertEq(ticket.eventId(), EVENT_ID);
        assertEq(ticket.organizer(), organizer);
        assertEq(ticket.ticketPrice(), TICKET_PRICE);
        assertEq(ticket.maxSupply(), MAX_SUPPLY);
        assertEq(ticket.factory(), address(factory));
        assertEq(ticket.name(), "Test Event Ticket");
        assertEq(ticket.symbol(), "TET");
    }
    
    function test_CannotReinitialize() public {
        vm.expectRevert("Already initialized");
        ticket.initialize(
            EVENT_ID,
            organizer,
            TICKET_PRICE,
            MAX_SUPPLY,
            "Test Event Ticket",
            "TET",
            address(factory)
        );
    }
    
    // ============ Minting Tests ============
    
    function test_MintTicket() public {
        vm.prank(buyer);
        vm.expectEmit(true, true, false, true);
        emit TicketMinted(0, buyer, EVENT_ID);
        
        uint256 tokenId = ticket.mintTicket{value: TICKET_PRICE}(buyer, "ipfs://metadata");
        
        assertEq(tokenId, 0);
        assertEq(ticket.ownerOf(tokenId), buyer);
        assertEq(ticket.totalSold(), 1);
        assertEq(ticket.tokenURI(tokenId), "ipfs://metadata");
    }
    
    function test_MintMultipleTickets() public {
        vm.prank(buyer);
        ticket.mintTicket{value: TICKET_PRICE}(buyer, "ipfs://metadata1");
        
        vm.prank(buyer2);
        ticket.mintTicket{value: TICKET_PRICE}(buyer2, "ipfs://metadata2");
        
        assertEq(ticket.totalSold(), 2);
        assertEq(ticket.ownerOf(0), buyer);
        assertEq(ticket.ownerOf(1), buyer2);
    }
    
    function test_RevertMintInsufficientPayment() public {
        vm.prank(buyer);
        vm.expectRevert("Insufficient payment");
        ticket.mintTicket{value: 0.05 ether}(buyer, "ipfs://metadata");
    }
    
    function test_RevertMintWhenPaused() public {
        vm.prank(organizer);
        ticket.pause();
        
        vm.prank(buyer);
        vm.expectRevert();
        ticket.mintTicket{value: TICKET_PRICE}(buyer, "ipfs://metadata");
    }
    
    function test_RevertMintExceedsMaxSupply() public {
        // Mint max supply
        for (uint256 i = 0; i < MAX_SUPPLY; i++) {
            vm.prank(buyer);
            ticket.mintTicket{value: TICKET_PRICE}(buyer, "ipfs://metadata");
        }
        
        // Try to mint one more
        vm.prank(buyer);
        vm.expectRevert("Max supply reached");
        ticket.mintTicket{value: TICKET_PRICE}(buyer, "ipfs://metadata");
    }
    
    // ============ Batch Minting Tests ============
    
    function test_BatchMint() public {
        address[] memory recipients = new address[](3);
        recipients[0] = buyer;
        recipients[1] = buyer2;
        recipients[2] = address(6);
        
        string[] memory uris = new string[](3);
        uris[0] = "ipfs://metadata1";
        uris[1] = "ipfs://metadata2";
        uris[2] = "ipfs://metadata3";
        
        vm.prank(organizer);
        uint256[] memory tokenIds = ticket.batchMint(recipients, uris);
        
        assertEq(tokenIds.length, 3);
        assertEq(ticket.totalSold(), 3);
        assertEq(ticket.ownerOf(0), buyer);
        assertEq(ticket.ownerOf(1), buyer2);
        assertEq(ticket.ownerOf(2), address(6));
    }
    
    function test_RevertBatchMintArrayMismatch() public {
        address[] memory recipients = new address[](2);
        recipients[0] = buyer;
        recipients[1] = buyer2;
        
        string[] memory uris = new string[](3);
        uris[0] = "ipfs://metadata1";
        uris[1] = "ipfs://metadata2";
        uris[2] = "ipfs://metadata3";
        
        vm.prank(organizer);
        vm.expectRevert("Array length mismatch");
        ticket.batchMint(recipients, uris);
    }
    
    // ============ Ticket Usage Tests ============
    
    function test_UseTicket() public {
        vm.prank(buyer);
        uint256 tokenId = ticket.mintTicket{value: TICKET_PRICE}(buyer, "ipfs://metadata");
        
        vm.prank(organizer);
        vm.expectEmit(true, true, false, false);
        emit TicketUsed(tokenId, buyer);
        
        ticket.useTicket(tokenId);
        
        assertTrue(ticket.isTicketUsed(tokenId));
    }
    
    function test_RevertUseTicketTwice() public {
        vm.prank(buyer);
        uint256 tokenId = ticket.mintTicket{value: TICKET_PRICE}(buyer, "ipfs://metadata");
        
        vm.prank(organizer);
        ticket.useTicket(tokenId);
        
        vm.prank(organizer);
        vm.expectRevert("Ticket already used");
        ticket.useTicket(tokenId);
    }
    
    function test_RevertUseTicketUnauthorized() public {
        vm.prank(buyer);
        uint256 tokenId = ticket.mintTicket{value: TICKET_PRICE}(buyer, "ipfs://metadata");
        
        vm.prank(buyer2);
        vm.expectRevert();
        ticket.useTicket(tokenId);
    }
    
    // ============ Refund Tests ============
    
    function test_RefundTicket() public {
        vm.prank(buyer);
        uint256 tokenId = ticket.mintTicket{value: TICKET_PRICE}(buyer, "ipfs://metadata");
        
        uint256 balanceBefore = buyer.balance;
        
        vm.prank(organizer);
        vm.expectEmit(true, true, false, true);
        emit TicketRefunded(tokenId, buyer, TICKET_PRICE);
        
        ticket.refundTicket(tokenId);
        
        assertEq(buyer.balance, balanceBefore + TICKET_PRICE);
        vm.expectRevert();
        ticket.ownerOf(tokenId); // Token should be burned
    }
    
    function test_RevertRefundUsedTicket() public {
        vm.prank(buyer);
        uint256 tokenId = ticket.mintTicket{value: TICKET_PRICE}(buyer, "ipfs://metadata");
        
        vm.prank(organizer);
        ticket.useTicket(tokenId);
        
        vm.prank(organizer);
        vm.expectRevert("Ticket already used");
        ticket.refundTicket(tokenId);
    }
    
    // ============ Transfer Restriction Tests ============
    
    function test_TransferWhenNotRestricted() public {
        vm.prank(buyer);
        uint256 tokenId = ticket.mintTicket{value: TICKET_PRICE}(buyer, "ipfs://metadata");
        
        vm.prank(buyer);
        ticket.transferFrom(buyer, buyer2, tokenId);
        
        assertEq(ticket.ownerOf(tokenId), buyer2);
    }
    
    function test_RevertTransferWhenRestricted() public {
        vm.prank(buyer);
        uint256 tokenId = ticket.mintTicket{value: TICKET_PRICE}(buyer, "ipfs://metadata");
        
        vm.prank(organizer);
        ticket.setTransferRestriction(tokenId, true);
        
        vm.prank(buyer);
        vm.expectRevert("Transfer restricted");
        ticket.transferFrom(buyer, buyer2, tokenId);
    }
    
    // ============ Royalty Tests (EIP-2981) ============
    
    function test_SetRoyaltyInfo() public {
        vm.prank(organizer);
        ticket.setRoyaltyInfo(organizer, 500); // 5%
        
        (address recipient, uint256 amount) = ticket.royaltyInfo(0, 1 ether);
        assertEq(recipient, organizer);
        assertEq(amount, 0.05 ether);
    }
    
    function test_RevertSetRoyaltyTooHigh() public {
        vm.prank(organizer);
        vm.expectRevert("Royalty too high");
        ticket.setRoyaltyInfo(organizer, 5001); // >50%
    }
    
    // ============ Pause/Unpause Tests ============
    
    function test_PauseUnpause() public {
        vm.prank(organizer);
        ticket.pause();
        assertTrue(ticket.paused());
        
        vm.prank(organizer);
        ticket.unpause();
        assertFalse(ticket.paused());
    }
    
    function test_RevertPauseUnauthorized() public {
        vm.prank(buyer);
        vm.expectRevert();
        ticket.pause();
    }
    
    // ============ Withdrawal Tests ============
    
    function test_WithdrawFunds() public {
        // Mint some tickets to generate revenue
        vm.prank(buyer);
        ticket.mintTicket{value: TICKET_PRICE}(buyer, "ipfs://metadata");
        
        uint256 balanceBefore = organizer.balance;
        uint256 contractBalance = address(ticket).balance;
        
        vm.prank(organizer);
        ticket.withdraw();
        
        assertEq(organizer.balance, balanceBefore + contractBalance);
        assertEq(address(ticket).balance, 0);
    }
    
    function test_RevertWithdrawUnauthorized() public {
        vm.prank(buyer);
        vm.expectRevert();
        ticket.withdraw();
    }
    
    // ============ View Function Tests ============
    
    function test_GetTicketInfo() public {
        vm.prank(buyer);
        uint256 tokenId = ticket.mintTicket{value: TICKET_PRICE}(buyer, "ipfs://metadata");
        
        (
            uint256 eventId,
            address ticketOwner,
            uint256 purchaseTime,
            bool used,
            bool transferRestricted
        ) = ticket.getTicketInfo(tokenId);
        
        assertEq(eventId, EVENT_ID);
        assertEq(ticketOwner, buyer);
        assertGt(purchaseTime, 0);
        assertFalse(used);
        assertFalse(transferRestricted);
    }
    
    function test_SupportsInterface() public view {
        // ERC721
        assertTrue(ticket.supportsInterface(0x80ac58cd));
        // ERC2981 (Royalty)
        assertTrue(ticket.supportsInterface(0x2a55205a));
    }
}
