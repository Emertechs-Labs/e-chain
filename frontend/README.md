# Echain Event Ticketing Platform - Frontend

A blockchain-powered event ticketing platform built with Next.js, featuring NFT tickets and POAP rewards.

## Technologies Used

- **Next.js 15.5.4** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **RainbowKit** - Wallet connection UI
- **Wagmi** - Ethereum interactions
- **Viem** - Ethereum library
- **Framer Motion** - Animations

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.development
   # Edit .env.development with your API keys
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

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
- **Environment Variables**: Check `.env.development` has correct `NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID`
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

## Deployment

Deploy to Vercel with custom domain support through the Lovable platform.
