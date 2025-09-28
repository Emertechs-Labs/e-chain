# 💡 Echain Examples & Use Cases

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
