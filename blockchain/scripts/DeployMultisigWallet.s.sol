// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {MultisigWallet} from "../contracts/core/MultisigWallet.sol";

/**
 * @title DeployMultisigWallet
 * @dev Deployment script for the Hedera Multisig Wallet
 * @notice Deploys the MultisigWallet contract with initial configuration
 */
contract DeployMultisigWallet is Script {
    // Deployment parameters
    address[] internal signers;
    uint256[] internal weights;
    uint256 internal threshold;

    function setUp() public {
        // Default test configuration - can be overridden via environment
        if (signers.length == 0) {
            // Use environment variables or default test addresses
            signers = new address[](3);
            signers[0] = vm.envOr("SIGNER_1", address(0x1234567890123456789012345678901234567890));
            signers[1] = vm.envOr("SIGNER_2", address(0x2345678901234567890123456789012345678901));
            signers[2] = vm.envOr("SIGNER_3", address(0x3456789012345678901234567890123456789023));

            weights = new uint256[](3);
            weights[0] = vm.envOr("WEIGHT_1", uint256(1));
            weights[1] = vm.envOr("WEIGHT_2", uint256(1));
            weights[2] = vm.envOr("WEIGHT_3", uint256(1));

            threshold = vm.envOr("THRESHOLD", uint256(2));
        }
    }

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the MultisigWallet contract
        MultisigWallet multisig = new MultisigWallet(signers, weights, threshold);

        vm.stopBroadcast();

        // Log deployment information
        console.log("MultisigWallet deployed at:", address(multisig));
        console.log("Signers:");
        for (uint256 i = 0; i < signers.length; i++) {
            console.log(string(abi.encodePacked("  Signer ", vm.toString(i + 1), ": ", vm.toString(signers[i]), " (weight: ", vm.toString(weights[i]), ")")));
        }
        console.log("Threshold:", threshold);
        console.log("Total weight:", multisig.getTotalWeight());        // Verify deployment
        require(multisig.getThreshold() == threshold, "Threshold not set correctly");
        require(multisig.getSigners().length == signers.length, "Signers not set correctly");
        for (uint256 i = 0; i < signers.length; i++) {
            require(multisig.isSigner(signers[i]), "Signer not recognized");
            require(multisig.getSignerWeight(signers[i]) == weights[i], "Weight not set correctly");
        }

        console.log("Deployment verification successful!");
    }
}