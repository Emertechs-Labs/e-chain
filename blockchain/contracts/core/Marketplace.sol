// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ERC721Holder} from "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {IEventTicket} from "../interfaces/IEventTicket.sol";

/**
 * @title Marketplace
 * @dev Secondary market for trading event tickets
 * @notice Allows ticket holders to resell their tickets with platform fees
 * @author Echain Team
 */
contract Marketplace is Ownable, ReentrancyGuard, Pausable, ERC721Holder {
    // ============ Structs ============

    struct Listing {
        uint256 tokenId;
        address ticketContract;
        address seller;
        uint256 price;
        bool active;
        uint256 listedAt;
    }

    // ============ State Variables ============

    /// @notice Marketplace fee percentage (basis points, 100 = 1%)
    uint256 public marketplaceFee = 250; // 2.5% default

    /// @notice Platform treasury address
    address public treasury;

    /// @notice Mapping from listing ID to Listing struct
    mapping(bytes32 => Listing) public listings;

    /// @notice Mapping to track approved ticket contracts
    mapping(address => bool) public approvedContracts;

    /// @notice Counter for generating unique listing IDs
    uint256 private _listingIdCounter;

    // ============ Events ============

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

    event ContractApproved(address indexed ticketContract, bool approved);
    event MarketplaceFeeUpdated(uint256 newFee);
    event TreasuryUpdated(address newTreasury);

    // ============ Modifiers ============

    modifier validListing(bytes32 listingId) {
        require(listings[listingId].active, "Listing not active");
        require(
            listings[listingId].seller != address(0),
            "Listing does not exist"
        );
        _;
    }

    modifier onlyListingSeller(bytes32 listingId) {
        require(listings[listingId].seller == msg.sender, "Not listing owner");
        _;
    }

    // ============ Constructor ============

    constructor(address _treasury) Ownable(msg.sender) {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
    }

    // ============ Core Functions ============

    /**
     * @notice List a ticket for sale on the marketplace
     * @param ticketContract Address of the EventTicket contract
     * @param tokenId Token ID of the ticket to sell
     * @param price Listing price in wei
     * @return listingId Unique identifier for the listing
     */
    function listTicket(
        address ticketContract,
        uint256 tokenId,
        uint256 price
    ) external whenNotPaused nonReentrant returns (bytes32 listingId) {
        require(approvedContracts[ticketContract], "Contract not approved");
        require(price > 0, "Price must be greater than 0");

        IERC721 nft = IERC721(ticketContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(
            nft.getApproved(tokenId) == address(this) ||
                nft.isApprovedForAll(msg.sender, address(this)),
            "Not approved for transfer"
        );

        // Verify ticket is valid and unused
        IEventTicket eventTicket = IEventTicket(ticketContract);
        require(eventTicket.isValidTicket(tokenId), "Invalid or used ticket");

        // Generate unique listing ID
        _listingIdCounter++;
        listingId = keccak256(
            abi.encodePacked(
                ticketContract,
                tokenId,
                msg.sender,
                _listingIdCounter
            )
        );

        // Transfer ticket to marketplace for escrow
        nft.safeTransferFrom(msg.sender, address(this), tokenId);

        // Create listing
        listings[listingId] = Listing({
            tokenId: tokenId,
            ticketContract: ticketContract,
            seller: msg.sender,
            price: price,
            active: true,
            listedAt: block.timestamp
        });

        emit TicketListed(
            listingId,
            ticketContract,
            tokenId,
            msg.sender,
            price
        );
        return listingId;
    }

    /**
     * @notice Purchase a listed ticket
     * @param listingId Unique identifier of the listing
     */
    function buyTicket(
        bytes32 listingId
    ) external payable whenNotPaused nonReentrant validListing(listingId) {
        Listing storage listing = listings[listingId];
        require(msg.sender != listing.seller, "Cannot buy own listing");
        require(msg.value >= listing.price, "Insufficient payment");

        // Calculate fees
        uint256 fee = (listing.price * marketplaceFee) / 10000;
        uint256 sellerAmount = listing.price - fee;

        // Mark listing as inactive
        listing.active = false;

        // Transfer payments
        (bool feeSuccess, ) = payable(treasury).call{value: fee}("");
        require(feeSuccess, "Treasury transfer failed");
        (bool sellerSuccess, ) = payable(listing.seller).call{
            value: sellerAmount
        }("");
        require(sellerSuccess, "Seller transfer failed");

        // Transfer ticket to buyer
        IERC721(listing.ticketContract).safeTransferFrom(
            address(this),
            msg.sender,
            listing.tokenId
        );

        // Refund excess payment
        if (msg.value > listing.price) {
            (bool refundSuccess, ) = payable(msg.sender).call{
                value: msg.value - listing.price
            }("");
            require(refundSuccess, "Refund failed");
        }

        emit TicketSold(
            listingId,
            msg.sender,
            listing.seller,
            listing.price,
            fee
        );
    }

    /**
     * @notice Cancel a listing and return ticket to seller
     * @param listingId Unique identifier of the listing
     */
    function cancelListing(
        bytes32 listingId
    )
        external
        nonReentrant
        validListing(listingId)
        onlyListingSeller(listingId)
    {
        Listing storage listing = listings[listingId];

        // Mark listing as inactive
        listing.active = false;

        // Return ticket to seller
        IERC721(listing.ticketContract).safeTransferFrom(
            address(this),
            listing.seller,
            listing.tokenId
        );

        emit ListingCancelled(listingId, listing.seller);
    }

    // ============ View Functions ============

    /**
     * @notice Get active listings for a specific ticket contract
     * @dev This is a simplified implementation - in production, consider using an indexing solution
     * @return listingIds Array of active listing IDs
     * @return hasMore Whether there are more listings
     */
    function getActiveListings(
        address /* ticketContract */,
        uint256 /* offset */,
        uint256 /* limit */
    ) external pure returns (bytes32[] memory listingIds, bool hasMore) {
        // This is a simplified implementation - in production, consider using an indexing solution
        // for better performance with large datasets

        // Note: This would need optimization for production use
        // Consider implementing proper indexing for listings

        listingIds = new bytes32[](0);
        hasMore = false; // Simplified for this implementation
    }

    /**
     * @notice Get listing details
     * @param listingId Unique identifier of the listing
     * @return Listing struct
     */
    function getListing(
        bytes32 listingId
    ) external view returns (Listing memory) {
        return listings[listingId];
    }

    // ============ Admin Functions ============

    /**
     * @notice Approve or disapprove a ticket contract for marketplace use
     * @param ticketContract Address of the EventTicket contract
     * @param approved Whether the contract is approved
     */
    function setContractApproval(
        address ticketContract,
        bool approved
    ) external onlyOwner {
        require(ticketContract != address(0), "Invalid contract address");
        approvedContracts[ticketContract] = approved;
        emit ContractApproved(ticketContract, approved);
    }

    /**
     * @notice Update marketplace fee (only owner)
     * @param newFee New fee in basis points (max 10%)
     */
    function setMarketplaceFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        marketplaceFee = newFee;
        emit MarketplaceFeeUpdated(newFee);
    }

    /**
     * @notice Update treasury address (only owner)
     * @param newTreasury New treasury address
     */
    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury address");
        treasury = newTreasury;
        emit TreasuryUpdated(newTreasury);
    }

    /**
     * @notice Pause marketplace operations
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause marketplace operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Emergency function to cancel any listing (admin only)
     * @param listingId Unique identifier of the listing
     */
    function emergencyCancelListing(
        bytes32 listingId
    ) external onlyOwner validListing(listingId) {
        Listing storage listing = listings[listingId];

        // Mark listing as inactive
        listing.active = false;

        // Return ticket to seller
        IERC721(listing.ticketContract).safeTransferFrom(
            address(this),
            listing.seller,
            listing.tokenId
        );

        emit ListingCancelled(listingId, listing.seller);
    }

}
