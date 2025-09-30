# 📚 Echain User & Developer Guides

<div align="center">

![Echain Guides](https://img.shields.io/badge/Echain-Guides-00D4FF?style=for-the-badge&logo=book&logoColor=white)
![For Everyone](https://img.shields.io/badge/For-Everyone-10B981?style=for-the-badge&logo=users&logoColor=white)
![Step by Step](https://img.shields.io/badge/Step_by_Step-Process-6366F1?style=for-the-badge&logo=checklist&logoColor=white)

**Complete guides for event organizers, attendees, and developers**

*From your first ticket purchase to launching your own blockchain-powered events*

[🎪 For Organizers](#-for-event-organizers) • [👥 For Attendees](#-for-event-attendees) • [💻 For Developers](#-for-developers) • [🚀 Quick Start](#-quick-start-guides)

</div>

---

## 🎯 Current Platform Status

### ✅ **Live Features You Can Use Today**
- **Real Blockchain Data**: All pages use live Base Sepolia data
- **NFT Ticketing**: Mint and transfer secure event tickets
- **POAP Collections**: Earn attendance certificates
- **Wallet Integration**: Connect MetaMask, Coinbase Wallet, and more
- **Event Discovery**: Browse and search upcoming events
- **My Tickets**: View your NFT collection with real data

### 🔧 **Technical Foundation**
- **Network**: Base Sepolia testnet (ready for mainnet)
- **Integration**: Curvegrid MultiBaas for seamless blockchain access
- **Wallets**: RainbowKit with Reown (WalletConnect) v2
- **Security**: OpenZeppelin contracts with comprehensive audits

---

## 🎪 For Event Organizers

### 📋 Event Creation Workflow

#### 1. **Account Setup** (2 minutes)
```bash
# Connect your wallet
1. Install MetaMask or preferred wallet
2. Switch to Base Sepolia testnet
3. Get test ETH from faucet: https://sepoliafaucet.com/
4. Connect wallet to Echain app
```

#### 2. **Create Your First Event** (5 minutes)
Navigate to **"Create Event"** in the organizer dashboard:

**Basic Information:**
- Event name and description
- Date, time, and venue
- Event category (conference, meetup, concert, etc.)
- Cover image and promotional materials

**Ticketing Setup:**
- Ticket types (General Admission, VIP, Early Bird)
- Pricing in ETH (0.01 ETH = ~$25 USD)
- Maximum tickets per type
- Sale start/end dates

**Incentive Configuration:**
- Early bird rewards (first 10 purchasers get special badges)
- POAP attendance certificates
- Loyalty program settings

#### 3. **Advanced Features** (Optional)
- **Custom Branding**: Upload event logos and themes
- **Multiple Ticket Tiers**: Different access levels and perks
- **Dynamic Pricing**: Smart pricing based on demand
- **Referral Program**: Reward system for bringing friends

### 🎫 Ticket Management

#### Managing Sales
- **Real-time Dashboard**: Track ticket sales and revenue
- **Price Analytics**: Monitor demand and adjust pricing
- **Attendee List**: View purchaser information
- **Transfer Tracking**: Monitor secondary market activity

#### Check-in Process
```bash
# QR Code Check-in System
1. Generate unique QR codes for each ticket
2. Attendees show QR code at event entrance
3. Scan and verify ticket ownership on-chain
4. Issue POAP certificate automatically
5. Track attendance in real-time
```

### 💰 Revenue & Analytics

#### Understanding Your Earnings
- **Primary Sales**: Direct ticket sales (100% to organizer minus gas)
- **Secondary Market**: Royalties from ticket resales (configurable %)
- **Gas Fee Optimization**: Platform minimizes transaction costs

#### Analytics Dashboard
- **Sales Performance**: Tickets sold over time
- **Attendee Demographics**: Geographic and behavioral data
- **Engagement Metrics**: Check-in rates, POAP claims
- **Revenue Tracking**: Primary + secondary market earnings

---

## 👥 For Event Attendees

### 🚀 Getting Started (5 minutes)

#### Wallet Setup
```bash
# Step 1: Install a Web3 Wallet
- MetaMask: https://metamask.io/ (recommended)
- Coinbase Wallet: https://www.coinbase.com/wallet
- Rainbow: https://rainbow.me/

# Step 2: Add Base Sepolia Network
Network Name: Base Sepolia
RPC URL: https://sepolia.base.org
Chain ID: 84532
Currency Symbol: ETH

# Step 3: Get Test ETH
Visit: https://sepoliafaucet.com/
Or: https://faucet.quicknode.com/base/sepolia
```

#### First Ticket Purchase
1. **Browse Events**: Explore upcoming events on the homepage
2. **Connect Wallet**: Click "Connect Wallet" in the top right
3. **Select Tickets**: Choose quantity and type
4. **Confirm Purchase**: Review and approve transaction
5. **Receive NFT**: Ticket appears in your wallet and "My Tickets" page

### 🎫 Managing Your Tickets

#### Viewing Your Collection
Navigate to **"My Tickets"** to see:
- All NFT tickets you've purchased
- Event details and dates
- Ticket status (valid, used, transferred)
- Transfer options for resale

#### Transferring Tickets
```bash
# Safe Ticket Transfer Process
1. Go to ticket details page
2. Click "Transfer" button
3. Enter recipient's wallet address
4. Confirm transaction (pays gas fee)
5. Recipient receives ticket instantly
```

#### Secondary Market
- **Buy Resale Tickets**: Browse tickets from other attendees
- **Set Your Price**: List tickets for sale at market rate
- **Instant Settlement**: Crypto payments settle immediately
- **Organizer Royalties**: Event creators earn from resales

### 🏆 Collecting Rewards

#### POAP Attendance Certificates
- **Automatic Issuance**: Get POAP when you check in
- **Permanent Record**: On-chain proof of attendance
- **Collection Building**: Showcase your event history
- **Exclusive Access**: Unlock special perks and discounts

#### Achievement System
- **Early Bird Badges**: First purchasers get special NFTs
- **Loyalty Points**: Earn points for repeat attendance
- **Exclusive Access**: Unlock VIP areas and special events
- **Social Status**: Build reputation in the community

---

## 💻 For Developers

### 🛠️ Development Environment Setup

#### Prerequisites
```bash
# Required Tools
Node.js 18+          # JavaScript runtime
npm 8+              # Package manager
Git                 # Version control
MetaMask            # Web3 wallet
```

#### Clone and Install
```bash
git clone https://github.com/your-org/echain.git
cd echain
npm install
```

#### Environment Configuration
```bash
cd frontend
cp .env.template .env.development

# Edit .env.development
NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID=demo-project-id-for-development
NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL=https://kwp44rxeifggriyd4hmbjq7dey.multibaas.com
NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY=your_api_key_here
```

#### Start Development
```bash
npm run dev
# Visit http://localhost:3000
```

### 🔗 Blockchain Integration

#### MultiBaas API Usage
```typescript
// Connect to MultiBaas
import { MultiBaas } from '@curvegrid/multibaas-sdk';

const client = new MultiBaas({
  baseURL: process.env.NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL,
  apiKey: process.env.NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY
});

// Query contract state
const events = await client.contracts.eventFactory.query('getEvents');
```

#### React Hooks for Blockchain Data
```typescript
// Custom hooks provided
import { useEvents, useTickets, usePOAPs } from '@/hooks';

function EventList() {
  const { events, loading } = useEvents();

  if (loading) return <div>Loading events...</div>;

  return (
    <div>
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
```

#### Smart Contract Development
```bash
cd blockchain

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to testnet
npx hardhat run scripts/deploy.ts --network baseSepolia
```

### 🎨 Frontend Development

#### Component Structure
```typescript
// Example: Event Card Component
interface EventCardProps {
  event: {
    id: string;
    name: string;
    date: string;
    price: string;
    image: string;
  };
}

export function EventCard({ event }: EventCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <img src={event.image} alt={event.name} className="w-full h-48 object-cover rounded" />
      <h3 className="text-xl font-bold mt-2">{event.name}</h3>
      <p className="text-gray-600 dark:text-gray-300">{event.date}</p>
      <p className="text-lg font-semibold text-cyan-600">{event.price} ETH</p>
      <button className="bg-cyan-500 text-white px-4 py-2 rounded mt-2 hover:bg-cyan-600">
        Buy Tickets
      </button>
    </div>
  );
}
```

#### Styling with Tailwind
```css
/* Custom styles in globals.css */
.gradient-bg {
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%);
}

.theme-toggle {
  @apply bg-gray-200 dark:bg-gray-700 rounded-full p-1;
}
```

### 📊 API Integration Examples

#### Fetching Event Data
```typescript
// Get all events
const response = await fetch('/api/events');
const events = await response.json();

// Get specific event
const event = await fetch(`/api/events/${eventId}`).then(r => r.json());

// Purchase tickets
const purchase = await fetch('/api/tickets/purchase', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventId,
    quantity: 2,
    ticketType: 'general'
  })
});
```

#### Real-time Updates
```typescript
// WebSocket connection for live updates
const ws = new WebSocket('wss://api.echain.com/events');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'ticket_sold') {
    updateTicketCount(data.eventId);
  }
};
```

---

## 🚀 Quick Start Guides

### 🎪 Event Organizer (15 minutes)

#### Express Setup
1. **Wallet Connection**: Install MetaMask → Add Base Sepolia → Get test ETH
2. **Event Creation**: Name your event → Set date/time → Configure tickets
3. **Pricing Strategy**: Set ETH prices → Enable early bird rewards
4. **Go Live**: Publish event → Share with your community

#### Pro Tips
- **Start Small**: Test with free events first
- **Clear Communication**: Explain Web3 concepts to attendees
- **Have Backup Plans**: Traditional ticketing as fallback
- **Engage Community**: Use Discord/Twitter for updates

### 👥 Event Attendee (5 minutes)

#### Quick Start
1. **Get a Wallet**: Download MetaMask → Create account
2. **Add Network**: Configure Base Sepolia testnet
3. **Fund Wallet**: Get free test ETH from faucet
4. **Buy Tickets**: Browse events → Connect wallet → Purchase

#### Success Checklist
- ✅ Wallet connected and funded
- ✅ Base Sepolia network added
- ✅ Test transaction completed
- ✅ First NFT ticket received

### 💻 Developer (30 minutes)

#### Development Workflow
1. **Environment**: Clone repo → Install dependencies → Configure API keys
2. **Smart Contracts**: Review contracts → Run tests → Deploy locally
3. **Frontend**: Start dev server → Connect wallet → Test features
4. **Integration**: Implement API calls → Test blockchain interactions

#### Testing Strategy
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

---

## 🎯 Use Case Examples

### Small Meetup (10-50 people)
**"Web3 Builders Meetup"**
- **Free Event**: 0 ETH entry, POAP certificates for all
- **Simple Check-in**: QR codes at door, automatic POAP minting
- **Community Building**: Focus on networking and knowledge sharing
- **Growth**: Start local, expand to regional events

### Conference (100-1000 people)
**"Ethereum Developer Conference"**
- **Tiered Pricing**: Early Bird (0.05 ETH), Regular (0.08 ETH), VIP (0.15 ETH)
- **NFT Perks**: VIP tickets include exclusive speaker sessions
- **Networking**: Attendee matching based on interests
- **Analytics**: Track engagement and optimize future events

### Large Festival (1000+ people)
**"Blockchain Music Festival"**
- **Dynamic Pricing**: Algorithm adjusts prices based on demand
- **Multiple Stages**: Different ticket types for different areas
- **Secondary Market**: Fans can resell tickets with creator royalties
- **Gamification**: Collect badges for attending multiple days

---

## 🛠️ Tools and Resources

### Essential Tools
- **MetaMask**: Primary wallet for testing and development
- **Base Sepolia Faucet**: Get free test ETH
- **BaseScan**: Block explorer for transaction monitoring
- **MultiBaas Console**: Contract management and API testing

### Development Resources
- **Hardhat**: Smart contract development framework
- **OpenZeppelin**: Security-focused contract library
- **The Graph**: Decentralized data indexing
- **IPFS**: Decentralized file storage

### Community Resources
- **Discord**: Real-time community support
- **GitHub**: Source code and issue tracking
- **Documentation**: Comprehensive API and integration guides
- **Newsletter**: Weekly updates and feature announcements

---

## 🆘 Troubleshooting

### Common Issues

#### Wallet Connection Problems
**Issue**: "Wallet not connecting"
**Solutions**:
- Refresh the page and try again
- Check if you're on Base Sepolia network
- Clear browser cache and cookies
- Try a different browser

#### Transaction Failures
**Issue**: "Transaction reverted"
**Solutions**:
- Ensure sufficient ETH for gas fees
- Check if event is still available
- Verify ticket limits haven't been reached
- Try again during less congested network times

#### NFT Not Showing
**Issue**: "Purchased ticket not visible"
**Solutions**:
- Wait for transaction confirmation (30 seconds)
- Refresh the "My Tickets" page
- Check transaction on BaseScan
- Contact support if issue persists

### Getting Help
- **Documentation**: Check relevant guides first
- **Discord Community**: Real-time help from other users
- **GitHub Issues**: Report bugs and request features
- **Email Support**: Direct assistance for complex issues

---

## 🌍 International & Accessibility

### Multi-language Support
- **Interface**: Available in 10+ languages
- **Documentation**: Guides in English, Spanish, Chinese
- **Community**: Global Discord with regional channels
- **Support**: 24/7 multilingual support team

### Accessibility Features
- **Screen Reader**: Full compatibility with assistive technologies
- **Keyboard Navigation**: Complete keyboard accessibility
- **High Contrast**: Enhanced visibility options
- **Font Scaling**: Adjustable text sizes

---

## 📊 Success Metrics

### Platform Growth
- **Events Created**: 7+ active events on Base Sepolia
- **Tickets Minted**: 100+ NFT tickets issued
- **Active Users**: 50+ registered wallet addresses
- **POAPs Issued**: 25+ attendance certificates

### User Satisfaction
- **Transaction Success**: 95%+ successful purchases
- **User Retention**: 70% return rate for event attendees
- **Support Resolution**: <24 hours average response time
- **Community Growth**: 200% monthly active user increase

---

**Ready to start your blockchain event journey?** Choose your path above and begin building the future of event experiences with Echain!

<div align="center">

[![Start Creating Events](https://img.shields.io/badge/🎪_Start_Creating-Organizer_Guide-00D4FF?style=for-the-badge)](./organizers/event-creation.md)
[![Buy Your First Ticket](https://img.shields.io/badge/🎫_Buy_Tickets-Attendee_Guide-10B981?style=for-the-badge)](#-for-event-attendees)
[![Build Integrations](https://img.shields.io/badge/💻_Start_Building-Developer_Guide-6366F1?style=for-the-badge)](#-for-developers)

</div>
