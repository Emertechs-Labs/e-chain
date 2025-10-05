// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title IEventTicket
 * @dev Interface for EventTicket NFT contracts
 * @notice Defines the core functions for ticket minting and management
 */
interface IEventTicket is IERC721 {
    // ============ Structs ============

    struct TicketInfo {
        uint256 eventId; // Associated event ID
        uint256 seatNumber; // Seat/position number (0 for general admission)
        uint256 tier; // Ticket tier (0=General, 1=VIP, 2=Speaker, etc.)
        bool isUsed; // Whether ticket has been used for entry
        uint256 mintedAt; // Timestamp when minted
        address originalBuyer; // Original purchaser address
    }

    // ============ Events ============

    event TicketMinted(
        uint256 indexed tokenId,
        address indexed to,
        uint256 indexed eventId,
        uint256 seatNumber,
        uint256 tier
    );

    event TicketUsed(
        uint256 indexed tokenId,
        address indexed holder,
        uint256 timestamp
    );

    event TicketTransferRestricted(uint256 indexed tokenId, bool restricted);
    event RoyaltyInfoUpdated(address indexed recipient, uint96 feeBps);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event MaxTicketsPerAddressUpdated(uint256 newLimit);

    // ============ Core Functions ============

    /**
     * @notice Initializes the ticket contract (called by factory)
     * @param name Token name
     * @param symbol Token symbol
     * @param organizer Event organizer address
     * @param eventId Associated event ID
     * @param ticketPrice Price per ticket
     * @param maxSupply Maximum number of tickets
     * @param factory Factory contract address
     */
    function initialize(
        string calldata name,
        string calldata symbol,
        address organizer,
        uint256 eventId,
        uint256 ticketPrice,
        uint256 maxSupply,
        address factory
    ) external;

    /**
     * @notice Allows anyone to purchase tickets directly
     * @param quantity Number of tickets to purchase
     * @return tokenIds Array of minted token IDs
     */
    function purchaseTicket(
        uint256 quantity
    ) external payable returns (uint256[] memory tokenIds);

    /**
     * @notice Mints a ticket to specified address (organizer/factory only)
     * @param to Recipient address
     * @param seatNumber Seat number (0 for general admission)
     * @param tier Ticket tier
     * @return tokenId The minted token ID
     */
    function mintTicket(
        address to,
        uint256 seatNumber,
        uint256 tier
    ) external payable returns (uint256 tokenId);

    /**
     * @notice Batch mints multiple tickets
     * @param to Array of recipient addresses
     * @param seatNumbers Array of seat numbers
     * @param tiers Array of ticket tiers
     * @return tokenIds Array of minted token IDs
     */
    function batchMintTickets(
        address[] calldata to,
        uint256[] calldata seatNumbers,
        uint256[] calldata tiers
    ) external payable returns (uint256[] memory tokenIds);

    /**
     * @notice Marks a ticket as used (for entry)
     * @param tokenId Token ID to mark as used
     */
    function useTicket(uint256 tokenId) external;

    /**
     * @notice Sets transfer restriction for a specific ticket
     * @param tokenId Token ID to restrict
     * @param restricted Whether transfers are restricted
     */
    function setTransferRestriction(uint256 tokenId, bool restricted) external;

    /**
     * @notice Sets maximum tickets allowed per address (organizer only)
     * @param newLimit New maximum tickets per address (0 means unlimited)
     */
    function setMaxTicketsPerAddress(uint256 newLimit) external;

    // ============ View Functions ============

    /**
     * @notice Gets ticket information
     * @param tokenId Token ID
     * @return TicketInfo struct
     */
    function getTicketInfo(
        uint256 tokenId
    ) external view returns (TicketInfo memory);

    /**
     * @notice Checks if a ticket is valid and unused
     * @param tokenId Token ID
     * @return Whether ticket is valid for entry
     */
    function isValidTicket(uint256 tokenId) external view returns (bool);

    /**
     * @notice Gets all tickets owned by an address for this event
     * @param owner Address to check
     * @return tokenIds Array of owned token IDs
     */
    function getOwnerTickets(
        address owner
    ) external view returns (uint256[] memory tokenIds);

    /**
     * @notice Gets total number of tickets sold
     * @return Number of tickets minted
     */
    function totalSold() external view returns (uint256);

    /**
     * @notice Gets remaining tickets available
     * @return Number of tickets remaining
     */
    function ticketsRemaining() external view returns (uint256);

    /**
     * @notice Gets organizer's available balance for withdrawal
     * @return Available balance in wei
     */
    function organizerBalance() external view returns (uint256);

    // ============ Contract Info ============

    function eventId() external view returns (uint256);
    function organizer() external view returns (address);
    function ticketPrice() external view returns (uint256);
    function maxSupply() external view returns (uint256);
    function factory() external view returns (address);
}
