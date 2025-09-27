// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title TicketUtils
 * @dev Utility library for ticket-related calculations and validations
 */
library TicketUtils {
    /**
     * @dev Calculates the total price for multiple tickets
     * @param basePrice Price per ticket
     * @param quantity Number of tickets
     * @return Total price
     */
    function calculateTotalPrice(
        uint256 basePrice,
        uint256 quantity
    ) internal pure returns (uint256) {
        return basePrice * quantity;
    }

    /**
     * @dev Validates ticket parameters
     * @param price Ticket price
     * @param maxSupply Maximum supply
     * @return True if valid
     */
    function validateTicketParams(
        uint256 price,
        uint256 maxSupply
    ) internal pure returns (bool) {
        return price > 0 && maxSupply > 0 && maxSupply <= 10000; // Reasonable limits
    }
}
