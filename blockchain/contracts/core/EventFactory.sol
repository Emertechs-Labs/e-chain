// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {IEventFactory} from "../interfaces/IEventFactory.sol";
import {IEventTicket} from "../interfaces/IEventTicket.sol";

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
    address public immutable EVENT_TICKET_TEMPLATE;

    /// @notice Template contract address for POAP clones (optional)
    address public poapTemplate;

    /// @notice Template contract address for Incentive Manager clones (optional)
    address public incentiveTemplate;

    // Event struct is imported from IEventFactory interface

    /// @notice Mapping from event ID to Event struct
    mapping(uint256 => Event) public events;

    /// @notice Total number of events created
    uint256 public eventCount;

    /// @notice Array of active event IDs for efficient querying
    uint256[] private _activeEvents;

    /// @notice Mapping to track position of event ID in active events array
    mapping(uint256 => uint256) private _activeEventIndex;

    /// @notice Mapping from organizer address to their event IDs
    mapping(address => uint256[]) public organizerEvents;

    /// @notice Mapping to track verified organizers
    mapping(address => bool) public verifiedOrganizers;

    /// @notice Platform fee percentage (basis points, 100 = 1%)
    uint256 public platformFeeBps = 250; // 2.5% default

    /// @notice Fee for organizer verification (0.002 ETH = ~$5)
    uint256 public constant ORGANIZER_VERIFICATION_FEE = 0.002 ether;

    /// @notice Platform treasury address
    address public treasury;

    /// @notice Timelock delay for critical changes (24 hours)
    uint256 public constant TIMELOCK_DELAY = 24 hours;

    /// @notice Pending treasury change
    struct PendingChange {
        address newTreasury;
        uint256 executeAfter;
        bool executed;
    }

    /// @notice Current pending treasury change
    PendingChange public pendingTreasuryChange;

    // ============ Events ============
    // Events are defined in IEventFactory interface

    event PlatformFeeUpdated(uint256 newFeeBps);
    event TreasuryChangeProposed(address newTreasury, uint256 executeAfter);
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

        EVENT_TICKET_TEMPLATE = _eventTicketTemplate;
        treasury = _treasury;

        // Owner is automatically verified
        verifiedOrganizers[msg.sender] = true;
    }

    // ============ Core Functions ============

    /**
     * @notice Creates a new event and deploys its ticketing contract
     * @param name Event name
    * @param metadataUri IPFS URI containing event metadata
     * @param ticketPrice Price per ticket in wei
     * @param maxTickets Maximum number of tickets
     * @param startTime Event start timestamp
     * @param endTime Event end timestamp
     * @return eventId The ID of the newly created event
     */
    function createEvent(
    string calldata name,
    string calldata metadataUri,
        uint256 ticketPrice,
        uint256 maxTickets,
        uint256 startTime,
        uint256 endTime
    )
        external
        payable
        override
        nonReentrant
        whenNotPaused
        onlyVerifiedOrganizer
        returns (uint256 eventId)
    {
        require(
            bytes(name).length > 0 && bytes(name).length <= 100,
            "Invalid event name length"
        );
        require(
            bytes(metadataUri).length > 0 && bytes(metadataUri).length <= 200,
            "Invalid metadata URI length"
        );
        require(
            maxTickets > 0 && maxTickets <= 100000,
            "Invalid max tickets range"
        );
        require(ticketPrice <= 1000 ether, "Ticket price too high");
        require(
            startTime > block.timestamp + 3600,
            "Start time must be at least 1 hour in future"
        );
        require(endTime > startTime, "End time before start");
        require(endTime <= startTime + 365 days, "Event duration too long");

        // FREE EVENTS: No fees at all
        if (ticketPrice == 0) {
            require(msg.value == 0, "Free events require no payment");
        } else {
            // PAID EVENTS: No upfront fee, platform takes % during sales
            require(msg.value == 0, "No upfront fee for paid events");
        }

        // Increment event counter
        _eventIdCounter++;
        eventId = _eventIdCounter;

        // Deploy EventTicket contract clone using CREATE2 for deterministic addresses
        bytes32 salt;
        assembly {
            let ptr := mload(0x40)
            mstore(ptr, caller())
            mstore(add(ptr, 0x20), eventId)
            mstore(add(ptr, 0x40), timestamp())
            mstore(add(ptr, 0x60), number())
            salt := keccak256(ptr, 0x80)
        }
        address ticketContract = Clones.cloneDeterministic(
            EVENT_TICKET_TEMPLATE,
            salt
        );

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
            metadataUri: metadataUri,
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

        // Add to active events index
        _addToActiveEvents(eventId);

        return eventId;
    }

    /**
     * @notice Updates event metadata (only organizer)
     * @param eventId Event ID to update
     * @param name New event name
    * @param metadataUri New metadata URI
     */
    function updateEvent(
        uint256 eventId,
        string calldata name,
    string calldata metadataUri
    ) external validEventId(eventId) onlyEventOrganizer(eventId) {
        require(bytes(name).length > 0, "Empty event name");
    require(bytes(metadataUri).length > 0, "Empty metadata URI");

    Event storage eventData = events[eventId];
    eventData.name = name;
    eventData.metadataUri = metadataUri;

    emit EventUpdated(eventId, name, metadataUri);
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
        Event storage eventData = events[eventId];
        bool wasActive = eventData.isActive;
        eventData.isActive = isActive;

        // Update active events index
        if (isActive && !wasActive) {
            _addToActiveEvents(eventId);
        } else if (!isActive && wasActive) {
            _removeFromActiveEvents(eventId);
        }

        emit EventStatusChanged(eventId, isActive);
    }

    /**
     * @notice Links a POAP contract to an event
     * @param eventId Event ID
     * @param poapContract Address of POAP contract
     */
    function setPoapContract(
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

    // ============ Internal Functions ============

    /**
     * @dev Adds an event to the active events index
     * @param eventId Event ID to add
     */
    function _addToActiveEvents(uint256 eventId) internal {
        // Only add if not already in the index
        if (_activeEventIndex[eventId] == 0) {
            _activeEventIndex[eventId] = _activeEvents.length + 1;
            _activeEvents.push(eventId);
        }
    }

    /**
     * @dev Removes an event from the active events index
     * @param eventId Event ID to remove
     */
    function _removeFromActiveEvents(uint256 eventId) internal {
        uint256 index = _activeEventIndex[eventId];
        if (index > 0) {
            // Move the last element to this position
            uint256 lastEventId = _activeEvents[_activeEvents.length - 1];
            _activeEvents[index - 1] = lastEventId;
            _activeEventIndex[lastEventId] = index;

            // Remove the last element
            _activeEvents.pop();
            _activeEventIndex[eventId] = 0;
        }
    }

    /**
     * @dev Gets current active events (events that are active and not ended)
     * @return activeEventIds Array of currently active event IDs
     */
    function _getCurrentActiveEventIds()
        internal
        view
        returns (uint256[] memory activeEventIds)
    {
        uint256 activeCount = 0;

        // First pass: count currently active events
        for (uint256 i = 0; i < _activeEvents.length; i++) {
            uint256 eventId = _activeEvents[i];
            if (
                events[eventId].isActive &&
                events[eventId].endTime > block.timestamp
            ) {
                activeCount++;
            }
        }

        // Second pass: collect active event IDs
        activeEventIds = new uint256[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < _activeEvents.length; i++) {
            uint256 eventId = _activeEvents[i];
            if (
                events[eventId].isActive &&
                events[eventId].endTime > block.timestamp
            ) {
                activeEventIds[index] = eventId;
                index++;
            }
        }
    }

    // ============ View Functions ============

    /**
     * @notice Gets complete event information
     * @param eventId Event ID
     * @return Event struct
     */
    function getEventDetails(
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

        uint256[] memory currentActiveIds = _getCurrentActiveEventIds();

        uint256 totalActive = currentActiveIds.length;
        uint256 startIndex = offset;
        uint256 endIndex = startIndex + limit;

        if (endIndex > totalActive) {
            endIndex = totalActive;
        }

        uint256 resultLength = endIndex > startIndex
            ? endIndex - startIndex
            : 0;
        eventIds = new uint256[](resultLength);

        for (uint256 i = 0; i < resultLength; i++) {
            eventIds[i] = currentActiveIds[startIndex + i];
        }

        hasMore = endIndex < totalActive;
    }

    /**
     * @notice Predicts the ticket contract address for an event before creation
     * @param organizer Organizer address
     * @param eventId Event ID
    * @param creationTimestamp Creation timestamp
     * @param blockNumber Creation block number
     * @return predictedAddress The predicted contract address
     */
    function predictTicketContractAddress(
        address organizer,
        uint256 eventId,
    uint256 creationTimestamp,
        uint256 blockNumber
    ) external view returns (address predictedAddress) {
        bytes32 salt;
        assembly {
            let ptr := mload(0x40)
            mstore(ptr, organizer)
            mstore(add(ptr, 0x20), eventId)
            mstore(add(ptr, 0x40), creationTimestamp)
            mstore(add(ptr, 0x60), blockNumber)
            salt := keccak256(ptr, 0x80)
        }
        predictedAddress = Clones.predictDeterministicAddress(
            EVENT_TICKET_TEMPLATE,
            salt
        );
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
     * @notice Allows anyone to become a verified organizer by paying a verification fee
     * @param organizer Address to verify (can be msg.sender or another address)
     */
    function selfVerifyOrganizer(
        address organizer
    ) external payable nonReentrant whenNotPaused {
        require(!verifiedOrganizers[organizer], "Already verified");
        require(
            msg.value >= ORGANIZER_VERIFICATION_FEE,
            "Insufficient verification fee"
        );

        // Mark as verified
        verifiedOrganizers[organizer] = true;

        // Transfer fee to treasury
        (bool feeTransferSuccess, ) = payable(treasury).call{
            value: ORGANIZER_VERIFICATION_FEE
        }("");
        require(feeTransferSuccess, "Treasury transfer failed");

        // Refund excess payment
        if (msg.value > ORGANIZER_VERIFICATION_FEE) {
            (bool refundSuccess, ) = payable(msg.sender).call{
                value: msg.value - ORGANIZER_VERIFICATION_FEE
            }("");
            require(refundSuccess, "Refund failed");
        }

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
     * @notice Proposes treasury address change with timelock (only owner)
     * @param newTreasury New treasury address
     */
    function proposeTreasuryChange(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury");
        require(
            !pendingTreasuryChange.executed ||
                block.timestamp > pendingTreasuryChange.executeAfter,
            "Pending change exists"
        );

        pendingTreasuryChange = PendingChange({
            newTreasury: newTreasury,
            executeAfter: block.timestamp + TIMELOCK_DELAY,
            executed: false
        });

        emit TreasuryChangeProposed(
            newTreasury,
            block.timestamp + TIMELOCK_DELAY
        );
    }

    /**
     * @notice Executes pending treasury change after timelock (only owner)
     */
    function executeTreasuryChange() external onlyOwner {
        require(!pendingTreasuryChange.executed, "Already executed");
        require(
            block.timestamp >= pendingTreasuryChange.executeAfter,
            "Timelock not expired"
        );
        require(
            pendingTreasuryChange.newTreasury != address(0),
            "No pending change"
        );

        address newTreasury = pendingTreasuryChange.newTreasury;
        pendingTreasuryChange.executed = true;
        treasury = newTreasury;

        emit TreasuryUpdated(newTreasury);
    }

    /**
     * @notice Updates treasury address (only owner) - DEPRECATED: Use proposeTreasuryChange
     * @param newTreasury New treasury address
     */
    function setTreasury(address newTreasury) external onlyOwner {
        revert("Timelock required for treasury update");
    }

    /**
     * @notice Sets POAP template address (only owner)
     * @param newTemplate New POAP template address
     */
    function setPoapTemplate(address newTemplate) external onlyOwner {
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
