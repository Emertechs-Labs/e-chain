// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IPOAPAttendance {
    struct Attendance {
        uint256 eventId;
        uint256 tokenId;
        address attendee;
        uint256 timestamp;
    }

    function hasClaimed(
        uint256 eventId,
        address attendee
    ) external view returns (bool);
    function getAttendance(
        uint256 tokenId
    ) external view returns (Attendance memory);
    function balanceOf(address owner) external view returns (uint256);
    function setEventFactory(address _eventFactory) external;
}
