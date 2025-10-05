// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract POAPAttendance is ERC721, EIP712, Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

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

    // Nonce mapping to prevent signature replay attacks
    mapping(address => uint256) public nonces;

    // EIP-712 structured data signing
    bytes32 private constant MINT_ATTENDANCE_TYPEHASH =
        keccak256(
            "MintAttendance(uint256 eventId,address attendee,uint256 nonce,uint256 deadline)"
        );

    address public eventFactory;

    uint256 private _nextTokenId;

    event AttendanceMinted(
        uint256 indexed eventId,
        address indexed attendee,
        uint256 tokenId
    );

    constructor(
        address _eventFactory
    )
        ERC721("POAP Attendance", "POAP")
        EIP712("POAPAttendance", "1")
        Ownable(msg.sender)
    {
        eventFactory = _eventFactory;
    }

    // Soulbound: Disable transfers
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address from) {
        from = super._update(to, tokenId, auth);
        if (from != address(0) && to != address(0)) revert SoulboundTransfer();
    }

    // Mint function with EIP-712 structured signature verification
    function mintAttendance(
        uint256 eventId,
        address attendee,
        uint256 nonce,
        uint256 deadline,
        bytes memory signature
    ) external {
        if (hasClaimed[eventId][attendee]) revert AlreadyClaimed();
        require(nonce == nonces[attendee], "Invalid nonce");
        require(block.timestamp <= deadline, "Signature expired");

        // EIP-712 structured data signing for domain separation
        bytes32 structHash;
        assembly {
            let ptr := mload(0x40)
            mstore(ptr, 0x8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f) // MINT_ATTENDANCE_TYPEHASH
            mstore(add(ptr, 0x20), eventId)
            mstore(add(ptr, 0x40), attendee)
            mstore(add(ptr, 0x60), nonce)
            mstore(add(ptr, 0x80), deadline)
            structHash := keccak256(ptr, 0xA0)
        }
        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, signature);

        if (signer != owner() && signer != eventFactory)
            revert InvalidSignature();

        // Increment nonce to prevent replay
        nonces[attendee]++;

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
