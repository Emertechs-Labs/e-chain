// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "../interfaces/IEventTicket.sol";

/**
 * @title EventTicket
 * @dev NFT contract for event tickets with royalty support
 * @notice Each event gets its own instance of this contract via cloning
 */
contract EventTicket is
    ERC721,
    ERC721URIStorage,
    ERC721Burnable,
    Pausable,
    Ownable,
    IEventTicket,
    IERC2981
{
    // ============ State Variables ============

    uint256 private _tokenIdCounter;

    uint256 public override eventId;
    address public override organizer;
    uint256 public override ticketPrice;
    uint256 public override maxSupply;
    address public override factory;

    /// @notice Mapping from token ID to ticket information
    mapping(uint256 => TicketInfo) private _ticketInfo;

    /// @notice Mapping from token ID to transfer restriction
    mapping(uint256 => bool) private _transferRestricted;

    /// @notice Royalty information (EIP-2981)
    address private _royaltyRecipient;
    uint96 private _royaltyFeeBps; // Basis points (100 = 1%)

    /// @notice Total tickets sold
    uint256 private _totalSold;

    /// @notice Whether the contract has been initialized
    bool private _initialized;

    // ============ Modifiers ============

    modifier onlyOrganizerOrFactory() {
        require(
            msg.sender == organizer || msg.sender == factory,
            "Not authorized"
        );
        _;
    }

    modifier validTokenId(uint256 tokenId) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        _;
    }

    modifier onlyInitialized() {
        require(_initialized, "Contract not initialized");
        _;
    }

    // ============ Constructor ============

    constructor() ERC721("", "") Ownable(msg.sender) {
        // Contract starts uninitialized
        _tokenIdCounter = 1;
    }

    // ============ Initializer ============

    function initialize(
        string calldata name,
        string calldata symbol,
        address _organizer,
        uint256 _eventId,
        uint256 _ticketPrice,
        uint256 _maxSupply,
        address _factory
    ) external override {
        require(!_initialized, "Already initialized");
        require(_organizer != address(0), "Invalid organizer");
        require(_factory != address(0), "Invalid factory");

        // Set contract metadata (this is a workaround since we can't call constructor with params)
        // In a real implementation, you'd use a proper proxy pattern

        organizer = _organizer;
        eventId = _eventId;
        ticketPrice = _ticketPrice;
        maxSupply = _maxSupply;
        factory = _factory;

        // Transfer ownership to organizer
        _transferOwnership(_organizer);

        // Set default royalty to 5% to organizer
        _royaltyRecipient = _organizer;
        _royaltyFeeBps = 500; // 5%

        _initialized = true;
    }

    // ============ Core Functions ============

    function mintTicket(
        address to,
        uint256 seatNumber,
        uint256 tier
    )
        external
        payable
        override
        onlyOrganizerOrFactory
        whenNotPaused
        onlyInitialized
        returns (uint256 tokenId)
    {
        require(to != address(0), "Cannot mint to zero address");
        require(_totalSold < maxSupply, "Max supply reached");
        require(msg.value >= ticketPrice, "Insufficient payment");

        tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _totalSold++;

        // Mint the NFT
        _safeMint(to, tokenId);

        // Store ticket information
        _ticketInfo[tokenId] = TicketInfo({
            eventId: eventId,
            seatNumber: seatNumber,
            tier: tier,
            isUsed: false,
            mintedAt: block.timestamp,
            originalBuyer: to
        });

        emit TicketMinted(tokenId, to, eventId, seatNumber, tier);

        // Refund excess payment
        if (msg.value > ticketPrice) {
            payable(msg.sender).transfer(msg.value - ticketPrice);
        }

        return tokenId;
    }

    function batchMintTickets(
        address[] calldata to,
        uint256[] calldata seatNumbers,
        uint256[] calldata tiers
    )
        external
        payable
        override
        onlyOrganizerOrFactory
        whenNotPaused
        onlyInitialized
        returns (uint256[] memory tokenIds)
    {
        require(
            to.length == seatNumbers.length &&
                seatNumbers.length == tiers.length,
            "Array length mismatch"
        );
        require(to.length > 0, "Empty arrays");
        require(_totalSold + to.length <= maxSupply, "Would exceed max supply");
        require(msg.value >= ticketPrice * to.length, "Insufficient payment");

        tokenIds = new uint256[](to.length);

        for (uint256 i = 0; i < to.length; i++) {
            require(to[i] != address(0), "Cannot mint to zero address");

            uint256 tokenId = _tokenIdCounter;
            _tokenIdCounter++;
            _totalSold++;

            // Mint the NFT
            _safeMint(to[i], tokenId);

            // Store ticket information
            _ticketInfo[tokenId] = TicketInfo({
                eventId: eventId,
                seatNumber: seatNumbers[i],
                tier: tiers[i],
                isUsed: false,
                mintedAt: block.timestamp,
                originalBuyer: to[i]
            });

            tokenIds[i] = tokenId;
            emit TicketMinted(
                tokenId,
                to[i],
                eventId,
                seatNumbers[i],
                tiers[i]
            );
        }

        // Refund excess payment
        uint256 totalCost = ticketPrice * to.length;
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }

        return tokenIds;
    }

    function useTicket(
        uint256 tokenId
    ) external override validTokenId(tokenId) onlyOrganizerOrFactory {
        require(!_ticketInfo[tokenId].isUsed, "Ticket already used");

        _ticketInfo[tokenId].isUsed = true;
        emit TicketUsed(tokenId, ownerOf(tokenId), block.timestamp);
    }

    function setTransferRestriction(
        uint256 tokenId,
        bool restricted
    ) external override validTokenId(tokenId) onlyOrganizerOrFactory {
        _transferRestricted[tokenId] = restricted;
        emit TicketTransferRestricted(tokenId, restricted);
    }

    // ============ View Functions ============

    function getTicketInfo(
        uint256 tokenId
    ) external view override validTokenId(tokenId) returns (TicketInfo memory) {
        return _ticketInfo[tokenId];
    }

    function isValidTicket(
        uint256 tokenId
    ) external view override validTokenId(tokenId) returns (bool) {
        return !_ticketInfo[tokenId].isUsed;
    }

    function getOwnerTickets(
        address owner
    ) external view override returns (uint256[] memory tokenIds) {
        uint256 balance = balanceOf(owner);
        tokenIds = new uint256[](balance);
        uint256 index = 0;

        for (uint256 i = 1; i < _tokenIdCounter && index < balance; i++) {
            if (_ownerOf(i) != address(0) && ownerOf(i) == owner) {
                tokenIds[index] = i;
                index++;
            }
        }
    }

    function totalSold() external view override returns (uint256) {
        return _totalSold;
    }

    function ticketsRemaining() external view override returns (uint256) {
        return maxSupply - _totalSold;
    }

    // ============ Royalty Functions (EIP-2981) ============

    function setRoyaltyInfo(
        address recipient,
        uint96 feeBps
    ) external onlyOwner {
        require(feeBps <= 1000, "Royalty fee too high"); // Max 10%
        _royaltyRecipient = recipient;
        _royaltyFeeBps = feeBps;
    }

    function royaltyInfo(
        uint256,
        uint256 salePrice
    ) external view override returns (address receiver, uint256 royaltyAmount) {
        receiver = _royaltyRecipient;
        royaltyAmount = (salePrice * _royaltyFeeBps) / 10000;
    }

    // ============ Admin Functions ============

    function setTokenURI(
        uint256 tokenId,
        string calldata uri
    ) external onlyOwner validTokenId(tokenId) {
        _setTokenURI(tokenId, uri);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }

    // ============ Override Functions ============

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override whenNotPaused returns (address) {
        address from = _ownerOf(tokenId);

        // Check transfer restrictions
        if (from != address(0) && to != address(0)) {
            require(!_transferRestricted[tokenId], "Transfer restricted");
        }

        return super._update(to, tokenId, auth);
    }

    function burn(uint256 tokenId) public override {
        // Only allow owner or approved to burn
        require(
            _isAuthorized(owner(), msg.sender, tokenId),
            "Not authorized to burn"
        );

        delete _ticketInfo[tokenId];
        delete _transferRestricted[tokenId];

        super.burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage, IERC165) returns (bool) {
        return
            interfaceId == type(IERC2981).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
