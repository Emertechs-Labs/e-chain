// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title IMultisigWallet
 * @dev Interface for the Hedera Multisig Wallet contract
 * @notice Provides secure multi-signature functionality for transaction approval
 */
interface IMultisigWallet {
    // Events
    event SignerAdded(address indexed signer, uint256 weight);
    event SignerRemoved(address indexed signer);
    event ThresholdChanged(uint256 oldThreshold, uint256 newThreshold);
    event TransactionProposed(
        uint256 indexed txId,
        address indexed proposer,
        address indexed to,
        uint256 value,
        bytes data,
        uint256 timestamp
    );
    event TransactionApproved(uint256 indexed txId, address indexed approver);
    event TransactionExecuted(uint256 indexed txId, bytes result);
    event TransactionCancelled(uint256 indexed txId);

    // Structs
    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        address proposer;
        uint256 timestamp;
        bool executed;
        uint256 approvals;
        mapping(address => bool) approved;
    }

    // View functions
    function getThreshold() external view returns (uint256);
    function getSignerWeight(address signer) external view returns (uint256);
    function isSigner(address account) external view returns (bool);
    function getTransactionCount() external view returns (uint256);
    function getTransaction(uint256 txId) external view returns (
        address to,
        uint256 value,
        bytes memory data,
        address proposer,
        uint256 timestamp,
        bool executed,
        uint256 approvals
    );
    function getSigners() external view returns (address[] memory);
    function getTotalWeight() external view returns (uint256);

    // State changing functions
    function proposeTransaction(
        address to,
        uint256 value,
        bytes calldata data
    ) external returns (uint256 txId);

    function approveTransaction(uint256 txId) external;

    function executeTransaction(uint256 txId) external returns (bytes memory);

    function cancelTransaction(uint256 txId) external;

    // Admin functions
    function addSigner(address signer, uint256 weight) external;

    function removeSigner(address signer) external;

    function changeThreshold(uint256 newThreshold) external;

    // Emergency functions
    function emergencyPause() external;
    function emergencyUnpause() external;
    function emergencyExecute(uint256 txId) external;
}