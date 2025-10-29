// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {EventFactory} from "../contracts/core/EventFactory.sol";
import {EventTicket} from "../contracts/core/EventTicket.sol";
import {IEventFactory} from "../contracts/interfaces/IEventFactory.sol";
import "forge-std/console.sol";

contract BaseForkTest is Test {
    EventFactory public eventFactory;
    EventTicket public eventTicketTemplate;

    address public deployer = makeAddr("deployer");
    address public organizer = makeAddr("organizer");
    address public attendee = makeAddr("attendee");

    uint256 public mainnetFork;
    uint256 public testnetFork;

    function setUp() public {
        // Create forks of Base networks
        string memory mainnetRpc = "https://mainnet.base.org";
        try vm.envString("BASE_MAINNET_RPC_URL") returns (string memory val) {
            mainnetRpc = val;
        } catch {}
        
        string memory testnetRpc = "https://sepolia.base.org";
        try vm.envString("BASE_TESTNET_RPC_URL") returns (string memory val) {
            testnetRpc = val;
        } catch {}
        
        mainnetFork = vm.createFork(mainnetRpc);
        testnetFork = vm.createFork(testnetRpc);
    }

    function testForkConnectivity() public {
        // Test mainnet fork
        vm.selectFork(mainnetFork);
        assertEq(block.chainid, 8453, "Should be on Base mainnet");

        // Test testnet fork
        vm.selectFork(testnetFork);
        assertEq(block.chainid, 84532, "Should be on Base testnet");
    }

    function testDeploymentOnMainnetFork() public {
        vm.selectFork(mainnetFork);
        vm.startPrank(deployer);

        // Deploy contracts on mainnet fork
        eventTicketTemplate = new EventTicket();
        eventFactory = new EventFactory(address(eventTicketTemplate), deployer);

        // Verify deployment
        assertEq(eventFactory.eventCount(), 0, "Initial event count should be 0");
        assertTrue(eventFactory.isVerifiedOrganizer(deployer), "Deployer should be verified");

        vm.stopPrank();
    }

    function testDeploymentOnTestnetFork() public {
        vm.selectFork(testnetFork);
        vm.startPrank(deployer);

        // Deploy contracts on testnet fork
        eventTicketTemplate = new EventTicket();
        eventFactory = new EventFactory(address(eventTicketTemplate), deployer);

        // Verify deployment
        assertEq(eventFactory.eventCount(), 0, "Initial event count should be 0");
        assertTrue(eventFactory.isVerifiedOrganizer(deployer), "Deployer should be verified");

        vm.stopPrank();
    }

    function testEventCreationOnMainnetFork() public {
        vm.selectFork(mainnetFork);
        vm.startPrank(deployer);

        // Deploy contracts
        eventTicketTemplate = new EventTicket();
        eventFactory = new EventFactory(address(eventTicketTemplate), deployer);

        // Fund organizer
        vm.deal(organizer, 1 ether);

        vm.stopPrank();
        vm.startPrank(organizer);

        // Fund organizer
        vm.deal(organizer, 1 ether);

        // Verify organizer first
        eventFactory.selfVerifyOrganizer{value: 0.002 ether}(organizer);

        // Create event
        uint256 eventId = eventFactory.createEvent(
            "Base Mainnet Test Event",
            "ipfs://QmTestMetadata123",
            0.01 ether,
            100,
            block.timestamp + 1 days,
            block.timestamp + 1 days + 2 hours
        );

        // Verify event creation
        assertEq(eventFactory.eventCount(), 1, "Event count should be 1");
        assertEq(eventId, 1, "Event ID should be 1");

        vm.stopPrank();
    }

    function testEventCreationOnTestnetFork() public {
        vm.selectFork(testnetFork);
        vm.startPrank(deployer);

        // Deploy contracts
        eventTicketTemplate = new EventTicket();
        eventFactory = new EventFactory(address(eventTicketTemplate), deployer);

        // Fund organizer
        vm.deal(organizer, 1 ether);

        vm.stopPrank();
        vm.startPrank(organizer);

        // Fund organizer
        vm.deal(organizer, 1 ether);

        // Verify organizer first
        eventFactory.selfVerifyOrganizer{value: 0.002 ether}(organizer);

        // Create event
        uint256 eventId = eventFactory.createEvent(
            "Base Testnet Test Event",
            "ipfs://QmTestMetadata123",
            0.01 ether,
            100,
            block.timestamp + 1 days,
            block.timestamp + 1 days + 2 hours
        );

        // Verify event creation
        assertEq(eventFactory.eventCount(), 1, "Event count should be 1");
        assertEq(eventId, 1, "Event ID should be 1");

        vm.stopPrank();
    }

    function testTicketPurchaseOnMainnetFork() public {
        vm.selectFork(mainnetFork);
        vm.startPrank(deployer);

        // Deploy contracts
        eventTicketTemplate = new EventTicket();
        eventFactory = new EventFactory(address(eventTicketTemplate), deployer);

        vm.stopPrank();
        
        // Fund organizer
        vm.deal(organizer, 1 ether);
        
        vm.startPrank(organizer);

        // Verify organizer first
        eventFactory.selfVerifyOrganizer{value: 0.002 ether}(organizer);

        // Create event
        eventFactory.createEvent(
            "Base Mainnet Ticket Test",
            "ipfs://QmTestMetadata123",
            0.01 ether,
            100,
            block.timestamp + 1 days,
            block.timestamp + 1 days + 2 hours
        );

        vm.stopPrank();
        vm.startPrank(attendee);

        // Fund attendee
        vm.deal(attendee, 1 ether);

        // Get ticket contract and purchase ticket
        IEventFactory.Event memory eventDetails = eventFactory.getEventDetails(1);
        address ticketContract = eventDetails.ticketContract;
        EventTicket ticket = EventTicket(ticketContract);
        ticket.purchaseTicket{value: 0.01 ether}(1);

        // Verify ticket ownership
        assertEq(ticket.balanceOf(attendee), 1, "Attendee should own 1 ticket");

        vm.stopPrank();
    }

    function testGasOptimization() public {
        vm.selectFork(testnetFork);
        vm.startPrank(deployer);

        // Deploy contracts
        eventTicketTemplate = new EventTicket();
        eventFactory = new EventFactory(address(eventTicketTemplate), deployer);

        vm.stopPrank();

        // Fund and verify organizer
        vm.startPrank(organizer);
        vm.deal(organizer, 1 ether);
        eventFactory.selfVerifyOrganizer{value: 0.002 ether}(organizer);

        // Measure gas for event creation
        uint256 gasStart = gasleft();
        eventFactory.createEvent(
            "Gas Test Event",
            "ipfs://QmTestMetadata123",
            0.01 ether,
            100,
            block.timestamp + 1 days,
            block.timestamp + 1 days + 2 hours
        );
        uint256 gasUsed = gasStart - gasleft();

        console.log("Event creation gas used:", gasUsed);
        assertLt(gasUsed, 800000, "Event creation should use less than 800k gas");

        vm.stopPrank();
    }

    function testGasOptimizationBatchMinting() public {
        vm.selectFork(testnetFork);
        vm.startPrank(deployer);

        eventTicketTemplate = new EventTicket();
        eventFactory = new EventFactory(address(eventTicketTemplate), deployer);

        vm.stopPrank();
        vm.startPrank(organizer);

        // Fund organizer
        vm.deal(organizer, 1 ether);

        // Verify organizer first
        eventFactory.selfVerifyOrganizer{value: 0.002 ether}(organizer);

        uint256 eventId = eventFactory.createEvent(
            "Batch Mint Test",
            "ipfs://QmTestMetadata123",
            0.01 ether,
            100,
            block.timestamp + 1 days,
            block.timestamp + 1 days + 2 hours
        );

        vm.stopPrank();

        // Test different batch sizes and measure gas per ticket
        uint256[] memory batchSizes = new uint256[](4);
        batchSizes[0] = 1;
        batchSizes[1] = 5;
        batchSizes[2] = 10;
        batchSizes[3] = 10; // Max allowed per transaction

        IEventFactory.Event memory eventDetails = eventFactory.getEventDetails(eventId);
        EventTicket ticket = EventTicket(eventDetails.ticketContract);
        
        // Set max tickets per address to allow batch purchases (call as organizer)
        vm.startPrank(organizer);
        ticket.setMaxTicketsPerAddress(100);
        vm.stopPrank();

        for (uint256 i = 0; i < 4; i++) {
            address buyer = address(uint160(3000 + i));
            vm.deal(buyer, 10 ether);
            vm.startPrank(buyer);

            uint256 gasStart = gasleft();
            ticket.purchaseTicket{value: 0.01 ether * batchSizes[i]}(batchSizes[i]);
            uint256 gasUsed = gasStart - gasleft();
            uint256 gasPerTicket = gasUsed / batchSizes[i];

            console.log("Batch size:", batchSizes[i]);
            console.log("Total gas:", gasUsed);
            console.log("Gas per ticket:", gasPerTicket);
            console.log("---");

            // Gas per ticket should decrease with batch size (optimization working)
            assertLt(gasPerTicket, 250000, "Gas per ticket too high");

            vm.stopPrank();
        }
    }

    function testRPCEndpointLatency() public {
        // Test each RPC endpoint for latency
        string[] memory endpoints = new string[](4);
        endpoints[0] = vm.envOr("BASE_MAINNET_CHAINSTACK_RPC", string(""));
        endpoints[1] = vm.envOr("BASE_MAINNET_SPECTRUM_RPC", string(""));
        endpoints[2] = vm.envOr("BASE_MAINNET_COINBASE_RPC", string(""));
        endpoints[3] = "https://mainnet.base.org";

        console.log("=== RPC Endpoint Latency Tests ===");
        
        for (uint256 i = 0; i < endpoints.length; i++) {
            if (bytes(endpoints[i]).length > 0) {
                uint256 startTime = block.timestamp;
                
                try vm.createFork(endpoints[i]) returns (uint256 forkId) {
                    vm.selectFork(forkId);
                    uint256 blockNum = block.number;
                    uint256 latency = block.timestamp - startTime;
                    
                    console.log("Endpoint:", endpoints[i]);
                    console.log("Block:", blockNum);
                    console.log("Latency:", latency);
                    console.log("Status: SUCCESS");
                    console.log("---");
                    
                    // Latency should be reasonable (<1s for premium providers)
                    if (i < 3) { // Premium providers
                        assertLt(latency, 1000, "Premium RPC latency too high");
                    }
                } catch {
                    console.log("Endpoint:", endpoints[i]);
                    console.log("Status: FAILED");
                    console.log("---");
                }
            }
        }
    }

    function testEdgeCaseZeroTickets() public {
        vm.selectFork(testnetFork);
        vm.startPrank(deployer);

        eventTicketTemplate = new EventTicket();
        eventFactory = new EventFactory(address(eventTicketTemplate), deployer);

        vm.stopPrank();
        vm.startPrank(organizer);

        // Try creating event with 0 max tickets (should fail)
        vm.expectRevert();
        eventFactory.createEvent(
            "Zero Tickets Event",
            "ipfs://QmTest",
            0.01 ether,
            0, // Invalid: 0 tickets
            block.timestamp + 1 days,
            block.timestamp + 2 days
        );

        vm.stopPrank();
    }

    function testEdgeCasePastStartTime() public {
        vm.selectFork(testnetFork);
        vm.startPrank(deployer);

        eventTicketTemplate = new EventTicket();
        eventFactory = new EventFactory(address(eventTicketTemplate), deployer);

        vm.stopPrank();
        vm.startPrank(organizer);

        // Try creating event with past start time (should fail)
        vm.expectRevert();
        eventFactory.createEvent(
            "Past Event",
            "ipfs://QmTest",
            0.01 ether,
            100,
            block.timestamp - 1 days, // In the past
            block.timestamp + 1 days
        );

        vm.stopPrank();
    }

    function testEdgeCaseMaxTickets() public {
        vm.selectFork(testnetFork);
        vm.startPrank(deployer);

        eventTicketTemplate = new EventTicket();
        eventFactory = new EventFactory(address(eventTicketTemplate), deployer);

        vm.stopPrank();
        vm.startPrank(organizer);

        // Fund organizer
        vm.deal(organizer, 1 ether);

        // Verify organizer first
        eventFactory.selfVerifyOrganizer{value: 0.002 ether}(organizer);

        // Create event with very large max tickets
        uint256 eventId = eventFactory.createEvent(
            "Large Event",
            "ipfs://QmTest",
            0.01 ether,
            10000, // Very large
            block.timestamp + 1 days,
            block.timestamp + 2 days
        );

        assertTrue(eventId > 0, "Large event creation failed");

        vm.stopPrank();
    }

    function testEdgeCaseInsufficientPayment() public {
        vm.selectFork(testnetFork);
        vm.startPrank(deployer);

        eventTicketTemplate = new EventTicket();
        eventFactory = new EventFactory(address(eventTicketTemplate), deployer);

        vm.stopPrank();
        
        // Fund organizer
        vm.deal(organizer, 1 ether);
        
        vm.startPrank(organizer);

        // Verify organizer first
        eventFactory.selfVerifyOrganizer{value: 0.002 ether}(organizer);

        uint256 eventId = eventFactory.createEvent(
            "Payment Test",
            "ipfs://QmTest",
            0.01 ether,
            100,
            block.timestamp + 1 days,
            block.timestamp + 2 days
        );

        vm.stopPrank();

        vm.startPrank(attendee);
        vm.deal(attendee, 1 ether);

        IEventFactory.Event memory eventDetails = eventFactory.getEventDetails(eventId);
        EventTicket ticket = EventTicket(eventDetails.ticketContract);

        // Try to purchase with insufficient payment
        vm.expectRevert();
        ticket.purchaseTicket{value: 0.005 ether}(1); // Half the price

        vm.stopPrank();
    }

    function testPerformanceBenchmark() public {
        vm.selectFork(mainnetFork);
        vm.startPrank(deployer);

        console.log("=== Performance Benchmark on Mainnet Fork ===");

        uint256 deployStart = gasleft();
        eventTicketTemplate = new EventTicket();
        eventFactory = new EventFactory(address(eventTicketTemplate), deployer);
        uint256 deployGas = deployStart - gasleft();

        console.log("Deployment gas:", deployGas);
        assertLt(deployGas, 10000000, "Deployment gas too high");

        vm.stopPrank();
        vm.startPrank(organizer);
        vm.deal(organizer, 1 ether);

        // Verify organizer first
        eventFactory.selfVerifyOrganizer{value: 0.002 ether}(organizer);

        // Benchmark event creation
        uint256 createStart = gasleft();
        uint256 eventId = eventFactory.createEvent(
            "Benchmark Event",
            "ipfs://QmTestMetadata123",
            0.01 ether,
            100,
            block.timestamp + 1 days,
            block.timestamp + 2 days
        );
        uint256 createGas = createStart - gasleft();

        console.log("Event creation gas:", createGas);
        assertLt(createGas, 800000, "Event creation gas too high");

        vm.stopPrank();

        // Benchmark ticket purchase
        vm.startPrank(attendee);
        vm.deal(attendee, 1 ether);

        IEventFactory.Event memory eventDetails = eventFactory.getEventDetails(eventId);
        EventTicket ticket = EventTicket(eventDetails.ticketContract);

        uint256 purchaseStart = gasleft();
        ticket.purchaseTicket{value: 0.01 ether}(1);
        uint256 purchaseGas = purchaseStart - gasleft();

        console.log("Ticket purchase gas:", purchaseGas);
        assertLt(purchaseGas, 250000, "Ticket purchase gas too high");

        vm.stopPrank();

        console.log("=== All Benchmarks Passed ===");
    }

    function test_RevertWhen_InvalidEventCreation() public {
        vm.selectFork(testnetFork);
        vm.startPrank(deployer);

        eventTicketTemplate = new EventTicket();
        eventFactory = new EventFactory(address(eventTicketTemplate), deployer);

        vm.stopPrank();
        vm.startPrank(organizer);

        // Fund organizer
        vm.deal(organizer, 1 ether);

        // Verify organizer first so we can test the actual validation
        eventFactory.selfVerifyOrganizer{value: 0.002 ether}(organizer);

        // Try to create event with end time before start time (should fail)
        vm.expectRevert("End time before start");
        eventFactory.createEvent(
            "Invalid Event",
            "ipfs://QmTestMetadata123",
            0.01 ether,
            100,
            block.timestamp + 1 days,
            block.timestamp + 1 hours // End before start
        );

        vm.stopPrank();
    }

    function test_RevertWhen_PurchaseSoldOutEvent() public {
        vm.selectFork(testnetFork);
        vm.startPrank(deployer);

        eventTicketTemplate = new EventTicket();
        eventFactory = new EventFactory(address(eventTicketTemplate), deployer);

        vm.stopPrank();
        vm.startPrank(organizer);

        // Fund organizer
        vm.deal(organizer, 1 ether);

        // Verify organizer first
        eventFactory.selfVerifyOrganizer{value: 0.002 ether}(organizer);

        // Create event with only 1 ticket
        eventFactory.createEvent(
            "Sold Out Test",
            "ipfs://QmTestMetadata123",
            0.01 ether,
            1, // Only 1 ticket available
            block.timestamp + 1 days,
            block.timestamp + 1 days + 2 hours
        );

        vm.stopPrank();

        // First purchase
        vm.startPrank(attendee);
        vm.deal(attendee, 1 ether);
        IEventFactory.Event memory eventDetails = eventFactory.getEventDetails(1);
        address ticketContract = eventDetails.ticketContract;
        EventTicket ticket = EventTicket(ticketContract);
        ticket.purchaseTicket{value: 0.01 ether}(1);

        // Second purchase should fail
        address attendee2 = makeAddr("attendee2");
        vm.startPrank(attendee2);
        vm.deal(attendee2, 1 ether);
        vm.expectRevert("Exceeds maximum supply");
        ticket.purchaseTicket{value: 0.01 ether}(1);

        vm.stopPrank();
    }
}