// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {MultisigWallet} from "../contracts/core/MultisigWallet.sol";

contract MultisigWalletTest is Test {
    MultisigWallet public multisig;

    // Test accounts
    address public owner = address(1);
    address public signer1 = address(2);
    address public signer2 = address(3);
    address public signer3 = address(4);
    address public nonSigner = address(5);
    address public recipient = address(6);

    // Test data
    address[] public signers;
    uint256[] public weights;
    uint256 public threshold = 2;

    // Events to test
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

    function setUp() public {
        // Setup test signers and weights
        signers = new address[](3);
        signers[0] = signer1;
        signers[1] = signer2;
        signers[2] = signer3;

        weights = new uint256[](3);
        weights[0] = 1;
        weights[1] = 1;
        weights[2] = 1;

        // Deploy multisig wallet
        vm.prank(owner);
        multisig = new MultisigWallet(signers, weights, threshold);

        // Fund the multisig wallet
        vm.deal(address(multisig), 100 ether);
    }

    // Constructor Tests
    function test_Constructor() public view {
        assertEq(multisig.getThreshold(), threshold);
        assertEq(multisig.getSigners().length, 3);
        assertTrue(multisig.isSigner(signer1));
        assertTrue(multisig.isSigner(signer2));
        assertTrue(multisig.isSigner(signer3));
        assertEq(multisig.getSignerWeight(signer1), 1);
        assertEq(multisig.getSignerWeight(signer2), 1);
        assertEq(multisig.getSignerWeight(signer3), 1);
        assertEq(multisig.getTotalWeight(), 3);
    }

    function test_Constructor_Revert_InvalidThreshold() public {
        uint256 invalidThreshold = 10; // Higher than total weight

        vm.expectRevert("MultisigWallet: invalid threshold");
        new MultisigWallet(signers, weights, invalidThreshold);
    }

    function test_Constructor_Revert_ZeroThreshold() public {
        vm.expectRevert("MultisigWallet: invalid threshold");
        new MultisigWallet(signers, weights, 0);
    }

    function test_Constructor_Revert_NoSigners() public {
        address[] memory emptySigners = new address[](0);
        uint256[] memory emptyWeights = new uint256[](0);

        vm.expectRevert("MultisigWallet: at least one signer required");
        new MultisigWallet(emptySigners, emptyWeights, 1);
    }

    function test_Constructor_Revert_MismatchedArrays() public {
        address[] memory mismatchedSigners = new address[](2); // Only 2 signers
        mismatchedSigners[0] = signer1;
        mismatchedSigners[1] = signer2;

        vm.expectRevert("MultisigWallet: signers and weights length mismatch");
        new MultisigWallet(mismatchedSigners, weights, threshold);
    }

    // Transaction Proposal Tests
    function test_ProposeTransaction() public {
        vm.prank(signer1);

        vm.expectEmit(true, true, true, false);
        emit TransactionProposed(0, signer1, recipient, 1 ether, "", block.timestamp);

        uint256 txId = multisig.proposeTransaction(recipient, 1 ether, "");

        assertEq(multisig.getTransactionCount(), 1);
        (address to, uint256 value, bytes memory data, address proposer, , bool executed, uint256 approvals) = multisig.getTransaction(txId);
        assertEq(to, recipient);
        assertEq(value, 1 ether);
        assertEq(data.length, 0);
        assertEq(proposer, signer1);
        assertEq(executed, false);
        assertEq(approvals, 0);
    }

    function test_ProposeTransaction_Revert_NonSigner() public {
        vm.prank(nonSigner);
        vm.expectRevert("MultisigWallet: caller is not a signer");
        multisig.proposeTransaction(recipient, 1 ether, "");
    }

    function test_ProposeTransaction_Revert_Paused() public {
        vm.prank(owner);
        multisig.emergencyPause();

        vm.prank(signer1);
        vm.expectRevert(); // EnforcedPause error
        multisig.proposeTransaction(recipient, 1 ether, "");
    }

    // Transaction Approval Tests
    function test_ApproveTransaction() public {
        // Propose transaction
        vm.prank(signer1);
        uint256 txId = multisig.proposeTransaction(recipient, 1 ether, "");

        // Approve transaction
        vm.prank(signer2);
        vm.expectEmit(true, false, false, false);
        emit TransactionApproved(txId, signer2);

        multisig.approveTransaction(txId);

        (, , , , , , uint256 approvals) = multisig.getTransaction(txId);
        assertEq(approvals, 1);
    }

    function test_ApproveTransaction_Revert_AlreadyApproved() public {
        // Propose and approve transaction
        vm.prank(signer1);
        uint256 txId = multisig.proposeTransaction(recipient, 1 ether, "");

        vm.prank(signer2);
        multisig.approveTransaction(txId);

        // Try to approve again
        vm.prank(signer2);
        vm.expectRevert("MultisigWallet: transaction already approved by signer");
        multisig.approveTransaction(txId);
    }

    function test_ApproveTransaction_Revert_Executed() public {
        // Propose transaction
        vm.prank(signer1);
        uint256 txId = multisig.proposeTransaction(recipient, 1 ether, "");

        // Approve with both signers to meet threshold
        vm.prank(signer2);
        multisig.approveTransaction(txId);

        vm.prank(signer3);
        multisig.approveTransaction(txId); // This should auto-execute

        // Try to approve executed transaction
        vm.prank(signer1);
        vm.expectRevert("MultisigWallet: transaction already executed");
        multisig.approveTransaction(txId);
    }

    // Transaction Execution Tests
    function test_ExecuteTransaction() public {
        uint256 initialBalance = recipient.balance;

        // Propose transaction
        vm.prank(signer1);
        uint256 txId = multisig.proposeTransaction(recipient, 1 ether, "");

        // Approve with sufficient weight
        vm.prank(signer2);
        multisig.approveTransaction(txId);

        vm.prank(signer3);
        vm.expectEmit(true, false, false, false);
        emit TransactionExecuted(txId, "");

        multisig.approveTransaction(txId); // Auto-executes

        // Verify execution
        (, , , , , bool executed, ) = multisig.getTransaction(txId);
        assertTrue(executed);
        assertEq(recipient.balance, initialBalance + 1 ether);
        assertEq(address(multisig).balance, 99 ether);
    }

    function test_ExecuteTransaction_Revert_InsufficientApprovals() public {
        // Propose transaction
        vm.prank(signer1);
        uint256 txId = multisig.proposeTransaction(recipient, 1 ether, "");

        // Only approve with one signer (insufficient for threshold of 2)
        vm.prank(signer2);
        multisig.approveTransaction(txId);

        // Try to execute
        vm.prank(signer1);
        vm.expectRevert("MultisigWallet: insufficient approvals");
        multisig.executeTransaction(txId);
    }

    function test_ExecuteTransaction_Revert_AlreadyExecuted() public {
        // Propose and execute transaction
        vm.prank(signer1);
        uint256 txId = multisig.proposeTransaction(recipient, 1 ether, "");

        vm.prank(signer2);
        multisig.approveTransaction(txId);

        vm.prank(signer3);
        multisig.approveTransaction(txId); // Executes

        // Try to execute again
        vm.prank(signer1);
        vm.expectRevert("MultisigWallet: transaction already executed");
        multisig.executeTransaction(txId);
    }

    // Transaction Cancellation Tests
    function test_CancelTransaction_ByProposer() public {
        // Propose transaction
        vm.prank(signer1);
        uint256 txId = multisig.proposeTransaction(recipient, 1 ether, "");

        // Cancel by proposer
        vm.prank(signer1);
        vm.expectEmit(true, false, false, false);
        emit TransactionCancelled(txId);

        multisig.cancelTransaction(txId);

        // Verify cancellation (marked as executed to prevent further actions)
        (, , , , , bool executed, ) = multisig.getTransaction(txId);
        assertTrue(executed);
    }

    function test_CancelTransaction_ByOwner() public {
        // Propose transaction
        vm.prank(signer1);
        uint256 txId = multisig.proposeTransaction(recipient, 1 ether, "");

        // Cancel by owner
        vm.prank(owner);
        multisig.cancelTransaction(txId);

        // Verify cancellation
        (, , , , , bool executed, ) = multisig.getTransaction(txId);
        assertTrue(executed);
    }

    function test_CancelTransaction_Revert_NonProposer() public {
        // Propose transaction
        vm.prank(signer1);
        uint256 txId = multisig.proposeTransaction(recipient, 1 ether, "");

        // Try to cancel by non-proposer
        vm.prank(signer2);
        vm.expectRevert("MultisigWallet: only proposer or owner can cancel");
        multisig.cancelTransaction(txId);
    }

    // Signer Management Tests
    function test_AddSigner() public {
        address newSigner = address(7);
        uint256 newWeight = 2;

        vm.prank(owner);
        vm.expectEmit(true, false, false, false);
        emit SignerAdded(newSigner, newWeight);

        multisig.addSigner(newSigner, newWeight);

        assertTrue(multisig.isSigner(newSigner));
        assertEq(multisig.getSignerWeight(newSigner), newWeight);
        assertEq(multisig.getSigners().length, 4);
        assertEq(multisig.getTotalWeight(), 5);
    }

    function test_AddSigner_Revert_NonOwner() public {
        vm.prank(signer1);
        vm.expectRevert(); // OwnableUnauthorizedAccount error
        multisig.addSigner(address(7), 1);
    }

    function test_AddSigner_Revert_AlreadySigner() public {
        vm.prank(owner);
        vm.expectRevert("MultisigWallet: address is already a signer");
        multisig.addSigner(signer1, 1);
    }

    function test_RemoveSigner() public {
        vm.prank(owner);
        vm.expectEmit(true, false, false, false);
        emit SignerRemoved(signer3);

        multisig.removeSigner(signer3);

        assertFalse(multisig.isSigner(signer3));
        assertEq(multisig.getSignerWeight(signer3), 0);
        assertEq(multisig.getSigners().length, 2);
        assertEq(multisig.getTotalWeight(), 2);
    }

    function test_RemoveSigner_Revert_LastSigner() public {
        // Remove two signers first
        vm.startPrank(owner);
        multisig.removeSigner(signer2);
        multisig.removeSigner(signer3);

        // Try to remove last signer
        vm.expectRevert("MultisigWallet: cannot remove last signer");
        multisig.removeSigner(signer1);
        vm.stopPrank();
    }

    // Threshold Management Tests
    function test_ChangeThreshold() public {
        uint256 newThreshold = 3;

        vm.prank(owner);
        vm.expectEmit(false, false, false, false);
        emit ThresholdChanged(threshold, newThreshold);

        multisig.changeThreshold(newThreshold);

        assertEq(multisig.getThreshold(), newThreshold);
    }

    function test_ChangeThreshold_Revert_InvalidThreshold() public {
        vm.prank(owner);
        vm.expectRevert("MultisigWallet: threshold cannot exceed total weight");
        multisig.changeThreshold(10); // Higher than total weight
    }

    // Emergency Functions Tests
    function test_EmergencyPause() public {
        vm.prank(owner);
        multisig.emergencyPause();

        // Try to propose transaction when paused
        vm.prank(signer1);
        vm.expectRevert(); // EnforcedPause error
        multisig.proposeTransaction(recipient, 1 ether, "");
    }

    function test_EmergencyExecute() public {
        uint256 initialBalance = recipient.balance;

        // Propose transaction
        vm.prank(signer1);
        uint256 txId = multisig.proposeTransaction(recipient, 1 ether, "");

        // Emergency execute without approvals
        vm.prank(owner);
        vm.expectEmit(true, false, false, false);
        emit TransactionExecuted(txId, "");

        multisig.emergencyExecute(txId);

        // Verify execution
        assertEq(recipient.balance, initialBalance + 1 ether);
        (, , , , , bool executed, ) = multisig.getTransaction(txId);
        assertTrue(executed);
    }

    // Reentrancy Protection Test
    function test_ReentrancyProtection() public {
        // Deploy a mock contract that tries to reenter
        ReentrancyAttacker attacker = new ReentrancyAttacker(multisig);

        // Propose transaction to attacker
        vm.prank(signer1);
        uint256 txId = multisig.proposeTransaction(address(attacker), 1 ether, "");

        // Approve and try to execute - should succeed initially
        vm.prank(signer2);
        multisig.approveTransaction(txId);

        vm.prank(signer3);
        vm.expectRevert(); // ReentrancyGuard error from internal reentrancy
        multisig.approveTransaction(txId); // This triggers execution and reentrancy attempt
    }

    // Integration Test - Full Workflow
    function test_FullMultisigWorkflow() public {
        uint256 initialBalance = recipient.balance;

        // 1. Propose transaction
        vm.prank(signer1);
        uint256 txId = multisig.proposeTransaction(recipient, 1 ether, "");

        // 2. Approve by multiple signers
        vm.prank(signer2);
        multisig.approveTransaction(txId);

        vm.prank(signer3);
        multisig.approveTransaction(txId); // Should auto-execute

        // 3. Verify execution
        (, , , , , bool executed, uint256 approvals) = multisig.getTransaction(txId);
        assertTrue(executed);
        assertEq(approvals, 2); // Two approvals with weight 1 each
        assertEq(recipient.balance, initialBalance + 1 ether);
        assertEq(address(multisig).balance, 99 ether);
    }
}

// Mock contract for reentrancy testing
contract ReentrancyAttacker {
    MultisigWallet public multisig;
    uint256 public callCount = 0;

    constructor(MultisigWallet _multisig) {
        multisig = _multisig;
    }

    receive() external payable {
        callCount++;
        if (callCount == 1) {
            // Try to reenter on first call
            multisig.emergencyExecute(0); // This should fail due to reentrancy guard
        }
    }
}