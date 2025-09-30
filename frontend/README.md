# Echain Event Ticketing Platform - Frontend

A blockchain-powered event ticketing platform built with Next.js, featuring NFT tickets and POAP rewards.

## Features

- 🎫 **NFT Event Tickets** - Blockchain-based ticketing system
- 🎭 **POAP Rewards** - Proof of Attendance Protocol integration
- 🌐 **Multi-Chain Support** - Base Sepolia testnet integration
- 📱 **Responsive Design** - Mobile-first approach with Tailwind CSS
- 🔐 **Wallet Integration** - RainbowKit + Wagmi for seamless wallet connection
- 📊 **Real-time Analytics** - Event tracking and user engagement
- 🗄️ **Scalable Storage** - Vercel Postgres, Blob, and Edge Config

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- MetaMask or compatible Web3 wallet

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Talent-Index/Echain.git
   cd Echain/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## Environment Configuration

### Required Environment Variables

```bash
# Wallet Configuration
NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID=your_reown_project_id_here

# MultiBaas Configuration
NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL=https://your-deployment.multibaas.com
NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY=your_dapp_user_api_key
NEXT_PUBLIC_MULTIBAAS_WEB3_API_KEY=your_web3_api_key
NEXT_PUBLIC_MULTIBAAS_CHAIN_ID=84532

# Contract Addresses (Base Sepolia)
NEXT_PUBLIC_EVENT_FACTORY_ADDRESS=0xbE36039Bfe7f48604F73daD61411459B17fd2e85
NEXT_PUBLIC_EVENT_TICKET_ADDRESS=0x127b53D8f29DcDe4DDfcCb24ad8b88B515D08180
NEXT_PUBLIC_POAP_ADDRESS=0x405061e2ef1F748fA95A1e7725fc1a008e2196
NEXT_PUBLIC_INCENTIVE_ADDRESS=0x8290c12f874DF9D03FDadAbE10C7c6321B69Ded9

# Vercel Storage Services
POSTGRES_URL=postgresql://...
BLOB_READ_WRITE_TOKEN=vercel_blob_...
EDGE_CONFIG=https://edge-config.vercel.com/...
```

## Vercel Storage Services Setup

This project uses Vercel's storage services for optimal performance and scalability:

### 1. Vercel Postgres (Database)
- **Purpose**: Store relational data like events, users, and transactions
- **Setup**:
  1. Go to Vercel Dashboard → Your Project → Storage
  2. Create a new Postgres database
  3. Copy the connection string to `POSTGRES_URL` in your environment variables

### 2. Vercel Blob (Object Storage)
- **Purpose**: Store images, documents, and other files
- **Setup**:
  1. Go to Vercel Dashboard → Your Project → Storage
  2. Create a new Blob store
  3. Copy the token to `BLOB_READ_WRITE_TOKEN`

### 3. Vercel Edge Config (Global Configuration)
- **Purpose**: Store app configuration, feature flags, contract addresses
- **Setup**:
  1. Go to Vercel Dashboard → Your Project → Storage
  2. Create a new Edge Config
  3. Copy the connection string to `EDGE_CONFIG`

### Testing Storage Services
Visit `/storage` for the dashboard or `/api/storage-test` to verify services are working.

## Deployment to Vercel

### Automatic Deployment (Recommended)

1. **Connect Repository**
   - Import your GitHub repository to Vercel
   - Vercel will automatically detect Next.js settings

2. **Configure Environment Variables**
   - In Vercel dashboard, go to Project Settings → Environment Variables
   - Add all variables from `.env.example`

3. **Set up Storage Services**
   - Create Postgres, Blob, and Edge Config databases in Vercel Storage
   - Add their connection strings to environment variables

4. **Deploy**
   - Push to main branch to trigger automatic deployment
   - Vercel will build and deploy your application

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Vercel Configuration

The project includes `vercel.json` with optimized settings:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1"]
}
```

## Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run dev:turbo        # Start with Turbo mode
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix linting issues
npm run type-check      # Run TypeScript checks

# Utilities
npm run analyze         # Bundle analyzer
npm run clean           # Clean build artifacts
npm run init:edge-config # Initialize Edge Config
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── components/        # React components
│   ├── hooks/            # Custom hooks
│   └── lib/              # Utilities and configurations
├── public/               # Static assets
├── types/               # TypeScript definitions
└── styles/             # Global styles
```

## Technologies Used

- **Next.js 15.5.4** - React framework with App Router
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Utility-first CSS framework
- **RainbowKit** - Wallet connection UI
- **Wagmi** - Ethereum interactions
- **Viem** - Ethereum library
- **Framer Motion** - Animations and transitions
- **Vercel Postgres** - Serverless database
- **Vercel Blob** - Object storage
- **Vercel Edge Config** - Global configuration
- **React Query** - Data fetching and caching

## Wallet Connection Troubleshooting

If you're experiencing "Failed to connect to MetaMask" errors, try these solutions:

### 1. MetaMask Setup
- **Install MetaMask**: Ensure the MetaMask browser extension is installed
- **Unlock Wallet**: Open MetaMask and unlock your wallet
- **Check Network**: Switch to Base Sepolia testnet in MetaMask

### 2. Browser Issues
- **Refresh Page**: Hard refresh (Ctrl+F5) to clear cache
- **Incognito Mode**: Try in incognito/private browsing
- **Disable Extensions**: Temporarily disable other wallet extensions

### 3. Network Configuration
- **Base Sepolia**: Ensure MetaMask is connected to Base Sepolia testnet
- **RPC URL**: `https://sepolia.base.org`
- **Chain ID**: `84532`

### 4. Development Environment
- **Environment Variables**: Check `.env.local` has correct `NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID`
- **Dependencies**: Run `npm install` to ensure all packages are installed
- **Build Cache**: Clear Next.js cache with `rm -rf .next`

### 5. Common Error Messages

**"User rejected the request"**
- User clicked "Cancel" in MetaMask popup

**"MetaMask is not installed"**
- Install MetaMask extension from metamask.io

**"Network not supported"**
- Switch MetaMask to Base Sepolia testnet

**"Connection timeout"**
- Check internet connection and try again

### 6. Advanced Troubleshooting

If issues persist:
1. Open browser DevTools (F12)
2. Check Console tab for detailed error messages
3. Look for MetaMask-related errors
4. Try connecting on a different browser

## API Documentation

### Events API
- `GET /api/events` - Fetch all events
- `POST /api/events` - Create new event (webhook)

### Storage API
- `GET /api/storage-test` - Test storage services
- `POST /api/storage-test` - Upload files

### Pages
- `/` - Homepage with featured events
- `/events` - Browse all events
- `/events/[id]` - Event details
- `/my-events` - Organizer dashboard
- `/my-tickets` - User tickets
- `/storage` - Storage services dashboard

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section above
- Review the API documentation
