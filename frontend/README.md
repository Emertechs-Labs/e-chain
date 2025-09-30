# Echain Event Ticketing Platform - Frontend

A blockchain-powered event ticketing platform built with Next.js, featuring NFT tickets and POAP rewards.

## Features

- 🎫 **NFT Event Tickets** - Blockchain-based ticketing system
- 🎭 **POAP Rewards** - Proof of Attendance Protocol integration
- 🌐 **Multi-Chain Support** - Base Sepolia testnet integration
- 📱 **Responsive Design** - Mobile-first approach with Tailwind CSS
- 🔐 **Wallet Integration** - RainbowKit + Wagmi for seamless wallet connection
- 📊 **Real-time Analytics** - Event tracking and user engagement
- 🗄️ **Scalable Storage** - Turso SQLite, Vercel Blob, and Edge Config

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
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=eyJ...
BLOB_READ_WRITE_TOKEN=vercel_blob_...
EDGE_CONFIG=https://edge-config.vercel.com/...
```

## Vercel Storage Services Setup

This project uses Vercel's optimized storage services for enterprise-grade performance and scalability. We've implemented a streamlined architecture using only the essential services needed for a blockchain event platform.

### 🗄️ **1. Turso (Primary Database)**
**Purpose**: Store relational data like events, users, transactions, and metadata

**Setup Steps:**
1. Go to [Turso Dashboard](https://turso.tech) and create an account
2. Create a new database (e.g., `echain-db`)
3. Generate an auth token for your database
4. Copy the **database URL** and **auth token**
5. Add to environment variables as `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`

**Features:**
- ✅ Serverless SQLite database
- ✅ Global distribution with low latency
- ✅ Generous free tier (500 databases, 1GB storage)
- ✅ Real-time event storage and retrieval
- ✅ ACID compliance for transaction integrity

### 📦 **2. Vercel Blob (Object Storage)**
**Purpose**: Store images, documents, event assets, and user uploads

**Setup Steps:**
1. In Vercel Storage tab, click **"Create Database"** → Select **"Blob"**
2. Choose store name (e.g., `echain-blob`) and region
3. Copy the **token** from the store settings
4. Add to environment variables as `BLOB_READ_WRITE_TOKEN`

**Features:**
- ✅ Global CDN for fast content delivery
- ✅ Unlimited storage with generous free tier
- ✅ Automatic image optimization
- ✅ Secure, signed URLs for private content
- ✅ Event image storage and user avatar uploads

### ⚙️ **3. Vercel Edge Config (Global Configuration)**
**Purpose**: Store app configuration, feature flags, contract addresses, and runtime settings

**Setup Steps:**
1. In Vercel Storage tab, click **"Create Database"** → Select **"Edge Config"**
2. Choose config name (e.g., `echain-config`) and region
3. Copy the **connection string** from the config settings
4. Add to environment variables as `EDGE_CONFIG`

**Features:**
- ✅ Ultra-low latency global reads (<50ms worldwide)
- ✅ Real-time configuration updates
- ✅ Feature flags for gradual rollouts
- ✅ Contract address management
- ✅ Rate limiting and security settings

### 🔧 **Environment Variables Configuration**

Add these to your **Vercel project environment variables** (Project Settings → Environment Variables):

```bash
# Database (Required)
TURSO_DATABASE_URL=libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Object Storage (Required)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Global Config (Required)
EDGE_CONFIG=https://edge-config.vercel.com/ecfg_xxxxxxxxxxxxxxxxxx
```

### 🧪 **Testing Your Storage Setup**

After configuration, test all services:

1. **Storage Dashboard**: Visit `/storage` to see service status
2. **API Test Endpoint**: Visit `/api/storage-test` for detailed testing
3. **File Upload Test**: Use the test endpoint to upload sample files

### 📊 **Storage Architecture Benefits**

| Service | Use Case | Performance | Cost |
|---------|----------|-------------|------|
| **Turso** | Event data, users, transactions | Global SQLite | Generous free tier |
| **Blob** | Images, documents, assets | Global CDN | Generous free tier |
| **Edge Config** | Config, flags, addresses | <50ms latency | Always free |

### 🚀 **Production Deployment Checklist**

- [ ] Create Turso database, Blob, and Edge Config in respective services
- [ ] Configure environment variables in Vercel dashboard
- [ ] Test storage services using `/storage` and `/api/storage-test`
- [ ] Verify database connections and data persistence
- [ ] Confirm file uploads work correctly
- [ ] Test Edge Config reads for configuration
- [ ] Run full application test suite
- [ ] Deploy to production environment

### 🔒 **Security Considerations**

- **Turso**: Auth tokens provide secure access
- **Blob**: Tokens provide scoped access (read/write)
- **Edge Config**: Public reads, secure writes through Vercel
- **Environment Variables**: Never commit secrets to code
- **Access Control**: Configure proper permissions in Vercel

### 📈 **Scaling Strategy**

- **Turso**: Global replication with low latency
- **Blob**: Unlimited storage with global CDN
- **Edge Config**: Instant global replication
- **Monitoring**: Use Vercel Analytics for performance metrics
- **Backup**: Automatic replication for Turso data

### 🆘 **Troubleshooting**

**Database Connection Issues:**
- Verify `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are correct
- Check if your Turso database is accessible from your region
- Ensure the auth token has the correct permissions

**Blob Upload Failures:**
- Confirm `BLOB_READ_WRITE_TOKEN` is valid
- Check token permissions (read/write required)
- Verify file size limits (5GB per file)

**Edge Config Errors:**
- Validate `EDGE_CONFIG` URL format
- Ensure config exists in Vercel dashboard
- Check for typos in configuration keys

**Performance Issues:**
- Use connection pooling for database queries
- Implement caching for frequently accessed data
- Optimize image sizes before upload

### 🎯 **Next Steps**

Once storage is configured:
1. **Initialize Database**: Run database migrations if needed
2. **Seed Data**: Add initial configuration to Edge Config
3. **Test Integration**: Verify all app features work with storage
4. **Monitor Usage**: Track storage costs and performance
5. **Optimize**: Implement caching and query optimization

## Deployment to Vercel

### Automatic Deployment (Recommended)

1. **Connect Repository**
   - Import your GitHub repository to Vercel
   - Vercel will automatically detect Next.js settings

2. **Configure Environment Variables**
   - In Vercel dashboard, go to Project Settings → Environment Variables
   - Add all variables from `.env.example`

3. **Set up Storage Services**
   - Create Turso database, Blob, and Edge Config in respective services
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
- **Turso** - Serverless SQLite database
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
