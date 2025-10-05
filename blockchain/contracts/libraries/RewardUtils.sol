// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title RewardUtils
 * @dev Utility library for reward calculations and validations
 */
library RewardUtils {
    /**
     * @dev Calculates loyalty points based on attendance count
     * @param attendanceCount Number of events attended
     * @return Loyalty points
     */
    function calculateLoyaltyPoints(
        uint256 attendanceCount
    ) internal pure returns (uint256) {
        return attendanceCount * 10; // 10 points per attendance
    }

    /**
     * @dev Checks if user qualifies for loyalty reward
     * @param points Current points
     * @param threshold Required threshold
     * @return True if qualifies
     */
    function qualifiesForLoyaltyReward(
        uint256 points,
        uint256 threshold
    ) internal pure returns (bool) {
        return points >= threshold;
    }

    /**
     * @dev Generates a referral code hash
     * @param user User address
     * @param nonce Unique nonce
     * @return Code hash
     */
    function generateReferralCode(
        address user,
        uint256 nonce
    ) internal pure returns (bytes32) {
        assembly {
            mstore(0x00, user)
            mstore(0x20, nonce)
            let hash := keccak256(0x00, 0x40)
            return(0x00, 0x20)
        }
    }
}
