// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IEventFactory
 * @dev Interface for the EventFactory contract
 * @notice Defines the core functions for event creation and management
 */
interface IEventFactory {
    // ============ Structs ============

    struct Event {
        uint256 id; // Unique event ID
        address organizer; // Event creator
        address ticketContract; // Address of EventTicket contract
        address poapContract; // Address of POAPAttendance contract
        address incentiveContract; // Optional IncentiveManager
        string name; // Event name
        string metadataURI; // IPFS/Arweave JSON with description, image, date, location
        uint256 ticketPrice; // Base price (in wei or USDC if using ERC20)
        uint256 maxTickets; // Ticket cap
        uint256 startTime; // Start timestamp
        uint256 endTime; // End timestamp
        bool isActive; // Event status
        uint256 createdAt; // Creation timestamp
    }

    // ============ Events ============

    event EventCreated(
        uint256 indexed eventId,
        address indexed organizer,
        address indexed ticketContract,
        string name,
        uint256 ticketPrice,
        uint256 maxTickets
    );

    event EventUpdated(
        uint256 indexed eventId,
        string name,
        string metadataURI
    );

    event EventStatusChanged(uint256 indexed eventId, bool isActive);

    event OrganizerVerified(address indexed organizer);
    event OrganizerUnverified(address indexed organizer);

    // ============ Core Functions ============

    /**
     * @notice Creates a new event and deploys its ticketing contract
     * @param name Event name
     * @param metadataURI IPFS URI containing event metadata
     * @param ticketPrice Price per ticket in wei
     * @param maxTickets Maximum number of tickets
     * @param startTime Event start timestamp
     * @param endTime Event end timestamp
     * @return eventId The ID of the newly created event
     */
    function createEvent(
        string calldata name,
        string calldata metadataURI,
        uint256 ticketPrice,
        uint256 maxTickets,
        uint256 startTime,
        uint256 endTime
    ) external returns (uint256 eventId);

    /**
     * @notice Gets complete event information
     * @param eventId Event ID
     * @return Event struct
     */
    function getEvent(uint256 eventId) external view returns (Event memory);

    /**
     * @notice Gets all events created by an organizer
     * @param organizer Organizer address
     * @return Array of event IDs
     */
    function getOrganizerEvents(
        address organizer
    ) external view returns (uint256[] memory);

    /**
     * @notice Gets active events with pagination
     * @param offset Starting index
     * @param limit Number of events to return
     * @return eventIds Array of event IDs
     * @return hasMore Whether there are more events
     */
    function getActiveEvents(
        uint256 offset,
        uint256 limit
    ) external view returns (uint256[] memory eventIds, bool hasMore);

    /**
     * @notice Checks if an address is a verified organizer
     * @param organizer Address to check
     * @return Whether the address is verified
     */
    function isVerifiedOrganizer(
        address organizer
    ) external view returns (bool);

    // ============ View Functions ============

    function eventCount() external view returns (uint256);
    function organizerEvents(
        address organizer,
        uint256 index
    ) external view returns (uint256);
    function verifiedOrganizers(address organizer) external view returns (bool);
    function platformFeeBps() external view returns (uint256);
    function treasury() external view returns (address);
}
