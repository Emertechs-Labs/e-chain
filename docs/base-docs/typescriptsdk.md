# OnchainKit API Reference & Smart Wallets

## OnchainKit Overview

OnchainKit is a full-featured React library for building onchain applications. Whether you're creating a web app, mini app, or hybrid app, OnchainKit provides components and utilities to help you build quickly and easily.

### Key Features

- **Wallet Components**: Connection, selection, and management UI
- **Identity System**: ENS/Basename resolution and profile display
- **Transaction Tools**: Transaction building, sending, and status tracking
- **DeFi Integration**: Token swaps, yield farming, and portfolio management
- **Commerce Components**: Onramp, checkout, and payment flows

## OnchainKitProvider Configuration

The `OnchainKitProvider` provides the React context that powers all OnchainKit components. It handles wallet connections, theming, API configuration, and MiniKit integration.

### Basic Usage

```tsx
'use client';
import { ReactNode } from 'react';
import { base } from 'viem/chains';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import '@coinbase/onchainkit/styles.css';

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={base}
      config={{
        appearance: {
          mode: 'auto',
        },
        wallet: {
          display: 'modal',
        },
      }}
    >
      {children}
    </OnchainKitProvider>
  );
}
```

Then, we're wrapping our app with the `RootProvider` in our root layout:

```tsx
import { RootProvider } from './RootProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <RootProvider>{children}</RootProvider>
    </body>
  </html>
}
```

### Props

#### Chain

Specifies the blockchain network your OnchainKit components will use. This is required for all OnchainKit functionality.

```tsx
import { base, mainnet } from 'viem/chains';

// Use Base network
<OnchainKitProvider chain={base}>
  {children}
</OnchainKitProvider>

// Use Ethereum mainnet
<OnchainKitProvider chain={mainnet}>
  {children}
</OnchainKitProvider>
```

Import chain configurations from [viem/chains](https://viem.sh/docs/chains/introduction) for type safety and accuracy.

#### API Key

Your Coinbase Developer Platform API key enables access to OnchainKit services like token data, swap quotes, and transaction sponsorship.

Required for:
- Swap components and APIs
- Transaction components with sponsorship
- Token data and metadata
- NFT minting components

Get your API key from the [Coinbase Developer Platform](https://portal.cdp.coinbase.com/products/onchainkit).

```tsx
<OnchainKitProvider
  apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
  chain={base}
>
  {children}
</OnchainKitProvider>
```

#### RPC URL

Custom RPC endpoint for blockchain requests. If not provided, OnchainKit uses the Coinbase Developer Platform Node (requires `apiKey`).

```tsx
<OnchainKitProvider
  chain={base}
  rpcUrl="https://your-custom-rpc-endpoint.com"
>
  {children}
</OnchainKitProvider>
```

Most applications can omit this and use the default CDP Node by providing an `apiKey`.

#### Project ID

Your Coinbase Developer Platform Project ID, required for funding and onramp components.

Get your Project ID from the [Coinbase Developer Platform](https://portal.cdp.coinbase.com/projects).

```tsx
<OnchainKitProvider
  chain={base}
  projectId={process.env.NEXT_PUBLIC_CDP_PROJECT_ID}
>
  {children}
</OnchainKitProvider>
```

#### Config

Configuration object to customize OnchainKit's appearance, wallet behavior, and gas sponsorship.

##### Appearance

Controls visual styling and branding:
- `name` — Your app's name displayed in components
- `logo` — URL to your app's logo
- `mode` — Color scheme: `'auto'`, `'light'`, or `'dark'`
- `theme` — Visual theme: `'default'`, `'base'`, `'cyberpunk'`, `'hacker'`, or custom

##### Wallet

Wallet connection and display settings:
- `display` — Interface style: `'modal'` (overlay) or `'classic'` (inline)
- `preference` — Coinbase Wallet preference: `'all'`, `'smartWalletOnly'`, or `'eoaOnly'`
- `termsUrl` — Link to your terms of service
- `privacyUrl` — Link to your privacy policy
- `supportedWallets` — Enable additional wallets: `rabby`, `trust`, `frame`

##### Paymaster

URL for gas sponsorship. Configure through [Coinbase Developer Platform](https://portal.cdp.coinbase.com/products/bundler-and-paymaster).

##### Analytics

Enable/disable usage analytics (defaults to `true`).

```tsx
<OnchainKitProvider
  chain={base}
  config={{
    appearance: {
      name: 'My App',
      logo: 'https://example.com/logo.png',
      mode: 'auto',
      theme: 'default',
    },
    wallet: {
      display: 'modal',
      preference: 'all',
      termsUrl: 'https://example.com/terms',
      privacyUrl: 'https://example.com/privacy',
      supportedWallets: {
        rabby: true,
        trust: true,
      },
    },
    paymaster: 'https://api.developer.coinbase.com/rpc/v1/base/your-api-key',
    analytics: true,
  }}
>
  {children}
</OnchainKitProvider>
```

#### MiniKit

Configuration for mini app features. Only needed when building mini apps.

```tsx
<OnchainKitProvider
  chain={base}
  miniKit={{
    enabled: true,
    autoConnect: true,
    notificationProxyUrl: '/api/notify',
  }}
>
  {children}
</OnchainKitProvider>
```

Options:
- `enabled` — Enable MiniKit features (defaults to `false`)
- `autoConnect` — Auto-connect when in mini apps (defaults to `true`)
- `notificationProxyUrl` — Custom notification proxy URL (defaults to `/api/notify`)

#### Analytics

Enable or disable OnchainKit usage analytics.

```tsx
<OnchainKitProvider
  chain={base}
  analytics={false} // Disable analytics
>
  {children}
</OnchainKitProvider>
```

Defaults to `true`. Analytics help improve OnchainKit but can be disabled for privacy.

#### Default Public Clients

Custom viem public clients for specific chains. Useful when you need custom RPC configurations or want to use your own client settings.

```tsx
import { createPublicClient, http } from 'viem';
import { base, mainnet } from 'viem/chains';

const customClients = {
  [base.id]: createPublicClient({
    chain: base,
    transport: http('https://your-custom-base-rpc.com'),
  }),
  [mainnet.id]: createPublicClient({
    chain: mainnet,
    transport: http('https://your-custom-mainnet-rpc.com'),
    batch: {
      multicall: true,
    },
  }),
};

<OnchainKitProvider
  chain={base}
  defaultPublicClients={customClients}
>
  {children}
</OnchainKitProvider>
```

Use cases:
- Custom RPC endpoints with specific configurations
- Enhanced client settings (batching, caching, retries)
- Private or premium RPC providers
- Multi-chain applications with different client requirements per chain

**Reference:** [OnchainKitProvider Configuration](https://docs.base.org/onchainkit/latest/configuration/onchainkit-provider)

## OnchainKit Overview

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `chain` | `Chain` | Yes | The blockchain network your app operates on |
| `apiKey` | `string` | No | Coinbase Developer Platform API key |
| `projectId` | `string` | No | Coinbase Developer Platform Project ID |
| `rpcUrl` | `string` | No | Custom RPC endpoint |
| `config` | `Config` | No | Configuration object for appearance, wallet settings |
| `miniKit` | `MiniKitConfig` | No | MiniKit configuration |
| `analytics` | `boolean` | No | Enable/disable analytics |

## Wallet Components

### <Wallet /> Component

The `<Wallet />` components provide an interface for users to connect their Smart Wallet with identity information like Basename and ETH balance.

```tsx
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
} from '@coinbase/onchainkit/identity';

export function WalletComponents() {
  return (
    <div className="flex justify-end">
      <Wallet>
        <ConnectWallet>
          <Avatar className="h-6 w-6" />
          <Name />
        </ConnectWallet>
        <WalletDropdown>
          <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
            <Avatar />
            <Name />
            <Address />
          </Identity>
          <WalletDropdownDisconnect />
        </WalletDropdown>
      </Wallet>
    </div>
  );
}
```

### WalletDropdownFundLink

Provides funding functionality within the wallet dropdown menu.

```tsx
import { WalletDropdownFundLink } from '@coinbase/onchainkit/wallet';

<WalletDropdownFundLink />
```

## Smart Wallets (Base Account)

### What is a Base Account?

A Base Account is a Smart-Wallet-backed account that gives every user:

- **Universal sign-on**: One passkey works across every Base-enabled app
- **One-tap payments**: Low-friction USDC payments built into the account layer
- **Private profile vault**: Opt-in sharing of email, phone, shipping address
- **Multi-chain support**: One address that works across nine EVM networks

### Base Account SDK

The Base Account SDK provides a simple way to integrate Base Accounts into your application.

#### Installation

```bash
npm install @base-org/account
```

#### Basic Usage

```tsx
import { createBaseAccountSDK, base } from '@base-org/account';

const sdk = createBaseAccountSDK({
  appName: 'My App Name',
  appLogoUrl: 'https://example.com/logo.png',
  appChainIds: [base.constants.CHAIN_IDS.base],
});

// Get provider for web3 interactions
const provider = sdk.getProvider();
```

#### Integration with Viem

```tsx
import { createWalletClient, custom } from 'viem';
import { base } from 'viem/chains';

const provider = sdk.getProvider();

const client = createWalletClient({
  chain: base,
  transport: custom(provider)
});

// Use the client
const [account] = await client.getAddresses();
const hash = await client.sendTransaction({
  account,
  to: '0x...',
  value: parseEther('0.1')
});
```

#### Integration with Wagmi

```tsx
import { createConfig, custom } from 'wagmi';
import { base } from 'wagmi/chains';

const provider = sdk.getProvider();

const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: custom(provider),
  },
});
```

### Supported Networks

**Mainnet**: Base, Arbitrum, Optimism, Zora, Polygon, BNB, Avalanche, Lordchain, Ethereum Mainnet

**Testnet**: Sepolia, Base Sepolia

### Key Benefits for Developers

- **Higher conversion**: No app installs, seed phrases, or network switches
- **Fewer drop-offs at checkout**: Single `pay()` call handles gas and settlement
- **Cross-app identity**: Fetch verified email or shipping address via same SDK
- **Self-custodial**: Users hold the keys; you never touch private data or funds

## Transaction Components

### <Transaction /> Component

The Transaction component enables users to execute transactions with built-in gas sponsorship and transaction status tracking.

```tsx
import { Transaction } from '@coinbase/onchainkit/transaction';

<Transaction
  calls={[
    {
      to: '0x...',
      data: '0x...',
      value: '0x0',
    },
  ]}
  onSuccess={(response) => console.log('Transaction successful', response)}
  onError={(error) => console.log('Transaction failed', error)}
>
  <TransactionButton>Execute Transaction</TransactionButton>
</Transaction>
```

## Identity Components

### <Identity /> Component

Display user identity information including avatar, name, address, and balance.

```tsx
import {
  Identity,
  Avatar,
  Name,
  Address,
  EthBalance,
} from '@coinbase/onchainkit/identity';

<Identity>
  <Avatar />
  <Name />
  <Address />
  <EthBalance />
</Identity>
```

## Customization

OnchainKit components support extensive customization through:

- **className** props for styling
- **Render props** for complete UI control
- **Theme configuration** for consistent branding
- **Appearance settings** for light/dark mode

### Example: Custom Connect Button

```tsx
<ConnectWallet
  render={({ onClick, status, isLoading }) => (
    <button onClick={onClick} className="my-custom-style">
      {status === 'disconnected' ? 'Connect' : 'Connected'}
    </button>
  )}
/>
```

## Next Steps

- [OnchainKit Documentation](https://docs.base.org/onchainkit/)
- [Base Account SDK Reference](https://docs.base.org/base-account/)
- [Smart Wallet Concepts](https://docs.base.org/smart-wallet/concepts/what-is-smart-wallet)

viem@2.0.0, @polkadot/api@10.0.0, @emurgo/cardano-serialization-lib@11.0.0
