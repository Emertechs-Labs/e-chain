// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "../interfaces/IEventFactory.sol";
import "../interfaces/IEventTicket.sol";

/**
 * @title EventFactory
 * @dev The hub contract that creates and tracks all events on the Echain platform
 * @notice Uses Factory + Registry pattern to deploy and manage EventTicket contracts
 * @author Echain Team
 */
contract EventFactory is IEventFactory, Ownable, ReentrancyGuard, Pausable {
    using Clones for address;

    // ============ State Variables ============

    /// @notice Counter for generating unique event IDs
    uint256 private _eventIdCounter;

    /// @notice Template contract address for EventTicket clones
    address public immutable eventTicketTemplate;

    /// @notice Template contract address for POAP clones (optional)
    address public poapTemplate;

    /// @notice Template contract address for Incentive Manager clones (optional)
    address public incentiveTemplate;

    // Event struct is imported from IEventFactory interface

    /// @notice Mapping from event ID to Event struct
    mapping(uint256 => Event) public events;

    /// @notice Total number of events created
    uint256 public eventCount;

    /// @notice Mapping from organizer address to their event IDs
    mapping(address => uint256[]) public organizerEvents;

    /// @notice Mapping to track verified organizers
    mapping(address => bool) public verifiedOrganizers;

    /// @notice Platform fee percentage (basis points, 100 = 1%)
    uint256 public platformFeeBps = 250; // 2.5% default

    /// @notice Platform treasury address
    address public treasury;

    // ============ Events ============
    // Events are defined in IEventFactory interface

    event PlatformFeeUpdated(uint256 newFeeBps);
    event TreasuryUpdated(address newTreasury);

    // ============ Modifiers ============

    modifier onlyVerifiedOrganizer() {
        require(
            verifiedOrganizers[msg.sender] || msg.sender == owner(),
            "Not verified organizer"
        );
        _;
    }

    modifier validEventId(uint256 eventId) {
        require(eventId > 0 && eventId <= eventCount, "Invalid event ID");
        _;
    }

    modifier onlyEventOrganizer(uint256 eventId) {
        require(events[eventId].organizer == msg.sender, "Not event organizer");
        _;
    }

    // ============ Constructor ============

    constructor(
        address _eventTicketTemplate,
        address _treasury
    ) Ownable(msg.sender) {
        require(_eventTicketTemplate != address(0), "Invalid ticket template");
        require(_treasury != address(0), "Invalid treasury");

        eventTicketTemplate = _eventTicketTemplate;
        treasury = _treasury;

        // Owner is automatically verified
        verifiedOrganizers[msg.sender] = true;
    }

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
    )
        external
        override
        nonReentrant
        whenNotPaused
        onlyVerifiedOrganizer
        returns (uint256 eventId)
    {
        require(bytes(name).length > 0, "Empty event name");
        require(bytes(metadataURI).length > 0, "Empty metadata URI");
        require(maxTickets > 0, "Invalid max tickets");
        require(startTime > block.timestamp, "Start time in past");
        require(endTime > startTime, "End time before start");

        // Increment event counter
        _eventIdCounter++;
        eventId = _eventIdCounter;

        // Deploy EventTicket contract clone
        address ticketContract = eventTicketTemplate.clone();

        // Initialize the ticket contract
        IEventTicket(ticketContract).initialize(
            name,
            "ETICKET",
            msg.sender,
            eventId,
            ticketPrice,
            maxTickets,
            address(this)
        );

        // Create event struct
        Event memory newEvent = Event({
            id: eventId,
            organizer: msg.sender,
            ticketContract: ticketContract,
            poapContract: address(0), // Will be set later if needed
            incentiveContract: address(0), // Will be set later if needed
            name: name,
            metadataURI: metadataURI,
            ticketPrice: ticketPrice,
            maxTickets: maxTickets,
            startTime: startTime,
            endTime: endTime,
            isActive: true,
            createdAt: block.timestamp
        });

        // Store event
        events[eventId] = newEvent;
        eventCount++;

        // Track organizer's events
        organizerEvents[msg.sender].push(eventId);

        emit EventCreated(
            eventId,
            msg.sender,
            ticketContract,
            name,
            ticketPrice,
            maxTickets
        );

        return eventId;
    }

    /**
     * @notice Updates event metadata (only organizer)
     * @param eventId Event ID to update
     * @param name New event name
     * @param metadataURI New metadata URI
     */
    function updateEvent(
        uint256 eventId,
        string calldata name,
        string calldata metadataURI
    ) external validEventId(eventId) onlyEventOrganizer(eventId) {
        require(bytes(name).length > 0, "Empty event name");
        require(bytes(metadataURI).length > 0, "Empty metadata URI");

        Event storage eventData = events[eventId];
        eventData.name = name;
        eventData.metadataURI = metadataURI;

        emit EventUpdated(eventId, name, metadataURI);
    }

    /**
     * @notice Activates or deactivates an event
     * @param eventId Event ID
     * @param isActive New active status
     */
    function setEventStatus(
        uint256 eventId,
        bool isActive
    ) external validEventId(eventId) onlyEventOrganizer(eventId) {
        events[eventId].isActive = isActive;
        emit EventStatusChanged(eventId, isActive);
    }

    /**
     * @notice Links a POAP contract to an event
     * @param eventId Event ID
     * @param poapContract Address of POAP contract
     */
    function setPOAPContract(
        uint256 eventId,
        address poapContract
    ) external validEventId(eventId) onlyEventOrganizer(eventId) {
        require(poapContract != address(0), "Invalid POAP contract");
        events[eventId].poapContract = poapContract;
    }

    /**
     * @notice Links an incentive contract to an event
     * @param eventId Event ID
     * @param incentiveContract Address of incentive contract
     */
    function setIncentiveContract(
        uint256 eventId,
        address incentiveContract
    ) external validEventId(eventId) onlyEventOrganizer(eventId) {
        require(incentiveContract != address(0), "Invalid incentive contract");
        events[eventId].incentiveContract = incentiveContract;
    }

    // ============ View Functions ============

    /**
     * @notice Gets complete event information
     * @param eventId Event ID
     * @return Event struct
     */
    function getEvent(
        uint256 eventId
    ) external view validEventId(eventId) returns (Event memory) {
        return events[eventId];
    }

    /**
     * @notice Gets all events created by an organizer
     * @param organizer Organizer address
     * @return Array of event IDs
     */
    function getOrganizerEvents(
        address organizer
    ) external view returns (uint256[] memory) {
        return organizerEvents[organizer];
    }

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
    ) external view returns (uint256[] memory eventIds, bool hasMore) {
        require(limit > 0 && limit <= 100, "Invalid limit");

        uint256 totalActiveCount = 0;
        uint256 returnedCount = 0;
        uint256[] memory tempIds = new uint256[](limit);

        // First pass: count all active events and collect the requested range
        for (uint256 i = 1; i <= eventCount; i++) {
            if (events[i].isActive && events[i].endTime > block.timestamp) {
                if (totalActiveCount >= offset && returnedCount < limit) {
                    tempIds[returnedCount] = i;
                    returnedCount++;
                }
                totalActiveCount++;
            }
        }

        // Create properly sized array
        eventIds = new uint256[](returnedCount);
        for (uint256 i = 0; i < returnedCount; i++) {
            eventIds[i] = tempIds[i];
        }

        hasMore = totalActiveCount > offset + returnedCount;
    }

    /**
     * @notice Checks if an address is a verified organizer
     * @param organizer Address to check
     * @return Whether the address is verified
     */
    function isVerifiedOrganizer(
        address organizer
    ) external view returns (bool) {
        return verifiedOrganizers[organizer];
    }

    // ============ Admin Functions ============

    /**
     * @notice Verifies an organizer (only owner)
     * @param organizer Address to verify
     */
    function verifyOrganizer(address organizer) external onlyOwner {
        verifiedOrganizers[organizer] = true;
        emit OrganizerVerified(organizer);
    }

    /**
     * @notice Removes organizer verification (only owner)
     * @param organizer Address to unverify
     */
    function unverifyOrganizer(address organizer) external onlyOwner {
        verifiedOrganizers[organizer] = false;
        emit OrganizerUnverified(organizer);
    }

    /**
     * @notice Updates platform fee (only owner)
     * @param newFeeBps New fee in basis points
     */
    function setPlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, "Fee too high"); // Max 10%
        platformFeeBps = newFeeBps;
        emit PlatformFeeUpdated(newFeeBps);
    }

    /**
     * @notice Updates treasury address (only owner)
     * @param newTreasury New treasury address
     */
    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury");
        treasury = newTreasury;
        emit TreasuryUpdated(newTreasury);
    }

    /**
     * @notice Sets POAP template address (only owner)
     * @param newTemplate New POAP template address
     */
    function setPOAPTemplate(address newTemplate) external onlyOwner {
        require(newTemplate != address(0), "Invalid template");
        poapTemplate = newTemplate;
    }

    /**
     * @notice Sets incentive template address (only owner)
     * @param newTemplate New incentive template address
     */
    function setIncentiveTemplate(address newTemplate) external onlyOwner {
        require(newTemplate != address(0), "Invalid template");
        incentiveTemplate = newTemplate;
    }

    /**
     * @notice Pauses the contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpauses the contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ Emergency Functions ============

    /**
     * @notice Emergency function to deactivate an event (only owner)
     * @param eventId Event ID to deactivate
     */
    function emergencyDeactivateEvent(
        uint256 eventId
    ) external onlyOwner validEventId(eventId) {
        events[eventId].isActive = false;
        emit EventStatusChanged(eventId, false);
    }
}
