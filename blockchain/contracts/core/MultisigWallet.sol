// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IMultisigWallet} from "../interfaces/IMultisigWallet.sol";

/**
 * @title MultisigWallet
 * @dev Secure multi-signature wallet implementation for Hedera
 * @notice Implements weighted multi-signature functionality with security controls
 */
contract MultisigWallet is IMultisigWallet, Ownable, Pausable, ReentrancyGuard {
    // State variables
    uint256 private _threshold;
    uint256 private _transactionCount;
    mapping(address => uint256) private _signerWeights;
    mapping(uint256 => Transaction) private _transactions;
    address[] private _signers;

    // Constants
    uint256 private constant MAX_SIGNERS = 50;
    uint256 private constant MAX_THRESHOLD = 100;
    uint256 private constant MIN_THRESHOLD = 1;

    // Modifiers
    modifier onlySigner() {
        require(isSigner(msg.sender), "MultisigWallet: caller is not a signer");
        _;
    }

    modifier txExists(uint256 txId) {
        require(txId < _transactionCount, "MultisigWallet: transaction does not exist");
        _;
    }

    modifier notExecuted(uint256 txId) {
        require(!_transactions[txId].executed, "MultisigWallet: transaction already executed");
        _;
    }

    modifier notApproved(uint256 txId) {
        require(!_transactions[txId].approved[msg.sender], "MultisigWallet: transaction already approved by signer");
        _;
    }

    modifier validThreshold(uint256 threshold) {
        require(threshold >= MIN_THRESHOLD && threshold <= MAX_THRESHOLD, "MultisigWallet: invalid threshold");
        require(threshold <= getTotalWeight(), "MultisigWallet: threshold cannot exceed total weight");
        _;
    }

    modifier validSigner(address signer) {
        require(signer != address(0), "MultisigWallet: invalid signer address");
        require(!isSigner(signer), "MultisigWallet: address is already a signer");
        _;
    }

    /**
     * @dev Constructor
     * @param signers Array of initial signer addresses
     * @param weights Array of weights corresponding to signers
     * @param threshold Minimum weight required for transaction execution
     */
    constructor(
        address[] memory signers,
        uint256[] memory weights,
        uint256 threshold
    ) Ownable(msg.sender) {
        require(signers.length == weights.length, "MultisigWallet: signers and weights length mismatch");
        require(signers.length > 0, "MultisigWallet: at least one signer required");
        require(signers.length <= MAX_SIGNERS, "MultisigWallet: too many signers");

        uint256 totalWeight = 0;
        for (uint256 i = 0; i < signers.length; i++) {
            require(signers[i] != address(0), "MultisigWallet: invalid signer address");
            require(weights[i] > 0, "MultisigWallet: weight must be greater than zero");
            require(_signerWeights[signers[i]] == 0, "MultisigWallet: duplicate signer");

            _signerWeights[signers[i]] = weights[i];
            _signers.push(signers[i]);
            totalWeight += weights[i];
        }

        require(threshold >= MIN_THRESHOLD && threshold <= totalWeight, "MultisigWallet: invalid threshold");
        _threshold = threshold;
    }

    /**
     * @dev Propose a new transaction
     * @param to Target address
     * @param value Ether value to send
     * @param data Calldata for the transaction
     * @return txId Transaction ID
     */
    function proposeTransaction(
        address to,
        uint256 value,
        bytes calldata data
    ) external override onlySigner whenNotPaused returns (uint256 txId) {
        require(to != address(0) || data.length > 0, "MultisigWallet: invalid transaction");

        txId = _transactionCount++;
        Transaction storage transaction = _transactions[txId];
        transaction.to = to;
        transaction.value = value;
        transaction.data = data;
        transaction.proposer = msg.sender;
        transaction.timestamp = block.timestamp;
        transaction.executed = false;
        transaction.approvals = 0;

        emit TransactionProposed(txId, msg.sender, to, value, data, block.timestamp);
    }

    /**
     * @dev Approve a transaction
     * @param txId Transaction ID to approve
     */
    function approveTransaction(uint256 txId)
        external
        override
        onlySigner
        txExists(txId)
        notExecuted(txId)
        notApproved(txId)
        whenNotPaused
    {
        Transaction storage transaction = _transactions[txId];
        transaction.approved[msg.sender] = true;
        transaction.approvals += _signerWeights[msg.sender];

        emit TransactionApproved(txId, msg.sender);

        // Auto-execute if threshold is met
        if (transaction.approvals >= _threshold) {
            _executeTransaction(txId);
        }
    }

    /**
     * @dev Execute a transaction
     * @param txId Transaction ID to execute
     * @return result Return data from the executed transaction
     */
    function executeTransaction(uint256 txId)
        external
        override
        txExists(txId)
        notExecuted(txId)
        whenNotPaused
        nonReentrant
        returns (bytes memory result)
    {
        require(_transactions[txId].approvals >= _threshold, "MultisigWallet: insufficient approvals");

        return _executeTransaction(txId);
    }

    /**
     * @dev Cancel a transaction (only by proposer)
     * @param txId Transaction ID to cancel
     */
    function cancelTransaction(uint256 txId)
        external
        override
        txExists(txId)
        notExecuted(txId)
        whenNotPaused
    {
        Transaction storage transaction = _transactions[txId];
        require(transaction.proposer == msg.sender || owner() == msg.sender,
                "MultisigWallet: only proposer or owner can cancel");

        transaction.executed = true; // Mark as executed to prevent further actions

        emit TransactionCancelled(txId);
    }

    /**
     * @dev Add a new signer (only owner)
     * @param signer Address of the new signer
     * @param weight Weight of the new signer
     */
    function addSigner(address signer, uint256 weight)
        external
        override
        onlyOwner
        validSigner(signer)
        whenNotPaused
    {
        require(weight > 0, "MultisigWallet: weight must be greater than zero");
        require(_signers.length < MAX_SIGNERS, "MultisigWallet: maximum signers reached");

        _signerWeights[signer] = weight;
        _signers.push(signer);

        emit SignerAdded(signer, weight);
    }

    /**
     * @dev Remove a signer (only owner)
     * @param signer Address of the signer to remove
     */
    function removeSigner(address signer)
        external
        override
        onlyOwner
        whenNotPaused
    {
        require(isSigner(signer), "MultisigWallet: address is not a signer");
        require(_signers.length > 1, "MultisigWallet: cannot remove last signer");

        _signerWeights[signer] = 0;

        // Remove from signers array
        for (uint256 i = 0; i < _signers.length; i++) {
            if (_signers[i] == signer) {
                _signers[i] = _signers[_signers.length - 1];
                _signers.pop();
                break;
            }
        }

        // Ensure threshold is still valid
        if (_threshold > getTotalWeight()) {
            _threshold = getTotalWeight();
        }

        emit SignerRemoved(signer);
    }

    /**
     * @dev Change the threshold (only owner)
     * @param newThreshold New threshold value
     */
    function changeThreshold(uint256 newThreshold)
        external
        override
        onlyOwner
        validThreshold(newThreshold)
        whenNotPaused
    {
        uint256 oldThreshold = _threshold;
        _threshold = newThreshold;

        emit ThresholdChanged(oldThreshold, newThreshold);
    }

    /**
     * @dev Emergency pause (only owner)
     */
    function emergencyPause() external override onlyOwner {
        _pause();
    }

    /**
     * @dev Emergency unpause (only owner)
     */
    function emergencyUnpause() external override onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency execute transaction (only owner, bypasses approvals)
     * @param txId Transaction ID to execute
     */
    function emergencyExecute(uint256 txId)
        external
        override
        onlyOwner
        txExists(txId)
        notExecuted(txId)
        nonReentrant
    {
        _executeTransaction(txId);
    }

    // View functions

    function getThreshold() external view override returns (uint256) {
        return _threshold;
    }

    function getSignerWeight(address signer) external view override returns (uint256) {
        return _signerWeights[signer];
    }

    function isSigner(address account) public view override returns (bool) {
        return _signerWeights[account] > 0;
    }

    function getTransactionCount() external view override returns (uint256) {
        return _transactionCount;
    }

    function getTransaction(uint256 txId) external view override returns (
        address to,
        uint256 value,
        bytes memory data,
        address proposer,
        uint256 timestamp,
        bool executed,
        uint256 approvals
    ) {
        Transaction storage transaction = _transactions[txId];
        return (
            transaction.to,
            transaction.value,
            transaction.data,
            transaction.proposer,
            transaction.timestamp,
            transaction.executed,
            transaction.approvals
        );
    }

    function getSigners() external view override returns (address[] memory) {
        return _signers;
    }

    function getTotalWeight() public view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < _signers.length; i++) {
            total += _signerWeights[_signers[i]];
        }
        return total;
    }

    // Internal functions

    /**
     * @dev Internal function to execute a transaction
     * @param txId Transaction ID to execute
     * @return result Return data from the executed transaction
     */
    function _executeTransaction(uint256 txId) internal returns (bytes memory result) {
        Transaction storage transaction = _transactions[txId];
        transaction.executed = true;

        // Execute the transaction
        (bool success, bytes memory returnData) = transaction.to.call{value: transaction.value}(
            transaction.data
        );

        if (!success) {
            transaction.executed = false; // Revert execution flag on failure
            assembly {
                revert(add(returnData, 32), mload(returnData))
            }
        }

        emit TransactionExecuted(txId, returnData);
        return returnData;
    }

    // Fallback function to receive ether
    receive() external payable {}
}