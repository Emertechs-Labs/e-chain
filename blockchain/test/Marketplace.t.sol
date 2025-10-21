// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Marketplace} from "../contracts/core/Marketplace.sol";
import {EventTicket} from "../contracts/core/EventTicket.sol";
import {EventFactory} from "../contracts/core/EventFactory.sol";

contract MarketplaceTest is Test {
    Marketplace public marketplace;
    EventFactory public factory;
    EventTicket public ticket;
    
    address public owner = address(1);
    address public seller = address(2);
    address public buyer = address(3);
    address public treasury = address(4);
    
    uint256 public constant EVENT_ID = 1;
    uint256 public constant TICKET_PRICE = 0.1 ether;
    uint256 public constant LISTING_PRICE = 0.15 ether;
    
    event TicketListed(
        bytes32 indexed listingId,
        address indexed ticketContract,
        uint256 indexed tokenId,
        address seller,
        uint256 price
    );
    event TicketSold(
        bytes32 indexed listingId,
        address indexed buyer,
        address indexed seller,
        uint256 price,
        uint256 marketplaceFee
    );
    event ListingCancelled(bytes32 indexed listingId, address indexed seller);
    
    function setUp() public {
        // Deploy EventTicket template
        EventTicket template = new EventTicket();
        
        // Deploy EventFactory
        vm.prank(owner);
        factory = new EventFactory(address(template), treasury);
        
        // Deploy Marketplace
        vm.prank(owner);
        marketplace = new Marketplace(treasury);
        
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
        
        // Approve ticket contract in marketplace
        vm.prank(owner);
        marketplace.approveContract(address(ticket), true);
        
        // Fund test accounts
        vm.deal(seller, 10 ether);
        vm.deal(buyer, 10 ether);
    }
    
    // ============ Deployment Tests ============
    
    function test_Deployment() public view {
        assertEq(marketplace.treasury(), treasury);
        assertEq(marketplace.marketplaceFee(), 250); // 2.5%
        assertTrue(marketplace.approvedContracts(address(ticket)));
    }
    
    // ============ Listing Tests ============
    
    function test_ListTicket() public {
        // Mint ticket to seller
        vm.prank(seller);
        uint256 tokenId = ticket.mintTicket{value: TICKET_PRICE}(seller, "ipfs://metadata");
        
        // Approve marketplace
        vm.prank(seller);
        ticket.approve(address(marketplace), tokenId);
        
        // List ticket
        vm.expectEmit(false, true, true, true);
        emit TicketListed(bytes32(0), address(ticket), tokenId, seller, LISTING_PRICE);
        
        vm.prank(seller);
        bytes32 listingId = marketplace.listTicket(address(ticket), tokenId, LISTING_PRICE);
        
        assertNotEq(listingId, bytes32(0));
        
        (
            uint256 listedTokenId,
            address ticketContract,
            address listingSeller,
            uint256 price,
            bool active,
            uint256 listedAt
        ) = marketplace.listings(listingId);
        
        assertEq(listedTokenId, tokenId);
        assertEq(ticketContract, address(ticket));
        assertEq(listingSeller, seller);
        assertEq(price, LISTING_PRICE);
        assertTrue(active);
        assertGt(listedAt, 0);
        
        // Marketplace should now own the ticket
        assertEq(ticket.ownerOf(tokenId), address(marketplace));
    }
    
    function test_RevertListUnapprovedContract() public {
        EventTicket unapprovedTicket = new EventTicket();
        
        vm.prank(seller);
        vm.expectRevert("Contract not approved");
        marketplace.listTicket(address(unapprovedTicket), 0, LISTING_PRICE);
    }
    
    function test_RevertListNotOwner() public {
        vm.prank(seller);
        uint256 tokenId = ticket.mintTicket{value: TICKET_PRICE}(seller, "ipfs://metadata");
        
        vm.prank(buyer);
        vm.expectRevert();
        marketplace.listTicket(address(ticket), tokenId, LISTING_PRICE);
    }
    
    function test_RevertListZeroPrice() public {
        vm.prank(seller);
        uint256 tokenId = ticket.mintTicket{value: TICKET_PRICE}(seller, "ipfs://metadata");
        
        vm.prank(seller);
        ticket.approve(address(marketplace), tokenId);
        
        vm.prank(seller);
        vm.expectRevert("Price must be > 0");
        marketplace.listTicket(address(ticket), tokenId, 0);
    }
    
    // ============ Purchase Tests ============
    
    function test_BuyTicket() public {
        // Seller lists ticket
        vm.prank(seller);
        uint256 tokenId = ticket.mintTicket{value: TICKET_PRICE}(seller, "ipfs://metadata");
        
        vm.prank(seller);
        ticket.approve(address(marketplace), tokenId);
        
        vm.prank(seller);
        bytes32 listingId = marketplace.listTicket(address(ticket), tokenId, LISTING_PRICE);
        
        // Calculate expected fees
        uint256 fee = (LISTING_PRICE * 250) / 10000; // 2.5%
        uint256 sellerAmount = LISTING_PRICE - fee;
        
        uint256 sellerBalanceBefore = seller.balance;
        uint256 treasuryBalanceBefore = treasury.balance;
        
        // Buyer purchases ticket
        vm.expectEmit(true, true, true, true);
        emit TicketSold(listingId, buyer, seller, LISTING_PRICE, fee);
        
        vm.prank(buyer);
        marketplace.buyTicket{value: LISTING_PRICE}(listingId);
        
        // Check balances
        assertEq(seller.balance, sellerBalanceBefore + sellerAmount);
        assertEq(treasury.balance, treasuryBalanceBefore + fee);
        
        // Check ticket ownership
        assertEq(ticket.ownerOf(tokenId), buyer);
        
        // Check listing is inactive
        (, , , , bool active, ) = marketplace.listings(listingId);
        assertFalse(active);
    }
    
    function test_RevertBuyInsufficientPayment() public {
        vm.prank(seller);
        uint256 tokenId = ticket.mintTicket{value: TICKET_PRICE}(seller, "ipfs://metadata");
        
        vm.prank(seller);
        ticket.approve(address(marketplace), tokenId);
        
        vm.prank(seller);
        bytes32 listingId = marketplace.listTicket(address(ticket), tokenId, LISTING_PRICE);
        
        vm.prank(buyer);
        vm.expectRevert("Insufficient payment");
        marketplace.buyTicket{value: 0.1 ether}(listingId);
    }
    
    function test_RevertBuyOwnListing() public {
        vm.prank(seller);
        uint256 tokenId = ticket.mintTicket{value: TICKET_PRICE}(seller, "ipfs://metadata");
        
        vm.prank(seller);
        ticket.approve(address(marketplace), tokenId);
        
        vm.prank(seller);
        bytes32 listingId = marketplace.listTicket(address(ticket), tokenId, LISTING_PRICE);
        
        vm.prank(seller);
        vm.expectRevert("Cannot buy own listing");
        marketplace.buyTicket{value: LISTING_PRICE}(listingId);
    }
    
    function test_RevertBuyInactiveListing() public {
        vm.prank(seller);
        uint256 tokenId = ticket.mintTicket{value: TICKET_PRICE}(seller, "ipfs://metadata");
        
        vm.prank(seller);
        ticket.approve(address(marketplace), tokenId);
        
        vm.prank(seller);
        bytes32 listingId = marketplace.listTicket(address(ticket), tokenId, LISTING_PRICE);
        
        // Cancel listing
        vm.prank(seller);
        marketplace.cancelListing(listingId);
        
        // Try to buy
        vm.prank(buyer);
        vm.expectRevert("Listing not active");
        marketplace.buyTicket{value: LISTING_PRICE}(listingId);
    }
    
    // ============ Cancel Listing Tests ============
    
    function test_CancelListing() public {
        vm.prank(seller);
        uint256 tokenId = ticket.mintTicket{value: TICKET_PRICE}(seller, "ipfs://metadata");
        
        vm.prank(seller);
        ticket.approve(address(marketplace), tokenId);
        
        vm.prank(seller);
        bytes32 listingId = marketplace.listTicket(address(ticket), tokenId, LISTING_PRICE);
        
        vm.expectEmit(true, true, false, false);
        emit ListingCancelled(listingId, seller);
        
        vm.prank(seller);
        marketplace.cancelListing(listingId);
        
        // Check listing is inactive
        (, , , , bool active, ) = marketplace.listings(listingId);
        assertFalse(active);
        
        // Check ticket returned to seller
        assertEq(ticket.ownerOf(tokenId), seller);
    }
    
    function test_RevertCancelNotSeller() public {
        vm.prank(seller);
        uint256 tokenId = ticket.mintTicket{value: TICKET_PRICE}(seller, "ipfs://metadata");
        
        vm.prank(seller);
        ticket.approve(address(marketplace), tokenId);
        
        vm.prank(seller);
        bytes32 listingId = marketplace.listTicket(address(ticket), tokenId, LISTING_PRICE);
        
        vm.prank(buyer);
        vm.expectRevert("Not the seller");
        marketplace.cancelListing(listingId);
    }
    
    // ============ Update Listing Tests ============
    
    function test_UpdateListingPrice() public {
        vm.prank(seller);
        uint256 tokenId = ticket.mintTicket{value: TICKET_PRICE}(seller, "ipfs://metadata");
        
        vm.prank(seller);
        ticket.approve(address(marketplace), tokenId);
        
        vm.prank(seller);
        bytes32 listingId = marketplace.listTicket(address(ticket), tokenId, LISTING_PRICE);
        
        uint256 newPrice = 0.2 ether;
        
        vm.prank(seller);
        marketplace.updateListingPrice(listingId, newPrice);
        
        (, , , uint256 price, , ) = marketplace.listings(listingId);
        assertEq(price, newPrice);
    }
    
    function test_RevertUpdatePriceNotSeller() public {
        vm.prank(seller);
        uint256 tokenId = ticket.mintTicket{value: TICKET_PRICE}(seller, "ipfs://metadata");
        
        vm.prank(seller);
        ticket.approve(address(marketplace), tokenId);
        
        vm.prank(seller);
        bytes32 listingId = marketplace.listTicket(address(ticket), tokenId, LISTING_PRICE);
        
        vm.prank(buyer);
        vm.expectRevert("Not the seller");
        marketplace.updateListingPrice(listingId, 0.2 ether);
    }
    
    function test_RevertUpdatePriceZero() public {
        vm.prank(seller);
        uint256 tokenId = ticket.mintTicket{value: TICKET_PRICE}(seller, "ipfs://metadata");
        
        vm.prank(seller);
        ticket.approve(address(marketplace), tokenId);
        
        vm.prank(seller);
        bytes32 listingId = marketplace.listTicket(address(ticket), tokenId, LISTING_PRICE);
        
        vm.prank(seller);
        vm.expectRevert("Price must be > 0");
        marketplace.updateListingPrice(listingId, 0);
    }
    
    // ============ Admin Functions Tests ============
    
    function test_SetMarketplaceFee() public {
        vm.prank(owner);
        marketplace.setMarketplaceFee(500); // 5%
        
        assertEq(marketplace.marketplaceFee(), 500);
    }
    
    function test_RevertSetMarketplaceFeeTooHigh() public {
        vm.prank(owner);
        vm.expectRevert("Fee too high");
        marketplace.setMarketplaceFee(1001); // >10%
    }
    
    function test_RevertSetMarketplaceFeeUnauthorized() public {
        vm.prank(seller);
        vm.expectRevert();
        marketplace.setMarketplaceFee(500);
    }
    
    function test_SetTreasury() public {
        address newTreasury = address(999);
        
        vm.prank(owner);
        marketplace.setTreasury(newTreasury);
        
        assertEq(marketplace.treasury(), newTreasury);
    }
    
    function test_RevertSetTreasuryZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert("Invalid treasury");
        marketplace.setTreasury(address(0));
    }
    
    function test_ApproveContract() public {
        address newContract = address(888);
        
        vm.prank(owner);
        marketplace.approveContract(newContract, true);
        
        assertTrue(marketplace.approvedContracts(newContract));
        
        vm.prank(owner);
        marketplace.approveContract(newContract, false);
        
        assertFalse(marketplace.approvedContracts(newContract));
    }
    
    // ============ Pause/Unpause Tests ============
    
    function test_PauseUnpause() public {
        vm.prank(owner);
        marketplace.pause();
        assertTrue(marketplace.paused());
        
        vm.prank(owner);
        marketplace.unpause();
        assertFalse(marketplace.paused());
    }
    
    function test_RevertListWhenPaused() public {
        vm.prank(seller);
        uint256 tokenId = ticket.mintTicket{value: TICKET_PRICE}(seller, "ipfs://metadata");
        
        vm.prank(seller);
        ticket.approve(address(marketplace), tokenId);
        
        vm.prank(owner);
        marketplace.pause();
        
        vm.prank(seller);
        vm.expectRevert();
        marketplace.listTicket(address(ticket), tokenId, LISTING_PRICE);
    }
    
    function test_RevertBuyWhenPaused() public {
        vm.prank(seller);
        uint256 tokenId = ticket.mintTicket{value: TICKET_PRICE}(seller, "ipfs://metadata");
        
        vm.prank(seller);
        ticket.approve(address(marketplace), tokenId);
        
        vm.prank(seller);
        bytes32 listingId = marketplace.listTicket(address(ticket), tokenId, LISTING_PRICE);
        
        vm.prank(owner);
        marketplace.pause();
        
        vm.prank(buyer);
        vm.expectRevert();
        marketplace.buyTicket{value: LISTING_PRICE}(listingId);
    }
    
    // ============ View Functions Tests ============
    
    function test_GetListingInfo() public {
        vm.prank(seller);
        uint256 tokenId = ticket.mintTicket{value: TICKET_PRICE}(seller, "ipfs://metadata");
        
        vm.prank(seller);
        ticket.approve(address(marketplace), tokenId);
        
        vm.prank(seller);
        bytes32 listingId = marketplace.listTicket(address(ticket), tokenId, LISTING_PRICE);
        
        (
            uint256 listedTokenId,
            address ticketContract,
            address listingSeller,
            uint256 price,
            bool active,
            uint256 listedAt
        ) = marketplace.listings(listingId);
        
        assertEq(listedTokenId, tokenId);
        assertEq(ticketContract, address(ticket));
        assertEq(listingSeller, seller);
        assertEq(price, LISTING_PRICE);
        assertTrue(active);
        assertGt(listedAt, 0);
    }
    
    function test_CalculateFees() public view {
        uint256 price = 1 ether;
        uint256 expectedFee = (price * 250) / 10000; // 2.5%
        
        assertEq(expectedFee, 0.025 ether);
    }
}
