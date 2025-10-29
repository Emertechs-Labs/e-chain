// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {EventFactory} from "../contracts/core/EventFactory.sol";
import {EventTicket} from "../contracts/core/EventTicket.sol";


contract EventFactoryTest is Test {
    EventFactory public eventFactory;
    EventTicket public eventTicketTemplate;

    address public owner = address(1);
    address public organizer = address(2);
    address public user = address(3);
    address public treasury = address(4);

    uint256 public constant VERIFICATION_FEE = 0.01 ether;

    function setUp() public {
        // Deploy EventTicket template
        eventTicketTemplate = new EventTicket();

        // Deploy EventFactory
        vm.prank(owner);
        eventFactory = new EventFactory(address(eventTicketTemplate), treasury);

        // Fund test accounts
        vm.deal(organizer, 10 ether);
        vm.deal(user, 10 ether);
    }

    function test_Deployment() public view {
        assertEq(eventFactory.EVENT_TICKET_TEMPLATE(), address(eventTicketTemplate));
        assertEq(eventFactory.treasury(), treasury);
        assertTrue(eventFactory.isVerifiedOrganizer(owner));
        assertEq(eventFactory.eventCount(), 0);
    }

    function test_OrganizerVerification() public {
        vm.prank(organizer);
        eventFactory.selfVerifyOrganizer{value: VERIFICATION_FEE}(organizer);

        assertTrue(eventFactory.isVerifiedOrganizer(organizer));
    }

    function test_OrganizerUnverification() public {
        // First verify
        vm.prank(organizer);
        eventFactory.selfVerifyOrganizer{value: VERIFICATION_FEE}(organizer);

        // Then unverify
        vm.prank(owner);
        eventFactory.unverifyOrganizer(organizer);

        assertFalse(eventFactory.isVerifiedOrganizer(organizer));
    }

    function test_InsufficientVerificationFee() public {
        vm.prank(organizer);
        vm.expectRevert("Insufficient verification fee");
        eventFactory.selfVerifyOrganizer{value: 0.001 ether}(organizer);
    }

    function test_EventCreation() public {
        // Verify organizer first
        vm.prank(organizer);
        eventFactory.selfVerifyOrganizer{value: VERIFICATION_FEE}(organizer);

        string memory name = "Test Event";
    string memory eventMetadataUri = "ipfs://QmTest123";
        uint256 ticketPrice = 0.1 ether;
        uint256 maxTickets = 100;
        uint256 startTime = block.timestamp + 1 days;
        uint256 endTime = startTime + 2 hours;

        vm.prank(organizer);
    eventFactory.createEvent(name, eventMetadataUri, ticketPrice, maxTickets, startTime, endTime);

        assertEq(eventFactory.eventCount(), 1);

        // Check event details from the events mapping
        EventFactory.Event memory eventData = eventFactory.getEventDetails(1);
        assertEq(eventData.id, 1);
        assertEq(eventData.organizer, organizer);
        assertEq(eventData.name, name);
    assertEq(eventData.metadataUri, eventMetadataUri);
        assertEq(eventData.ticketPrice, ticketPrice);
        assertEq(eventData.maxTickets, maxTickets);
        assertEq(eventData.startTime, startTime);
        assertEq(eventData.endTime, endTime);
        assertTrue(eventData.isActive);
    }

    function test_OrganizerEventsTracking() public {
        // Verify organizer
        vm.prank(organizer);
        eventFactory.selfVerifyOrganizer{value: VERIFICATION_FEE}(organizer);

        // Create two events
        uint256 startTime = block.timestamp + 1 days;
        uint256 endTime = startTime + 2 hours;

        vm.startPrank(organizer);
        eventFactory.createEvent("Event 1", "ipfs://QmTest1", 0.1 ether, 100, startTime, endTime);
        eventFactory.createEvent("Event 2", "ipfs://QmTest2", 0.2 ether, 200, startTime + 1 hours, endTime + 1 hours);
        vm.stopPrank();

        uint256[] memory organizerEvents = eventFactory.getOrganizerEvents(organizer);
        assertEq(organizerEvents.length, 2);
        assertEq(organizerEvents[0], 1);
        assertEq(organizerEvents[1], 2);
    }

    function test_UnverifiedOrganizerCannotCreateEvent() public {
        uint256 startTime = block.timestamp + 1 days;
        uint256 endTime = startTime + 2 hours;

        vm.prank(user);
        vm.expectRevert("Not verified organizer");
        eventFactory.createEvent("Test Event", "ipfs://QmTest123", 0.1 ether, 100, startTime, endTime);
    }

    function test_InvalidEventParameters() public {
        // Verify organizer first
        vm.prank(organizer);
        eventFactory.selfVerifyOrganizer{value: VERIFICATION_FEE}(organizer);

        uint256 validStartTime = block.timestamp + 1 days;
        uint256 validEndTime = validStartTime + 2 hours;

        vm.startPrank(organizer);

        // Empty name
        vm.expectRevert("Invalid event name length");
        eventFactory.createEvent("", "ipfs://QmTest123", 0.1 ether, 100, validStartTime, validEndTime);

        // Name too long (>100 chars)
        string memory longName = "This is a very long event name that exceeds the maximum allowed length of one hundred characters for testing purposes";
        vm.expectRevert("Invalid event name length");
        eventFactory.createEvent(longName, "ipfs://QmTest123", 0.1 ether, 100, validStartTime, validEndTime);

        // Empty metadata URI
        vm.expectRevert("Invalid metadata URI length");
        eventFactory.createEvent("Test Event", "", 0.1 ether, 100, validStartTime, validEndTime);

        // Zero max tickets
        vm.expectRevert("Invalid max tickets range");
        eventFactory.createEvent("Test Event", "ipfs://QmTest123", 0.1 ether, 0, validStartTime, validEndTime);

        // Start time in past (less than 1 hour from now)
        vm.expectRevert("Start time must be at least 1 hour in future");
        eventFactory.createEvent("Test Event", "ipfs://QmTest123", 0.1 ether, 100, block.timestamp + 1800, validEndTime);

        // End time before start
        vm.expectRevert("End time before start");
        eventFactory.createEvent("Test Event", "ipfs://QmTest123", 0.1 ether, 100, validStartTime, validStartTime - 1);

        vm.stopPrank();
    }

    function test_EventUpdate() public {
        // Setup event
        vm.prank(organizer);
        eventFactory.selfVerifyOrganizer{value: VERIFICATION_FEE}(organizer);

        uint256 startTime = block.timestamp + 1 days;
        uint256 endTime = startTime + 2 hours;

        vm.prank(organizer);
        eventFactory.createEvent("Test Event", "ipfs://QmTest123", 0.1 ether, 100, startTime, endTime);

        // Update event
        string memory newName = "Updated Event";
    string memory updatedMetadataUri = "ipfs://QmUpdated456";

        vm.prank(organizer);
    eventFactory.updateEvent(1, newName, updatedMetadataUri);

        EventFactory.Event memory updatedEvent = eventFactory.getEventDetails(1);
        assertEq(updatedEvent.name, newName);
    assertEq(updatedEvent.metadataUri, updatedMetadataUri);
    }

    function test_EventStatusChange() public {
        // Setup event
        vm.prank(organizer);
        eventFactory.selfVerifyOrganizer{value: VERIFICATION_FEE}(organizer);

        uint256 startTime = block.timestamp + 1 days;
        uint256 endTime = startTime + 2 hours;

        vm.prank(organizer);
        eventFactory.createEvent("Test Event", "ipfs://QmTest123", 0.1 ether, 100, startTime, endTime);

        // Change status
        vm.prank(organizer);
        eventFactory.setEventStatus(1, false);

        EventFactory.Event memory statusEvent = eventFactory.getEventDetails(1);
        assertFalse(statusEvent.isActive);
    }

    function test_NonOrganizerCannotUpdateEvent() public {
        // Setup event
        vm.prank(organizer);
        eventFactory.selfVerifyOrganizer{value: VERIFICATION_FEE}(organizer);

        uint256 startTime = block.timestamp + 1 days;
        uint256 endTime = startTime + 2 hours;

        vm.prank(organizer);
        eventFactory.createEvent("Test Event", "ipfs://QmTest123", 0.1 ether, 100, startTime, endTime);

        // Try to update from non-organizer
        vm.prank(user);
        vm.expectRevert("Not event organizer");
        eventFactory.updateEvent(1, "Hacked Event", "ipfs://QmHacked");
    }

    function test_GetActiveEvents() public {
        // Verify organizer
        vm.prank(organizer);
        eventFactory.selfVerifyOrganizer{value: VERIFICATION_FEE}(organizer);

        // Create multiple events
        uint256 startTime = block.timestamp + 1 days;
        uint256 endTime = startTime + 2 hours;

        vm.startPrank(organizer);
        for (uint256 i = 0; i < 5; i++) {
            eventFactory.createEvent(
                string(abi.encodePacked("Event ", vm.toString(i + 1))),
                string(abi.encodePacked("ipfs://QmTest", vm.toString(i + 1))),
                0.1 ether,
                100,
                startTime + i * 1000,
                endTime + i * 1000
            );
        }
        vm.stopPrank();

        // Test pagination
        (uint256[] memory eventIds, bool hasMore) = eventFactory.getActiveEvents(0, 3);
        assertEq(eventIds.length, 3);
        assertEq(eventIds[0], 1);
        assertEq(eventIds[1], 2);
        assertEq(eventIds[2], 3);
        assertTrue(hasMore);

        (eventIds, hasMore) = eventFactory.getActiveEvents(3, 3);
        assertEq(eventIds.length, 2);
        assertEq(eventIds[0], 4);
        assertEq(eventIds[1], 5);
        assertFalse(hasMore);
    }
}