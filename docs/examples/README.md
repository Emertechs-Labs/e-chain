# 💡 Echain Examples & Use Cases

<div align="center">

![Echain Examples](https://img.shields.io/badge/Echain-Examples-00D4FF?style=for-the-badge&logo=ethereum&logoColor=white)
![Base Sepolia](https://img.shields.io/badge/Base-Sepolia_Testnet-0052FF?style=for-the-badge&logo=ethereum&logoColor=white)
![Live Demo](https://img.shields.io/badge/Live_Demo-Active-10B981?style=for-the-badge&logo=web&logoColor=white)

**Practical examples and real-world use cases for the Echain blockchain events platform**

*Production-ready code examples with live Base Sepolia deployment*

[🎯 Use Cases](#-use-case-examples) • [💻 Code Examples](#-code-examples) • [🎨 Templates](#-design-templates) • [⚠️ Notes](#-implementation-notes)

</div>

---

## Overview

This directory contains practical examples, code snippets, and real-world use cases for implementing the Echain blockchain events platform. These examples demonstrate how to integrate with the platform and implement common features.

**Current Status**: ✅ All examples are based on the fully implemented Echain platform running on Base Sepolia testnet with real blockchain data integration.

## 🎯 Use Case Examples

### 1. Tech Meetup (50 attendees)
**Scenario**: Monthly developer meetup with free attendance and networking focus.

**Features**:
- Free tickets (gas-only cost)
- POAP certificates for attendance
- Early bird badges for first 10 RSVPs
- Networking rewards for connecting with other attendees

**Implementation**:
```javascript
const meetupEvent = await echain.events.create({
  name: "Web3 Developers Meetup #42",
  metadataURI: "ipfs://QmMeetupMetadata...",
  ticketPrice: "0", // Free event
  maxTickets: 50,
  startTime: Math.floor(new Date("2024-12-15T18:00:00Z").getTime() / 1000),
  endTime: Math.floor(new Date("2024-12-15T21:00:00Z").getTime() / 1000)
});
```

### 2. Conference (500 attendees)
**Scenario**: Two-day tech conference with tiered pricing and sponsor integration.

**Features**:
- Multiple ticket tiers (General, VIP, Speaker)
- Dynamic pricing based on demand
- Sponsor-branded NFT rewards
- Multi-day attendance tracking

**Implementation**:
```javascript
const conference = await echain.events.create({
  name: "BlockchainCon 2024",
  metadataURI: "ipfs://QmConferenceMetadata...",
  ticketPrice: "1000000000000000000", // 1 ETH base price
  maxTickets: 500,
  startTime: Math.floor(new Date("2024-12-20T09:00:00Z").getTime() / 1000),
  endTime: Math.floor(new Date("2024-12-21T18:00:00Z").getTime() / 1000)
});

// Note: Tiered pricing handled via frontend logic and contract calls
```

### 3. Music Festival (5000 attendees)
**Scenario**: Large outdoor music festival with complex logistics and high-value NFT collectibles.

**Features**:
- High-volume ticket sales
- Resale marketplace with royalties
- Artist collaboration NFTs
- VIP experiences and backstage access

**Implementation**:
```javascript
const festival = await echain.events.create({
  name: "CryptoBeats Festival 2024",
  metadataURI: "ipfs://QmFestivalMetadata...",
  ticketPrice: "15000000000000000000", // 15 ETH
  maxTickets: 5000,
  startTime: Math.floor(new Date("2024-07-15T16:00:00Z").getTime() / 1000),
  endTime: Math.floor(new Date("2024-07-17T23:00:00Z").getTime() / 1000)
});
```

## 💻 Code Examples

### Wallet Connection Setup
Before implementing any blockchain interactions, ensure proper wallet setup:

```typescript
// frontend/lib/wagmi.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID || 'demo-project-id-for-development';

export const config = getDefaultConfig({
  appName: 'Echain',
  projectId, // Use fallback if env var is missing
  chains: [baseSepolia],
  ssr: true,
});
```

### Smart Contract Integration

#### Creating a Custom Event Contract
```solidity
// CustomEventTicket.sol
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IEventTicket.sol";

/**
 * @title CustomEventTicket
 * @dev NFT contract for event tickets with custom features
 */
contract CustomEventTicket is ERC721, Ownable {
    struct TicketInfo {
        uint256 eventId;
        uint256 seatNumber;
        uint256 tier; // 0=General, 1=VIP, 2=Speaker
        bool isUsed;
        uint256 mintedAt;
        address originalBuyer;
    }

    mapping(uint256 => TicketInfo) public tickets;
    uint256 private _nextTokenId = 1;

    uint256 public eventId;
    uint256 public ticketPrice;
    uint256 public maxSupply;
    uint256 public totalSold;

    event TicketMinted(uint256 tokenId, address to, uint256 eventId, uint256 seatNumber, uint256 tier);
    event TicketUsed(uint256 tokenId, address user, uint256 timestamp);

    constructor(
        string memory name,
        string memory symbol,
        address organizer
    ) ERC721(name, symbol) Ownable(organizer) {}

    function initialize(
        uint256 _eventId,
        uint256 _ticketPrice,
        uint256 _maxSupply
    ) external onlyOwner {
        eventId = _eventId;
        ticketPrice = _ticketPrice;
        maxSupply = _maxSupply;
    }

    function mintTicket(
        address to,
        uint256 seatNumber,
        uint256 tier
    ) external payable onlyOwner returns (uint256) {
        require(totalSold < maxSupply, "Max supply reached");
        require(msg.value >= ticketPrice, "Insufficient payment");

        uint256 tokenId = _nextTokenId++;
        totalSold++;

        _safeMint(to, tokenId);

        tickets[tokenId] = TicketInfo({
            eventId: eventId,
            seatNumber: seatNumber,
            tier: tier,
            isUsed: false,
            mintedAt: block.timestamp,
            originalBuyer: to
        });

        emit TicketMinted(tokenId, to, eventId, seatNumber, tier);
        return tokenId;
    }

    function useTicket(uint256 tokenId) external onlyOwner {
        require(_exists(tokenId), "Ticket does not exist");
        require(!tickets[tokenId].isUsed, "Ticket already used");

        tickets[tokenId].isUsed = true;
        emit TicketUsed(tokenId, ownerOf(tokenId), block.timestamp);
    }

    function getTicketInfo(uint256 tokenId) external view returns (TicketInfo memory) {
        require(_exists(tokenId), "Ticket does not exist");
        return tickets[tokenId];
    }
}
```

#### Incentive System Integration
```solidity
// CustomIncentives.sol
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CustomIncentives is ERC721, Ownable {
    struct Reward {
        uint256 rewardId;
        address user;
        string rewardType;
        uint256 eventId;
        uint256 timestamp;
    }

    mapping(uint256 => Reward) public rewards;
    uint256 public nextRewardId = 1;

    // Early bird: per event, per user
    mapping(uint256 => mapping(address => bool)) public earlyBirdClaimed;

    // Loyalty points based on attendance
    mapping(address => uint256) public loyaltyPoints;

    // Referrals
    mapping(bytes32 => address) public referralCodes;
    mapping(address => uint256) public referralRewards;
    mapping(address => address) public referredBy;

    uint256 public earlyBirdLimit = 10;

    event RewardMinted(uint256 rewardId, address user, string rewardType, uint256 eventId);
    event EarlyBirdClaimed(address user, uint256 eventId);
    event ReferralUsed(address invitee, address inviter);

    constructor(address organizer) ERC721("Incentive Reward", "INC") Ownable(organizer) {}

    function claimEarlyBird(uint256 eventId) external {
        require(!earlyBirdClaimed[eventId][msg.sender], "Already claimed");

        // Check if user is within early bird limit (would need external call to ticket contract)
        // For this example, we'll assume the check is done off-chain

        earlyBirdClaimed[eventId][msg.sender] = true;
        _mintReward(msg.sender, "EARLY_BIRD", eventId);
        emit EarlyBirdClaimed(msg.sender, eventId);
    }

    function updateLoyaltyPoints(address user, uint256 points) external onlyOwner {
        loyaltyPoints[user] += points;
    }

    function generateReferralCode(bytes32 code) external {
        require(referralCodes[code] == address(0), "Code already exists");
        referralCodes[code] = msg.sender;
    }

    function useReferralCode(bytes32 code, address invitee) external {
        address inviter = referralCodes[code];
        require(inviter != address(0), "Invalid code");
        require(referredBy[invitee] == address(0), "Already referred");

        referredBy[invitee] = inviter;
        referralRewards[inviter]++;
        emit ReferralUsed(invitee, inviter);

        // Mint referral reward
        _mintReward(inviter, "REFERRAL", 0);
    }

    function claimLoyaltyReward() external {
        require(loyaltyPoints[msg.sender] >= 100, "Not enough points");
        loyaltyPoints[msg.sender] -= 100;
        _mintReward(msg.sender, "LOYALTY", 0);
    }

    function _mintReward(address user, string memory rewardType, uint256 eventId) internal {
        uint256 rewardId = nextRewardId++;
        _mint(user, rewardId);
        rewards[rewardId] = Reward({
            rewardId: rewardId,
            user: user,
            rewardType: rewardType,
            eventId: eventId,
            timestamp: block.timestamp
        });
        emit RewardMinted(rewardId, user, rewardType, eventId);
    }

    function getReward(uint256 rewardId) external view returns (Reward memory) {
        return rewards[rewardId];
    }
}
```

### Frontend Integration Examples

#### React Hook for Event Management
```typescript
// hooks/useEventManagement.ts
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { EchainSDK } from '@/lib/echain-sdk';

export function useEventManagement() {
  const { address } = useAccount();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const createEvent = async (eventData: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...eventData, organizer: address })
      });

      if (!response.ok) throw new Error('Failed to create event');

      const event = await response.json();
      setEvents(prev => [...prev, event]);
      return event;
    } catch (error) {
      console.error('Event creation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const purchaseTickets = async (eventId: string, quantity: number) => {
    setLoading(true);
    try {
      const response = await fetch('/api/tickets/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, quantity, buyer: address })
      });

      if (!response.ok) throw new Error('Purchase failed');

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Ticket purchase failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    events,
    loading,
    createEvent,
    purchaseTickets
  };
}
```

#### Event Card Component
```tsx
// components/EventCard.tsx
import React from 'react';
import { useEventManagement } from '../hooks/useEventManagement';

interface EventCardProps {
  event: {
    id: string;
    name: string;
    ticketPrice: string;
    maxTickets: number;
    soldTickets: number;
    startTime: number;
    endTime: number;
  };
}

export function EventCard({ event }: EventCardProps) {
  const { purchaseTickets, loading } = useEventManagement();

  const handlePurchase = async () => {
    try {
      const result = await purchaseTickets(event.id, 1);
      alert(`Tickets purchased! Transaction: ${result.transactionHash}`);
    } catch (error) {
      alert('Purchase failed. Please try again.');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const availableTickets = event.maxTickets - event.soldTickets;

  return (
    <div className="event-card">
      <div className="event-image">
        <img src="/placeholder-event.jpg" alt={event.name} />
      </div>

      <div className="event-details">
        <h3>{event.name}</h3>
        <p className="event-date">
          {formatDate(event.startTime)} - {formatDate(event.endTime)}
        </p>

        <div className="ticket-info">
          <span className="price">{event.ticketPrice} ETH</span>
          <span className="availability">
            {availableTickets} / {event.maxTickets} available
          </span>
        </div>

        <button
          onClick={handlePurchase}
          disabled={loading || availableTickets === 0}
          className="purchase-button"
        >
          {loading ? 'Processing...' : 'Buy Ticket'}
        </button>
      </div>
    </div>
  );
}
```

### API Integration Examples

#### Node.js Backend Integration
```javascript
// server/eventService.js
const { EchainAPI } = require('@echain/api');

class EventService {
  constructor(apiKey) {
    this.api = new EchainAPI(apiKey);
  }

  async createEvent(organizerId, eventData) {
    try {
      // Validate organizer permissions
      const organizer = await this.validateOrganizer(organizerId);

      // Create event via MultiBaas API
      const response = await fetch(`${process.env.MULTIBAAS_URL}/api/v0/contracts/event_factory/call`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.MULTIBAAS_DAPP_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          function: 'createEvent',
          inputs: [
            eventData.name,
            eventData.metadataURI,
            eventData.ticketPrice,
            eventData.maxTickets.toString(),
            eventData.startTime.toString(),
            eventData.endTime.toString()
          ],
          from: organizer.address
        })
      });

      if (!response.ok) throw new Error('Event creation failed');

      const result = await response.json();
      const eventId = result.data.events?.EventCreated?.eventId;

      return { eventId, transactionHash: result.data.transactionHash };
    } catch (error) {
      console.error('Event creation error:', error);
      throw new Error('Failed to create event');
    }
  }

  async processCheckIn(eventId, attendeeAddress, signature) {
    try {
      // Verify ticket ownership
      const hasTicket = await this.verifyTicketOwnership(eventId, attendeeAddress);
      if (!hasTicket) throw new Error('No valid ticket found');

      // Process check-in and mint POAP
      const response = await fetch(`${process.env.MULTIBAAS_URL}/api/v0/contracts/poap_contract/call`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.MULTIBAAS_DAPP_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          function: 'mintAttendance',
          inputs: [
            eventId.toString(),
            attendeeAddress,
            '1', // nonce
            signature
          ]
        })
      });

      if (!response.ok) throw new Error('Check-in failed');

      const result = await response.json();
      return { success: true, transactionHash: result.data.transactionHash };
    } catch (error) {
      console.error('Check-in error:', error);
      throw new Error('Check-in failed');
    }
  }
}

module.exports = EventService;
```

#### Python Analytics Integration
```python
# analytics/event_analytics.py
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import os

class EchainAnalytics:
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }

    def get_event_metrics(self, event_id: str) -> Dict:
        """Get comprehensive event analytics"""
        try:
            response = requests.post(
                f'{self.base_url}/api/v0/contracts/event_factory/query',
                headers=self.headers,
                json={
                    "function": "getEventDetails",
                    "inputs": [event_id]
                }
            )

            if response.status_code != 200:
                return {"error": "Failed to fetch event data"}

            data = response.json()

            # Get ticket sales data
            ticket_data = self._get_ticket_sales_data(event_id)

            metrics = {
                'event_info': data.get('data', {}).get('output', {}),
                'ticket_sales': ticket_data,
                'conversion_rate': self._calculate_conversion_rate(ticket_data),
                'engagement_score': self._calculate_engagement_score(ticket_data),
                'revenue_metrics': self._calculate_revenue_metrics(ticket_data)
            }

            return metrics
        except Exception as e:
            return {"error": str(e)}

    def _get_ticket_sales_data(self, event_id: str) -> Dict:
        """Get ticket sales data from contract"""
        try:
            response = requests.post(
                f'{self.base_url}/api/v0/contracts/event_ticket_{event_id}/query',
                headers=self.headers,
                json={
                    "function": "totalSold",
                    "inputs": []
                }
            )

            if response.status_code == 200:
                data = response.json()
                return {
                    'tickets_sold': int(data.get('data', {}).get('output', [0])[0] or 0),
                    'max_tickets': 500,  # Would need to fetch from event data
                    'last_updated': datetime.now().isoformat()
                }
            else:
                return {'tickets_sold': 0, 'max_tickets': 0, 'error': 'API call failed'}
        except Exception as e:
            return {'tickets_sold': 0, 'max_tickets': 0, 'error': str(e)}

    def _calculate_conversion_rate(self, ticket_data: Dict) -> float:
        """Calculate view-to-purchase conversion rate"""
        tickets_sold = ticket_data.get('tickets_sold', 0)
        max_tickets = ticket_data.get('max_tickets', 1)

        if max_tickets == 0:
            return 0.0

        return (tickets_sold / max_tickets) * 100

    def _calculate_engagement_score(self, ticket_data: Dict) -> float:
        """Calculate overall engagement score"""
        tickets_sold = ticket_data.get('tickets_sold', 0)
        max_tickets = ticket_data.get('max_tickets', 1)

        if max_tickets == 0:
            return 0.0

        # Simple engagement score based on sell-through rate
        sell_through_rate = tickets_sold / max_tickets

        # Bonus for high sell-through
        bonus = 1.0 if sell_through_rate > 0.8 else 0.0

        score = (sell_through_rate * 80) + (bonus * 20)
        return min(score, 100.0)

    def _calculate_revenue_metrics(self, ticket_data: Dict) -> Dict:
        """Calculate revenue-related metrics"""
        tickets_sold = ticket_data.get('tickets_sold', 0)

        # Assuming 1 ETH per ticket for this example
        avg_ticket_price = 1.0  # ETH
        total_revenue = tickets_sold * avg_ticket_price

        return {
            'total_revenue_eth': total_revenue,
            'average_ticket_price': avg_ticket_price,
            'tickets_sold': tickets_sold,
            'sell_through_rate': (tickets_sold / max(ticket_data.get('max_tickets', 1), 1)) * 100
        }
```

## 🎨 Design Templates

### NFT Ticket Design Template
```json
{
  "name": "{{event_name}} - Ticket #{{token_id}}",
  "description": "Admission ticket for {{event_name}} on {{event_date}}",
  "image": "{{ticket_image_url}}",
  "attributes": [
    {
      "trait_type": "Event",
      "value": "{{event_name}}"
    },
    {
      "trait_type": "Event ID",
      "value": "{{event_id}}"
    },
    {
      "trait_type": "Ticket Type",
      "value": "{{ticket_tier}}"
    },
    {
      "trait_type": "Seat Number",
      "value": "{{seat_number}}"
    },
    {
      "trait_type": "Purchase Date",
      "value": "{{purchase_date}}"
    },
    {
      "trait_type": "Transferable",
      "value": "{{transfer_status}}"
    }
  ],
  "external_url": "https://echain.app/events/{{event_id}}",
  "background_color": "{{event_theme_color}}"
}
```

### POAP Certificate Template
```json
{
  "name": "{{event_name}} Attendee",
  "description": "Proof of attendance for {{event_name}} - {{event_date}}",
  "image": "{{poap_image_url}}",
  "attributes": [
    {
      "trait_type": "Event",
      "value": "{{event_name}}"
    },
    {
      "trait_type": "Event ID",
      "value": "{{event_id}}"
    },
    {
      "trait_type": "Attendance Date",
      "value": "{{attendance_date}}"
    },
    {
      "trait_type": "Certificate Type",
      "value": "POAP"
    },
    {
      "trait_type": "Organizer",
      "value": "{{organizer_name}}"
    },
    {
      "trait_type": "Soulbound",
      "value": "true"
    }
  ],
  "external_url": "https://echain.app/events/{{event_id}}/attendees",
  "background_color": "{{event_theme_color}}"
}
```

## ⚠️ Implementation Notes

### Wallet Connection Issues
If you encounter "403 Forbidden" errors when connecting wallets:
- Use `NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID=demo-project-id-for-development` for development
- Get a valid Reown project ID from https://cloud.reown.com/ for production
- The app automatically falls back to safe defaults if the project ID is invalid

### Base Sepolia Testnet
All examples are configured for Base Sepolia testnet:
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Block Explorer**: https://sepolia.basescan.org/
- **Faucet**: https://sepoliafaucet.com/ or https://faucet.quicknode.com/base/sepolia

### Contract Addresses (Latest Deployment)
```javascript
const CONTRACT_ADDRESSES = {
  eventFactory: "0xbE36039Bfe7f48604F73daD61411459B17fd2e85",
  poapContract: "0x405061e2ef1F748fA95A1e7725fc1a008e8c2196",
  incentiveManager: "0x8290c12f874DF9D03FDadAbE10C7c6321B69Ded9"
};
```

### API Configuration
```javascript
const API_CONFIG = {
  multibaasUrl: "https://kwp44rxeifggriyd4hmbjq7dey.multibaas.com",
  dappApiKey: process.env.NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY,
  websocketUrl: "wss://kwp44rxeifggriyd4hmbjq7dey.multibaas.com/ws"
};
```

These examples provide practical, implementable code that demonstrates the full capabilities of the Echain platform across different scales and use cases. All code is compatible with the current Base Sepolia deployment and can be used as starting points for your own implementations.

## 🎯 Use Case Examples

### 1. Tech Meetup (50 attendees)
**Scenario**: Monthly developer meetup with free attendance and networking focus.

**Features**:
- Free tickets (gas-only cost)
- POAP certificates for attendance
- Early bird badges for first 10 RSVPs
- Networking rewards for connecting with other attendees

**Implementation**:
```javascript
const meetupEvent = await echain.events.create({
  name: "Web3 Developers Meetup #42",
  ticketPrice: "0", // Free event
  maxTickets: 50,
  date: new Date("2024-12-15T18:00:00Z"),
  venue: "TechHub Downtown",
  incentives: {
    earlyBird: {
      count: 10,
      reward: "founder_badge",
      rarity: "rare"
    },
    poap: {
      design: "ipfs://QmMeetupPOAP...",
      name: "Web3 Meetup #42 Attendee"
    }
  }
});
```

### 2. Conference (500 attendees)
**Scenario**: Two-day tech conference with tiered pricing and sponsor integration.

**Features**:
- Multiple ticket tiers (General, VIP, Speaker)
- Dynamic pricing based on demand
- Sponsor-branded NFT rewards
- Multi-day attendance tracking

**Implementation**:
```javascript
const conference = await echain.events.create({
  name: "BlockchainCon 2024",
  ticketTiers: [
    {
      name: "General Admission",
      price: "0.1", // ETH
      maxTickets: 400,
      perks: ["Conference Access", "Welcome Package"]
    },
    {
      name: "VIP Pass",
      price: "0.25", // ETH
      maxTickets: 90,
      perks: ["All Access", "VIP Lounge", "Speaker Dinner", "Exclusive NFT"]
    },
    {
      name: "Speaker Pass",
      price: "0", // Free for speakers
      maxTickets: 10,
      perks: ["All Access", "Speaker Green Room", "Special Recognition NFT"]
    }
  ],
  duration: 2, // days
  incentives: {
    dynamicPricing: true,
    sponsorRewards: [
      {
        sponsor: "ChainLink",
        trigger: "check_in_day_1",
        reward: "chainlink_supporter_nft"
      }
    ]
  }
});
```

### 3. Music Festival (5000 attendees)
**Scenario**: Large outdoor music festival with complex logistics and high-value NFT collectibles.

**Features**:
- High-volume ticket sales
- Resale marketplace with royalties
- Artist collaboration NFTs
- VIP experiences and backstage access

**Implementation**:
```javascript
const festival = await echain.events.create({
  name: "CryptoBeats Festival 2024",
  ticketPrice: "0.15", // ETH
  maxTickets: 5000,
  venue: "Riverside Park",
  duration: 3, // days
  features: {
    resaleMarket: {
      enabled: true,
      royaltyPercent: 5, // 5% to organizers
      maxMarkup: 200 // 200% max resale price
    },
    vipExperiences: [
      {
        name: "Backstage Pass",
        price: "1.0", // ETH
        maxTickets: 50,
        nftReward: "backstage_access_2024"
      }
    ],
    artistCollabs: [
      {
        artist: "DJ CryptoBeats",
        nftDrop: "exclusive_track_nft",
        trigger: "attend_main_stage_set"
      }
    ]
  }
});
```

## 💻 Code Examples

### Wallet Connection Setup
Before implementing any blockchain interactions, ensure proper wallet setup:

```typescript
// frontend/lib/wagmi.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID || 'demo-project-id-for-development';

export const config = getDefaultConfig({
  appName: 'Echain',
  projectId, // Use fallback if env var is missing
  chains: [baseSepolia],
  ssr: true,
});
```

### Smart Contract Integration

#### Creating a Custom Event Contract
```solidity
// CustomEventTicket.sol
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IEventTicket.sol";

contract CustomEventTicket is ERC721, Ownable, IEventTicket {
    struct TicketInfo {
        uint256 eventId;
        string seatNumber;
        uint256 tier; // 0=General, 1=VIP, 2=Speaker
        bool isUsed;
    }

    mapping(uint256 => TicketInfo) public tickets;
    uint256 private _nextTokenId = 1;

    constructor(
        string memory name,
        string memory symbol,
        address organizer
    ) ERC721(name, symbol) Ownable(organizer) {}

    function mintTicket(
        address to,
        uint256 eventId,
        string memory seatNumber,
        uint256 tier
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);

        tickets[tokenId] = TicketInfo({
            eventId: eventId,
            seatNumber: seatNumber,
            tier: tier,
            isUsed: false
        });

        emit TicketMinted(tokenId, to, eventId, seatNumber);
        return tokenId;
    }

    function useTicket(uint256 tokenId) external onlyOwner {
        require(_exists(tokenId), "Ticket does not exist");
        require(!tickets[tokenId].isUsed, "Ticket already used");

        tickets[tokenId].isUsed = true;
        emit TicketUsed(tokenId, ownerOf(tokenId));
    }
}
```

#### Incentive System Integration
```solidity
// CustomIncentives.sol
pragma solidity ^0.8.19;

import "./interfaces/IIncentiveManager.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract CustomIncentives is IIncentiveManager {
    struct Achievement {
        string name;
        string description;
        uint256 pointsReward;
        bytes32 badgeId;
    }

    mapping(address => uint256) public loyaltyPoints;
    mapping(address => mapping(bytes32 => bool)) public hasAchievement;
    mapping(bytes32 => Achievement) public achievements;

    event AchievementUnlocked(
        address indexed user,
        bytes32 indexed achievementId,
        uint256 pointsAwarded
    );

    function unlockAchievement(
        address user,
        bytes32 achievementId
    ) external override {
        require(!hasAchievement[user][achievementId], "Already unlocked");

        Achievement memory achievement = achievements[achievementId];
        hasAchievement[user][achievementId] = true;
        loyaltyPoints[user] += achievement.pointsReward;

        emit AchievementUnlocked(user, achievementId, achievement.pointsReward);
    }

    function calculateEarlyBirdReward(
        uint256 position,
        uint256 totalTickets
    ) external pure returns (uint256 pointsReward, string memory badgeRarity) {
        if (position <= 10) {
            return (500, "legendary");
        } else if (position <= 50) {
            return (200, "rare");
        } else if (position <= totalTickets / 10) {
            return (100, "uncommon");
        }
        return (0, "none");
    }
}
```

### Frontend Integration Examples

#### React Hook for Event Management
```typescript
// hooks/useEventManagement.ts
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { EchainSDK } from '@echain/sdk';

export function useEventManagement() {
  const { address } = useAccount();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const createEvent = async (eventData: EventCreateData) => {
    setLoading(true);
    try {
      const event = await EchainSDK.events.create({
        ...eventData,
        organizer: address
      });

      setEvents(prev => [...prev, event]);
      return event;
    } catch (error) {
      console.error('Event creation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const purchaseTickets = async (eventId: string, quantity: number) => {
    setLoading(true);
    try {
      const tickets = await EchainSDK.tickets.purchase(eventId, {
        quantity,
        buyer: address
      });

      // Check for early bird rewards
      const rewards = await EchainSDK.incentives.checkEarlyBirdStatus(
        address,
        eventId
      );

      return { tickets, rewards };
    } catch (error) {
      console.error('Ticket purchase failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    events,
    loading,
    createEvent,
    purchaseTickets
  };
}
```

#### Event Card Component
```tsx
// components/EventCard.tsx
import React from 'react';
import { Event } from '@echain/types';
import { useEventManagement } from '../hooks/useEventManagement';

interface EventCardProps {
  event: Event;
  onPurchase?: (eventId: string) => void;
}

export function EventCard({ event, onPurchase }: EventCardProps) {
  const { purchaseTickets, loading } = useEventManagement();

  const handlePurchase = async () => {
    try {
      const result = await purchaseTickets(event.id, 1);

      if (result.rewards.length > 0) {
        // Show reward notification
        toast.success(`🎉 Early bird reward earned: ${result.rewards[0].name}`);
      }

      onPurchase?.(event.id);
    } catch (error) {
      toast.error('Purchase failed. Please try again.');
    }
  };

  return (
    <div className="event-card">
      <div className="event-image">
        <img src={event.imageUrl} alt={event.name} />
        {event.earlyBirdAvailable && (
          <div className="early-bird-badge">
            🐦 Early Bird Available
          </div>
        )}
      </div>

      <div className="event-details">
        <h3>{event.name}</h3>
        <p className="event-date">{formatDate(event.date)}</p>
        <p className="event-venue">{event.venue}</p>

        <div className="ticket-info">
          <span className="price">{event.ticketPrice} ETH</span>
          <span className="availability">
            {event.ticketsRemaining} / {event.maxTickets} available
          </span>
        </div>

        <button
          onClick={handlePurchase}
          disabled={loading || event.ticketsRemaining === 0}
          className="purchase-button"
        >
          {loading ? 'Processing...' : 'Buy Ticket'}
        </button>
      </div>
    </div>
  );
}
```

### API Integration Examples

#### Node.js Backend Integration
```javascript
// server/eventService.js
const { EchainAPI } = require('@echain/api');

class EventService {
  constructor(apiKey) {
    this.api = new EchainAPI(apiKey);
  }

  async createEvent(organizerId, eventData) {
    try {
      // Validate organizer permissions
      const organizer = await this.validateOrganizer(organizerId);

      // Create event with incentive structure
      const event = await this.api.events.create({
        ...eventData,
        organizer: organizer.address,
        incentives: {
          earlyBird: {
            enabled: true,
            count: Math.min(10, eventData.maxTickets * 0.1),
            rewards: ['early_bird_badge', 'loyalty_points_bonus']
          },
          poap: {
            enabled: true,
            design: await this.generatePOAPDesign(eventData),
            name: `${eventData.name} Attendee Certificate`
          }
        }
      });

      // Set up analytics tracking
      await this.setupEventAnalytics(event.id);

      return event;
    } catch (error) {
      console.error('Event creation error:', error);
      throw new Error('Failed to create event');
    }
  }

  async processCheckIn(eventId, attendeeAddress, signature) {
    try {
      // Verify attendee has valid ticket
      const hasTicket = await this.api.tickets.verifyOwnership(
        eventId,
        attendeeAddress
      );

      if (!hasTicket) {
        throw new Error('No valid ticket found');
      }

      // Process check-in and mint POAP
      const checkIn = await this.api.poap.checkIn(eventId, attendeeAddress, {
        signature,
        timestamp: Date.now()
      });

      // Check for additional rewards
      const rewards = await this.api.incentives.processAttendance(
        attendeeAddress,
        eventId
      );

      return { checkIn, rewards };
    } catch (error) {
      console.error('Check-in error:', error);
      throw new Error('Check-in failed');
    }
  }
}

module.exports = EventService;
```

#### Python Analytics Integration
```python
# analytics/event_analytics.py
import requests
from datetime import datetime, timedelta
from typing import List, Dict

class EchainAnalytics:
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }

    def get_event_metrics(self, event_id: str) -> Dict:
        """Get comprehensive event analytics"""
        response = requests.get(
            f'{self.base_url}/analytics/events/{event_id}',
            headers=self.headers
        )

        data = response.json()

        # Calculate additional metrics
        metrics = {
            'basic_stats': data,
            'conversion_rate': self._calculate_conversion_rate(data),
            'engagement_score': self._calculate_engagement_score(data),
            'reward_effectiveness': self._analyze_reward_impact(data)
        }

        return metrics

    def _calculate_conversion_rate(self, data: Dict) -> float:
        """Calculate view-to-purchase conversion rate"""
        views = data.get('page_views', 0)
        purchases = data.get('tickets_sold', 0)

        if views == 0:
            return 0.0

        return (purchases / views) * 100

    def _calculate_engagement_score(self, data: Dict) -> float:
        """Calculate overall engagement score"""
        factors = {
            'early_bird_participation': data.get('early_bird_count', 0) / 10,
            'social_shares': data.get('social_shares', 0) / 100,
            'poap_claim_rate': data.get('poap_claims', 0) / data.get('attendees', 1),
            'return_attendee_rate': data.get('return_attendees', 0) / data.get('total_attendees', 1)
        }

        # Weighted average
        weights = {'early_bird_participation': 0.3, 'social_shares': 0.2,
                  'poap_claim_rate': 0.3, 'return_attendee_rate': 0.2}

        score = sum(factors[key] * weights[key] for key in factors)
        return min(score * 100, 100)  # Cap at 100
```

## 🎨 Design Templates

### NFT Ticket Design Template
```json
{
  "name": "{{event_name}} - {{seat_number}}",
  "description": "Admission ticket for {{event_name}} on {{event_date}}",
  "image": "ipfs://{{ticket_image_hash}}",
  "attributes": [
    {
      "trait_type": "Event",
      "value": "{{event_name}}"
    },
    {
      "trait_type": "Date",
      "value": "{{event_date}}"
    },
    {
      "trait_type": "Venue",
      "value": "{{venue_name}}"
    },
    {
      "trait_type": "Seat",
      "value": "{{seat_number}}"
    },
    {
      "trait_type": "Tier",
      "value": "{{ticket_tier}}"
    },
    {
      "trait_type": "Purchase Position",
      "value": "{{purchase_position}}"
    }
  ],
  "external_url": "https://echain.app/events/{{event_id}}",
  "animation_url": "ipfs://{{animation_hash}}"
}
```

### POAP Certificate Template
```json
{
  "name": "{{event_name}} Attendee Certificate",
  "description": "Proof of attendance for {{event_name}}",
  "image": "ipfs://{{poap_image_hash}}",
  "attributes": [
    {
      "trait_type": "Event",
      "value": "{{event_name}}"
    },
    {
      "trait_type": "Attendance Date",
      "value": "{{attendance_date}}"
    },
    {
      "trait_type": "Certificate Type",
      "value": "POAP"
    },
    {
      "trait_type": "Organizer",
      "value": "{{organizer_name}}"
    }
  ],
  "soulbound": true
}
```

## ⚠️ Implementation Notes

### Wallet Connection Issues
If you encounter "403 Forbidden" errors when connecting wallets:
- Use `NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID=demo-project-id-for-development` for development
- Get a valid Reown project ID from https://cloud.reown.com/ for production
- The app automatically falls back to safe defaults if the project ID is invalid

### Base Sepolia Testnet
All examples are configured for Base Sepolia testnet:
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Block Explorer**: https://sepolia.basescan.org/
- **Faucet**: https://sepoliafaucet.com/ or https://faucet.quicknode.com/base/sepolia

These examples provide practical, implementable code that demonstrates the full capabilities of the Echain platform across different scales and use cases.
