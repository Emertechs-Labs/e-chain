// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {EventFactory} from "../contracts/core/EventFactory.sol";
import {EventTicket} from "../contracts/core/EventTicket.sol";
import {POAPAttendance} from "../contracts/modules/POAPAttendance.sol";
import {IncentiveManager} from "../contracts/modules/IncentiveManager.sol";
import {Marketplace} from "../contracts/core/Marketplace.sol";
import {MultisigWallet} from "../contracts/core/MultisigWallet.sol";

/**
 * @title Deploy Script
 * @notice Deployment script for Echain contracts
 * @dev Usage:
 *   Local: forge script script/Deploy.s.sol:DeployScript --fork-url http://localhost:8545 --broadcast
 *   Testnet: forge script script/Deploy.s.sol:DeployScript --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast --verify
 *   Mainnet: forge script script/Deploy.s.sol:DeployScript --rpc-url $BASE_MAINNET_RPC_URL --broadcast --verify
 */
contract DeployScript is Script {
    // Deployment addresses
    address public eventFactory;
    address public eventTicketTemplate;
    address public poapAttendance;
    address public incentiveManager;
    address public marketplace;
    address public multisigWallet;
    
    // Configuration
    address public treasury;
    address[] public multisigOwners;
    uint256 public multisigThreshold;
    
    function setUp() public {
        // Load configuration from environment variables
        treasury = vm.envOr("TREASURY_ADDRESS", address(0));
        
        // Multisig configuration
        string memory ownersEnv = vm.envOr("MULTISIG_OWNERS", string(""));
        if (bytes(ownersEnv).length > 0) {
            // Parse comma-separated addresses
            // For simplicity, using default owners if not provided
            multisigOwners = new address[](3);
            multisigOwners[0] = vm.envOr("MULTISIG_OWNER_1", msg.sender);
            multisigOwners[1] = vm.envOr("MULTISIG_OWNER_2", msg.sender);
            multisigOwners[2] = vm.envOr("MULTISIG_OWNER_3", msg.sender);
        } else {
            // Default: deployer as single owner
            multisigOwners = new address[](1);
            multisigOwners[0] = msg.sender;
        }
        
        multisigThreshold = vm.envOr("MULTISIG_THRESHOLD", uint256(1));
        
        // Use deployer as treasury if not set
        if (treasury == address(0)) {
            treasury = msg.sender;
        }
    }
    
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("=== Echain Deployment ===");
        console.log("Deployer:", msg.sender);
        console.log("Treasury:", treasury);
        console.log("Chain ID:", block.chainid);
        console.log("");
        
        // 1. Deploy EventTicket template
        console.log("1. Deploying EventTicket template...");
        eventTicketTemplate = address(new EventTicket());
        console.log("   EventTicket template:", eventTicketTemplate);
        
        // 2. Deploy EventFactory
        console.log("2. Deploying EventFactory...");
        eventFactory = address(new EventFactory(eventTicketTemplate, treasury));
        console.log("   EventFactory:", eventFactory);
        
        // 3. Deploy POAPAttendance
        console.log("3. Deploying POAPAttendance...");
        poapAttendance = address(new POAPAttendance(eventFactory));
        console.log("   POAPAttendance:", poapAttendance);
        
        // 4. Deploy IncentiveManager
        console.log("4. Deploying IncentiveManager...");
        incentiveManager = address(
            new IncentiveManager(
                eventFactory,
                eventTicketTemplate,
                poapAttendance
            )
        );
        console.log("   IncentiveManager:", incentiveManager);
        
        // 5. Deploy Marketplace
        console.log("5. Deploying Marketplace...");
        marketplace = address(new Marketplace(treasury));
        console.log("   Marketplace:", marketplace);
        
        // 6. Deploy MultisigWallet (optional, for governance)
        console.log("6. Deploying MultisigWallet...");
        multisigWallet = address(new MultisigWallet(multisigOwners, multisigThreshold));
        console.log("   MultisigWallet:", multisigWallet);
        console.log("   Owners:", multisigOwners.length);
        console.log("   Threshold:", multisigThreshold);
        
        vm.stopBroadcast();
        
        // Print deployment summary
        console.log("");
        console.log("=== Deployment Summary ===");
        console.log("EventTicket Template:", eventTicketTemplate);
        console.log("EventFactory:", eventFactory);
        console.log("POAPAttendance:", poapAttendance);
        console.log("IncentiveManager:", incentiveManager);
        console.log("Marketplace:", marketplace);
        console.log("MultisigWallet:", multisigWallet);
        console.log("");
        console.log("=== Next Steps ===");
        console.log("1. Verify contracts on block explorer");
        console.log("2. Update frontend .env with contract addresses");
        console.log("3. Transfer ownership to multisig wallet (if needed)");
        console.log("4. Configure POAP template in EventFactory");
        console.log("5. Approve ticket contracts in Marketplace");
        
        // Save deployment addresses to file
        _saveDeploymentAddresses();
    }
    
    function _saveDeploymentAddresses() internal {
        string memory deploymentJson = string(
            abi.encodePacked(
                '{\n',
                '  "network": "', _getNetworkName(), '",\n',
                '  "chainId": ', vm.toString(block.chainid), ',\n',
                '  "timestamp": ', vm.toString(block.timestamp), ',\n',
                '  "deployer": "', vm.toString(msg.sender), '",\n',
                '  "contracts": {\n',
                '    "EventTicketTemplate": "', vm.toString(eventTicketTemplate), '",\n',
                '    "EventFactory": "', vm.toString(eventFactory), '",\n',
                '    "POAPAttendance": "', vm.toString(poapAttendance), '",\n',
                '    "IncentiveManager": "', vm.toString(incentiveManager), '",\n',
                '    "Marketplace": "', vm.toString(marketplace), '",\n',
                '    "MultisigWallet": "', vm.toString(multisigWallet), '"\n',
                '  }\n',
                '}'
            )
        );
        
        string memory filename = string(
            abi.encodePacked(
                "deployments/",
                _getNetworkName(),
                "-",
                vm.toString(block.timestamp),
                ".json"
            )
        );
        
        vm.writeFile(filename, deploymentJson);
        console.log("Deployment addresses saved to:", filename);
    }
    
    function _getNetworkName() internal view returns (string memory) {
        uint256 chainId = block.chainid;
        
        if (chainId == 1) return "mainnet";
        if (chainId == 5) return "goerli";
        if (chainId == 11155111) return "sepolia";
        if (chainId == 8453) return "base";
        if (chainId == 84531) return "base-goerli";
        if (chainId == 84532) return "base-sepolia";
        if (chainId == 31337) return "localhost";
        
        return string(abi.encodePacked("unknown-", vm.toString(chainId)));
    }
}

/**
 * @title Upgrade Script
 * @notice Script for upgrading contracts (if using proxy pattern)
 */
contract UpgradeScript is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("=== Contract Upgrade ===");
        console.log("Upgrader:", msg.sender);
        
        // Add upgrade logic here when implementing upgradeable contracts
        
        vm.stopBroadcast();
    }
}

/**
 * @title Verify Script
 * @notice Helper script for contract verification
 */
contract VerifyScript is Script {
    function run() public view {
        console.log("=== Contract Verification ===");
        console.log("");
        console.log("Run these commands to verify contracts:");
        console.log("");
        console.log("forge verify-contract <ADDRESS> EventTicket --chain <CHAIN_ID>");
        console.log("forge verify-contract <ADDRESS> EventFactory --chain <CHAIN_ID> --constructor-args $(cast abi-encode 'constructor(address,address)' <TEMPLATE> <TREASURY>)");
        console.log("forge verify-contract <ADDRESS> POAPAttendance --chain <CHAIN_ID> --constructor-args $(cast abi-encode 'constructor(address)' <FACTORY>)");
        console.log("forge verify-contract <ADDRESS> IncentiveManager --chain <CHAIN_ID> --constructor-args $(cast abi-encode 'constructor(address,address,address)' <FACTORY> <TICKET> <POAP>)");
        console.log("forge verify-contract <ADDRESS> Marketplace --chain <CHAIN_ID> --constructor-args $(cast abi-encode 'constructor(address)' <TREASURY>)");
    }
}
