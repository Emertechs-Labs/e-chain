// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import "forge-std/console.sol";

contract NodeProviderTest is Script {
    struct ProviderInfo {
        string name;
        string rpcUrl;
        uint256 latency;
        bool isHealthy;
    }

    function run() external {
        console.log("Testing Node Provider Connectivity and Latency");
        console.log("============================================");

        // Test Base Mainnet providers
        testProvider("Chainstack Mainnet", getEnvOrDefault("BASE_MAINNET_CHAINSTACK_RPC", ""));
        testProvider("Spectrum Mainnet", getEnvOrDefault("BASE_MAINNET_SPECTRUM_RPC", ""));
        testProvider("Coinbase Mainnet", getEnvOrDefault("BASE_MAINNET_COINBASE_RPC", ""));
        testProvider("Public Mainnet", "https://mainnet.base.org");

        // Test Base Testnet providers
        testProvider("Chainstack Testnet", getEnvOrDefault("BASE_TESTNET_CHAINSTACK_RPC", ""));
        testProvider("Spectrum Testnet", getEnvOrDefault("BASE_TESTNET_SPECTRUM_RPC", ""));
        testProvider("Coinbase Testnet", getEnvOrDefault("BASE_TESTNET_COINBASE_RPC", ""));
        testProvider("Public Testnet", "https://sepolia.base.org");
    }

    function getEnvOrDefault(string memory varName, string memory defaultValue) internal returns (string memory) {
        try vm.envString(varName) returns (string memory val) {
            if (bytes(val).length > 0) {
                return val;
            }
        } catch {}
        return defaultValue;
    }

    function testProvider(string memory name, string memory rpcUrl) internal {
        if (bytes(rpcUrl).length == 0) {
            console.log("\nTesting %s:", name);
            console.log("RPC URL: Not configured - skipping");
            return;
        }

        console.log("\nTesting %s:", name);
        console.log("RPC URL: %s", rpcUrl);

        string[] memory inputs = new string[](3);
        inputs[0] = "cast";
        inputs[1] = "block-number";
        inputs[2] = string(abi.encodePacked("--rpc-url=", rpcUrl));

        try vm.ffi(inputs) returns (bytes memory result) {
            uint256 blockNumber = abi.decode(result, (uint256));
            console.log("Status: Healthy");
            console.log("Block Number: %d", blockNumber);
            console.log("Latency: Not measured (use external timing)");
            console.log("Performance: Connectivity confirmed");
        } catch Error(string memory reason) {
            console.log("Status: Unhealthy");
            console.log("Error: %s", reason);
        } catch {
            console.log("Status: Unhealthy");
            console.log("Error: Unknown connection failure");
        }
    }
}