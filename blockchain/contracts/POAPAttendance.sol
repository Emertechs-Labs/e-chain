// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract POAPAttendance is ERC721, Ownable {
    using ECDSA for bytes32;

    error SoulboundTransfer();
    error AlreadyClaimed();
    error InvalidSignature();
    error NotRegistered();

    struct Attendance {
        uint256 eventId;
        uint256 tokenId;
        address attendee;
        uint256 timestamp;
    }

    // Mapping from eventId to attendee to whether they have claimed
    mapping(uint256 => mapping(address => bool)) public hasClaimed;

    // Mapping from tokenId to Attendance data
    mapping(uint256 => Attendance) public attendances;

    address public eventFactory;

    uint256 private _nextTokenId;

    event AttendanceMinted(
        uint256 indexed eventId,
        address indexed attendee,
        uint256 tokenId
    );

    constructor(
        address _eventFactory
    ) ERC721("POAP Attendance", "POAP") Ownable(msg.sender) {
        eventFactory = _eventFactory;
    }

    // Soulbound: Disable transfers
    function transferFrom(address, address, uint256) public pure override {
        revert SoulboundTransfer();
    }

    function safeTransferFrom(address, address, uint256) public pure override {
        revert SoulboundTransfer();
    }

    function safeTransferFrom(
        address,
        address,
        uint256,
        bytes memory
    ) public pure override {
        revert SoulboundTransfer();
    }

    // Mint function with signature verification
    function mintAttendance(
        uint256 eventId,
        address attendee,
        bytes memory signature
    ) external {
        if (hasClaimed[eventId][attendee]) revert AlreadyClaimed();

        // Verify signature (assuming signed by event organizer or EventFactory)
        bytes32 messageHash = keccak256(abi.encodePacked(eventId, attendee));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedMessageHash.recover(signature);
        if (signer != owner() && signer != eventFactory)
            revert InvalidSignature();

        // Optionally, query EventFactory for validation (assuming it has a function)
        // if (!IEventFactory(eventFactory).isAttendeeRegistered(eventId, attendee)) revert NotRegistered();

        uint256 tokenId = _nextTokenId++;
        _mint(attendee, tokenId);

        attendances[tokenId] = Attendance({
            eventId: eventId,
            tokenId: tokenId,
            attendee: attendee,
            timestamp: block.timestamp
        });

        hasClaimed[eventId][attendee] = true;

        emit AttendanceMinted(eventId, attendee, tokenId);
    }

    // View function to get attendance data
    function getAttendance(
        uint256 tokenId
    ) external view returns (Attendance memory) {
        return attendances[tokenId];
    }

    // Update eventFactory (only owner)
    function setEventFactory(address _eventFactory) external onlyOwner {
        eventFactory = _eventFactory;
    }
}
