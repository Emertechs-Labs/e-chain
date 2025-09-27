// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract EventTicketing {
    error NotOwner();

    struct Event {
        uint256 id;
        string name;
        uint256 date;
        uint256 ticketPrice;
        uint256 ticketCount;
        uint256 ticketsSold;
        address organizer;
    }

    mapping(uint256 => Event) public events;
    uint256 private _eventIdCounter;

    address public owner;

    event EventCreated(
        uint256 id,
        string name,
        uint256 date,
        uint256 ticketPrice,
        uint256 ticketCount
    );

    constructor() {
        owner = msg.sender;
    }

    function createEvent(
        string memory name,
        uint256 date,
        uint256 ticketPrice,
        uint256 ticketCount
    ) external {
        if (msg.sender != owner) revert NotOwner();
        _eventIdCounter++;
        uint256 eventId = _eventIdCounter;

        events[eventId] = Event({
            id: eventId,
            name: name,
            date: date,
            ticketPrice: ticketPrice,
            ticketCount: ticketCount,
            ticketsSold: 0,
            organizer: msg.sender
        });

        emit EventCreated(eventId, name, date, ticketPrice, ticketCount);
    }
}
