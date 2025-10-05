# Onchain Social

In this guide, you'll discover the world of onchain social applications and learn how to build interactive Mini Apps that live directly inside social feeds, creating seamless user experiences without traditional platform limitations.

## What Is Onchain Social?

Traditional social media follows a familiar but limiting pattern: users sign in with email addresses, scroll through centralized feeds, and click links that redirect them away from the conversation. While this model works, it has fundamental limitations that onchain social aims to solve.

### Traditional Social

Platform-owned identity and content with limited user control

### Onchain Social

User-owned identity, programmable feeds, and embedded applications

#### The Onchain Social Paradigm

Onchain social represents a fundamental shift in how we think about digital identity and social interactions:

**Traditional Model Problems:**
- Your identity, content, and interactions are owned by the platform
- Building requires working on top of platforms, never inside them
- Users must leave conversations to access new experiences
- Developers are limited by platform APIs and restrictions

**Onchain Social Solutions:**
- Portable Identity: Your Farcaster ID (FID) belongs to you, not locked to any single platform
- Embedded Experiences: Rich, interactive apps run natively inside posts and conversations
- Developer Freedom: Build as first-class citizens within the social graph
- User Ownership: Control your data, content, and social connections

This isn't about replacing existing platforms—it's about removing the walls between users, developers, and the experiences they create together.

## What You'll Build

By the end of this guide, you'll have created a fully functional Mini App with these capabilities:

### Interactive Social Features

Polls, games, and collaborative tools that run inside social feeds

### Context-Aware Experiences

Apps that know who opened them and adapt accordingly

### Onchain Integration

Direct access to wallets, DeFi protocols, and blockchain transactions

### Seamless Authentication

User-owned identity through Farcaster without separate logins

## Mini Apps: The Interface for Onchain Social

Mini Apps are lightweight, expressive web applications that live directly inside social feeds. They launch instantly without installation and provide rich, interactive experiences that respond to your onchain identity.

What makes Mini Apps special:
- Embedded experiences that don't redirect users away from conversations
- Social context awareness - they know who opened them and from where
- Onchain identity integration with automatic personalization
- Native feel within social platforms

Use cases include:
- Interactive polls and real-time voting
- Social games and entertainment
- E-commerce with instant checkout
- DeFi interfaces and portfolio management
- NFT showcases and trading
- Collaborative decision-making tools

Mini Apps offer developers direct access to social distribution - you're building inside the conversation, not trying to pull users away from it.

## Build Your First Mini App

1. Install MiniKit and Create Your Project

The fastest way to build a Mini App is with MiniKit, which handles authentication, social context, and onchain integrations automatically.

Create a new Mini App:

```bash
npx create-onchain --mini
cd your-mini-app-name
npm install
```

Start the development server:

```bash
npm run dev
```

Your Mini App should now be running at `http://localhost:3000` with a fully functional social interface.

What you get out of the box:
- Complete frontend and backend scaffold
- Built-in support for Farcaster identity and notifications
- Native integrations with Base blockchain and OnchainKit
- Responsive design optimized for mobile social feeds
- Development tools for testing and debugging

The MiniKit scaffold includes example components and pages to help you understand the architecture quickly.

2. Understand Social Context

Mini Apps have access to rich social context that traditional web apps lack. This context makes personalization effortless and enables intelligent interactions.

Access user and social context:

```tsx
import { useMiniKit } from "@coinbase/onchainkit/minikit";

export default function App() {
  const { context } = useMiniKit();

  // Verified user information (always available)
  const userFid = context?.user?.fid;

  // Additional user data (when available)
  const username = context?.user?.username;
  const displayName = context?.user?.displayName;
  const pfpUrl = context?.user?.pfpUrl;

  // Client information
  const isAdded = context?.client?.added; // Whether user has added this Mini App
  const location = context?.location; // Where the Mini App was launched from

  return (
    <div className="mini-app">
      <h1>Welcome{displayName ? `, ${displayName}` : ''}!</h1>
      <p>Your FID: {userFid}</p>
      {username && <p>Username: @{username}</p>}
      {isAdded && <p>✅ You've added this Mini App</p>}
      {location && <p>Launched from: {location}</p>}
    </div>
  );
}
```

Verified context properties:
- User identity: FID (always available), username, display name, profile image URL
- Client status: Whether the user has added your Mini App to their favorites
- Launch context: General location information about where the Mini App was opened
- Safe area insets: For proper mobile layout within Farcaster clients

Always handle cases where context might be undefined, especially during development and testing.

3. Build Interactive Features

Create engaging social experiences that leverage the Mini App's embedded nature.

Example: Social Voting App

```tsx
import { useState, useEffect } from 'react';
import { useMiniKit } from "@coinbase/onchainkit/minikit";

export default function VotingApp() {
  const { context } = useMiniKit();
  const [votes, setVotes] = useState({ option1: 0, option2: 0 });
  const [userVote, setUserVote] = useState(null);

  const handleVote = async (option) => {
    if (userVote) return; // Prevent double voting

    // Submit vote to your backend
    const response = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fid: context?.user?.fid,
        option,
        location: context?.location
      })
    });

    if (response.ok) {
      setUserVote(option);
      // Update vote counts
      setVotes(prev => ({
        ...prev,
        [option]: prev[option] + 1
      }));
    }
  };

  return (
    <div className="voting-app">
      <h2>What's your preference?</h2>

      <div className="vote-options">
        <button
          onClick={() => handleVote('option1')}
          disabled={userVote}
          className={userVote === 'option1' ? 'selected' : ''}
        >
          Option A ({votes.option1} votes)
        </button>

        <button
          onClick={() => handleVote('option2')}
          disabled={userVote}
          className={userVote === 'option2' ? 'selected' : ''}
        >
          Option B ({votes.option2} votes)
        </button>
      </div>

      {userVote && (
        <p>Thanks for voting! Your choice: {userVote}</p>
      )}
    </div>
  );
}
```

Use the user's FID to prevent duplicate votes and create personalized experiences without requiring separate authentication.

4. Add Onchain Integration

Enhance your Mini App with blockchain functionality using OnchainKit:

```tsx
import {
  Transaction,
  TransactionButton,
  TransactionStatus
} from '@coinbase/onchainkit/transaction';

export default function OnchainMiniApp() {
  const { context } = useMiniKit();

  const handleTransaction = async () => {
    // Create transaction based on social context
    const txData = {
      to: '0x...',
      value: '1000000000000000000', // 1 ETH
      data: '0x...'
    };

    return txData;
  };

  return (
    <div className="onchain-mini-app">
      <h2>Onchain Social Action</h2>
      <p>Initiated by FID: {context?.user?.fid}</p>

      <Transaction
        calls={[handleTransaction]}
        onSuccess={(receipt) => {
          console.log('Transaction successful:', receipt);
        }}
      >
        <TransactionButton text="Execute Onchain Action" />
        <TransactionStatus />
      </Transaction>
    </div>
  );
}
```

Your Mini App can now trigger blockchain transactions directly from social interactions.

5. Deploy and Test Your Mini App

Deploy your Mini App to make it accessible within social feeds.

Deploy to Vercel (recommended):

```bash
npm install -g vercel
vercel --prod
```

Test your Mini App:
1. Local testing: Use the MiniKit development tools
2. Frame testing: Test as a Farcaster Frame
3. Social testing: Deploy and test in actual social contexts
4. Performance testing: Ensure fast loading in mobile environments

Always test your Mini App in actual social contexts before broad deployment, as the social environment can affect performance and user experience.

## Convert Existing Apps to Mini Apps

Transform your existing Next.js application into a Mini App without major restructuring. The process is straightforward and doesn't require rebuilding your entire application.

Complete Integration Guide: Follow our comprehensive guide for integrating MiniKit into existing applications with step-by-step instructions, environment setup, and testing procedures.

Key integration steps:
- Install MiniKit as part of OnchainKit
- Wrap your app with `MiniKitProvider`
- Add social context integration to existing components
- Configure environment variables and deployment

For new projects, use the MiniKit CLI for automatic setup with all features pre-configured.

## Advanced MiniKit Features

Once you have your basic Mini App running, explore advanced capabilities:

- Notifications & Engagement: Send push notifications to users who have added your Mini App
- Authentication Patterns: Implement Farcaster authentication for secure, persistent sessions
- Profile Integration: Navigate users to Farcaster profiles and build social connections
- Frame Management: Allow users to save your Mini App for easy access

## Best Practices & Troubleshooting

Building successful Mini Apps requires understanding social-specific patterns and common pitfalls:

- Social Design Patterns: Design patterns and best practices for building social Mini Apps
- Debugging Guide: Common issues and solutions when developing Mini Apps
- Performance Optimization: Optimize loading times and user experience for mobile social environments
- Coinbase Wallet Integration: Specific guidance for optimizing Mini Apps in Base App

## Resources and Community

- MiniKit Documentation: Complete documentation for building Mini Apps with MiniKit
- MiniKit Quickstart: Get started with MiniKit in under 10 minutes
- Farcaster Protocol: Learn about the underlying Farcaster social protocol
- Base Developer Community: Connect with other developers building onchain social apps

**Reference:** [Onchain Social](https://docs.base.org/cookbook/onchain-social)