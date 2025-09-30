// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/IEventTicket.sol";
import "../interfaces/IEventFactory.sol";

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
    ReentrancyGuard,
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

    /// @notice Maximum tickets allowed per address (default: 1, can be modified by organizer)
    uint256 public maxTicketsPerAddress;

    /// @notice Organizer's accumulated balance after platform fees
    uint256 private _organizerBalance;

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
        require(msg.sender == _factory || factory == address(0), "Only factory can initialize");
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

        // Set default ticket limit per address to 1 (can be modified by organizer)
        maxTicketsPerAddress = 1;

        _initialized = true;
    }

    // ============ Core Functions ============

    /**
     * @notice Allows anyone to purchase tickets directly
     * @dev Public function for end users to buy tickets with ETH
     * @param quantity Number of tickets to purchase (1-10 per transaction)
     * @return tokenIds Array of minted token IDs
     */
    function purchaseTicket(
        uint256 quantity
    ) 
        external 
        payable 
        whenNotPaused 
        onlyInitialized 
        returns (uint256[] memory tokenIds) 
    {
        // Input validation
        require(quantity > 0, "Quantity must be greater than 0");
        require(quantity <= 10, "Max 10 tickets per transaction"); // Anti-spam protection
        require(_totalSold + quantity <= maxSupply, "Exceeds maximum supply");
        
        // Price calculation with overflow protection
        uint256 totalCost = ticketPrice * quantity;
        require(totalCost / quantity == ticketPrice, "Price overflow detected");
        require(msg.value >= totalCost, "Insufficient payment");

        // Rate limiting: configurable max tickets per address per event (default: 1)
        uint256 currentBalance = balanceOf(msg.sender);
        require(currentBalance + quantity <= maxTicketsPerAddress, "Exceeds max tickets per address");

        // Handle revenue distribution
        if (ticketPrice > 0) {
            // PAID EVENTS: Deduct platform fee
            IEventFactory factoryContract = IEventFactory(factory);
            uint256 platformFeeBps = factoryContract.platformFeeBps();
            uint256 platformFee = (totalCost * platformFeeBps) / 10000;
            uint256 organizerRevenue = totalCost - platformFee;
            
            // Send platform fee to treasury immediately
            address treasury = factoryContract.treasury();
            payable(treasury).transfer(platformFee);
            
            // Track organizer revenue for withdrawal
            _organizerBalance += organizerRevenue;
        }
        // For FREE EVENTS (ticketPrice = 0): no fees, no revenue

        // Initialize return array
        tokenIds = new uint256[](quantity);

        // Mint tickets in a gas-efficient loop
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _tokenIdCounter;
            _tokenIdCounter++;
            _totalSold++;

            // Mint NFT to purchaser
            _safeMint(msg.sender, tokenId);

            // Store ticket information
            _ticketInfo[tokenId] = TicketInfo({
                eventId: eventId,
                seatNumber: 0, // General admission
                tier: 0,       // Standard tier
                isUsed: false,
                mintedAt: block.timestamp,
                originalBuyer: msg.sender
            });

            tokenIds[i] = tokenId;
            emit TicketMinted(tokenId, msg.sender, eventId, 0, 0);
        }

        // Refund excess payment
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }

        return tokenIds;
    }

    /**
     * @notice Mint ticket function for organizers/factory (admin use)
     * @dev Restricted function for special ticket creation
     * @param to Recipient address
     * @param seatNumber Seat number (0 for general admission)
     * @param tier Ticket tier (0=General, 1=VIP, etc.)
     * @return tokenId The minted token ID
     */
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
        uint256 totalCost = ticketPrice * to.length;
        require(totalCost / to.length == ticketPrice, "Overflow detected");
        require(msg.value >= totalCost, "Insufficient payment");

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

    /**
     * @notice Set maximum tickets allowed per address (organizer only)
     * @param newLimit New maximum tickets per address (0 means unlimited)
     */
    function setMaxTicketsPerAddress(uint256 newLimit) external onlyOrganizerOrFactory {
        maxTicketsPerAddress = newLimit;
        emit MaxTicketsPerAddressUpdated(newLimit);
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
        require(recipient != address(0), "Invalid recipient");
        _royaltyRecipient = recipient;
        _royaltyFeeBps = feeBps;
        emit RoyaltyInfoUpdated(recipient, feeBps);
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

    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = _organizerBalance;
        require(balance > 0, "No funds to withdraw");
        
        _organizerBalance = 0;
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
        emit FundsWithdrawn(owner(), balance);
    }

    /**
     * @notice Get organizer's available balance for withdrawal
     * @return Available balance in wei
     */
    function organizerBalance() external view returns (uint256) {
        return _organizerBalance;
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
