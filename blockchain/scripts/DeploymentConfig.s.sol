// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import "forge-std/console.sol";

contract DeploymentConfig is Script {
    struct NetworkConfig {
        string name;
        string rpcUrl;
        string chainId;
        string blockExplorer;
        string currency;
        bool isTestnet;
    }

    function run() external {
        console.log("Echain Deployment Configuration");
        console.log("================================");

        // Display current network configurations
        displayNetworkConfig("Base Mainnet", getBaseMainnetConfig());
        displayNetworkConfig("Base Testnet", getBaseTestnetConfig());

        // Validate environment variables
        validateEnvironment();

        // Test connectivity
        testConnectivity();
    }

    function displayNetworkConfig(string memory title, NetworkConfig memory config) internal {
        console.log("\n%s Configuration:", title);
        console.log("  Network: %s", config.name);
        console.log("  RPC URL: %s", config.rpcUrl);
        console.log("  Chain ID: %s", config.chainId);
        console.log("  Block Explorer: %s", config.blockExplorer);
        console.log("  Currency: %s", config.currency);
        console.log("  Testnet: %s", config.isTestnet ? "Yes" : "No");
    }

    function getBaseMainnetConfig() internal returns (NetworkConfig memory) {
        string memory rpcUrl = "https://mainnet.base.org";
        try vm.envString("BASE_MAINNET_RPC_URL") returns (string memory val) {
            rpcUrl = val;
        } catch {}
        return NetworkConfig({
            name: "Base Mainnet",
            rpcUrl: rpcUrl,
            chainId: "8453",
            blockExplorer: "https://basescan.org",
            currency: "ETH",
            isTestnet: false
        });
    }

    function getBaseTestnetConfig() internal returns (NetworkConfig memory) {
        string memory rpcUrl = "https://sepolia.base.org";
        try vm.envString("BASE_TESTNET_RPC_URL") returns (string memory val) {
            rpcUrl = val;
        } catch {}
        return NetworkConfig({
            name: "Base Testnet (Sepolia)",
            rpcUrl: rpcUrl,
            chainId: "84532",
            blockExplorer: "https://sepolia.basescan.org",
            currency: "ETH",
            isTestnet: true
        });
    }

    function validateEnvironment() internal {
        console.log("Environment Validation:");
        console.log("======================");

        // Check required environment variables
        checkEnvVar("DEPLOYER_PRIVATE_KEY", "Deployer private key");
        checkEnvVar("BASESCAN_API_KEY", "BaseScan API key");

        // Check node provider configurations
        checkNodeProvider("BASE_MAINNET_CHAINSTACK_RPC", "Chainstack Mainnet");
        checkNodeProvider("BASE_MAINNET_SPECTRUM_RPC", "Spectrum Mainnet");
        checkNodeProvider("BASE_MAINNET_COINBASE_RPC", "Coinbase Mainnet");
        checkNodeProvider("BASE_TESTNET_CHAINSTACK_RPC", "Chainstack Testnet");
        checkNodeProvider("BASE_TESTNET_SPECTRUM_RPC", "Spectrum Testnet");
        checkNodeProvider("BASE_TESTNET_COINBASE_RPC", "Coinbase Testnet");
    }

    function checkEnvVar(string memory varName, string memory description) internal {
        try vm.envString(varName) returns (string memory value) {
            if (bytes(value).length > 0) {
                console.log("Env var configured");
            } else {
                console.log("Env var empty");
            }
        } catch {
            console.log("Env var not set");
        }
    }

    function checkNodeProvider(string memory varName, string memory providerName) internal {
        try vm.envString(varName) returns (string memory value) {
            if (bytes(value).length > 0) {
                console.log("Node provider configured");
            } else {
                console.log("Node provider empty");
            }
        } catch {
            console.log("Node provider not configured");
        }
    }

    function testConnectivity() internal {
        console.log("\nConnectivity Tests:");
        console.log("==================");

        // Test mainnet connectivity
        string memory mainnetRpc = "https://mainnet.base.org";
        try vm.envString("BASE_MAINNET_RPC_URL") returns (string memory val) {
            mainnetRpc = val;
        } catch {}
        testNetworkConnectivity("Base Mainnet", mainnetRpc);

        // Test testnet connectivity
        string memory testnetRpc = "https://sepolia.base.org";
        try vm.envString("BASE_TESTNET_RPC_URL") returns (string memory val) {
            testnetRpc = val;
        } catch {}
        testNetworkConnectivity("Base Testnet", testnetRpc);
    }

    function testNetworkConnectivity(string memory networkName, string memory rpcUrl) internal {
        console.log("Testing network connectivity...");

        string[] memory inputs = new string[](3);
        inputs[0] = "cast";
        inputs[1] = "block-number";
        inputs[2] = string(abi.encodePacked("--rpc-url=", rpcUrl));

        try vm.ffi(inputs) returns (bytes memory result) {
            console.log("Network connected successfully");
        } catch Error(string memory reason) {
            console.log("Connection failed");
        } catch {
            console.log("Connection failed - unknown error");
        }
    }
}