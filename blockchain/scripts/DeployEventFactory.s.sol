// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {EventFactory} from "../contracts/EventFactory.sol";
import {EventTicket} from "../contracts/EventTicket.sol";

contract DeployEventFactory is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying Echain Event Platform...");

        // Deploy EventTicket template first
        console.log("Deploying EventTicket template...");
        EventTicket eventTicketTemplate = new EventTicket();
        console.log("EventTicket template deployed to:", address(eventTicketTemplate));

        // Set treasury address (for now, use deployer address)
        address treasuryAddress = vm.addr(deployerPrivateKey);

        // Deploy EventFactory
        console.log("Deploying EventFactory...");
        EventFactory eventFactory = new EventFactory(address(eventTicketTemplate), treasuryAddress);
        console.log("EventFactory deployed to:", address(eventFactory));

        // Verify deployment
        console.log("Verifying deployment...");
        uint256 eventCount = eventFactory.eventCount();
        bool isDeployerVerified = eventFactory.isVerifiedOrganizer(treasuryAddress);
        uint256 platformFee = eventFactory.platformFeeBps();

        console.log("Initial state:");
        console.log("  - Event count:", eventCount);
        console.log("  - Deployer verified:", isDeployerVerified);
        console.log("  - Platform fee:", platformFee, "bps");
        console.log("  - Treasury:", eventFactory.treasury());

        // Create a test event to verify functionality
        console.log("Creating test event...");
        eventFactory.createEvent(
            "Echain Launch Event",
            "ipfs://QmTestMetadata123",
            0.01 ether,
            100,
            block.timestamp + 1 days,
            block.timestamp + 1 days + 2 hours
        );

        // Read the new event count
        uint256 updatedCount = eventFactory.eventCount();
        console.log("Test event created with ID:", updatedCount);

        console.log("Deployment completed successfully!");
        console.log("Contract Addresses:");
        console.log("EventFactory:", address(eventFactory));
        console.log("EventTicket Template:", address(eventTicketTemplate));

        vm.stopBroadcast();
    }
}