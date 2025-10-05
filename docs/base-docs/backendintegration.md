# Build an App on Base

## OnchainKit Overview

OnchainKit is a full-featured React library for building onchain applications. Whether you're creating a web app, mini app, or hybrid app, OnchainKit provides components and utilities to help you build quickly and easily.

### An all-in-one web app and mini app solution

OnchainKit helps you build traditional onchain web apps, mini apps, and hybrid apps (apps that work in Farcaster clients such as the Base app, as well as the browser).

If you're new to mini apps, they are supercharged web apps that get additional functionality such as automatic wallet connection, push notifications, and more. Check out the [Mini Apps documentation](https://docs.base.org/mini-apps/overview) for more information.

### Philosophy

OnchainKit aims to provide a comprehensive toolkit that combines powerful onchain features with developer-friendly design. It's built with the following principles in mind:

- **Ergonomic design**: Full-stack tools that make complex onchain interactions intuitive
- **Battle-tested patterns**: Industry best practices packaged into ready-to-use solutions
- **Purpose-built components**: Pre-built modules for common onchain workflows
- **Framework agnostic**: Compatible with any React framework
- **Supercharged by Base**: Deep integration with Base's protocol features and ecosystem

### Key Features

OnchainKit provides everything you need to build modern onchain applications:

- **Wallet Components**: Connection, selection, and management UI
- **Identity System**: ENS/Basename resolution and profile display
- **Transaction Tools**: Transaction building, sending, and status tracking
- **DeFi Integration**: Token swaps, yield farming, and portfolio management
- **Commerce Components**: Onramp, checkout, and payment flows
- **Advanced Customization**: Render props for complete UI control while maintaining functionality

### Customization

OnchainKit components are designed to be highly customizable. In addition to standard props like `className` and `children`, many components support render props for complete control over their UI while maintaining all underlying functionality.

Render props let you implement custom designs for buttons, inputs, and other interactive elements while OnchainKit handles the complex onchain logic:

```tsx
// Example: Custom wallet connect button
<ConnectWallet
  render={({ onClick, status, isLoading }) => (
    <button onClick={onClick} className="my-custom-style">
      {status === 'disconnected' ? 'Connect' : 'Connected'}
    </button>
  )}
/>
```

Components with render prop support include `ConnectWallet`, `TransactionButton`, `SignatureButton`, various `Swap` components, and `Fund` components. Check individual component documentation for specific render prop interfaces.

**Note**: These docs are LLM-friendly. Reference the [OnchainKit AI Prompting Guide](https://docs.base.org/onchainkit/guides/ai-prompting-guide) in your code editor to streamline builds and prompt smarter.

**Reference:** [OnchainKit Overview](https://docs.base.org/onchainkit/latest/getting-started/overview)

A guide to building a Next.js app on Base using OnchainKit

Welcome to the Base quickstart guide! In this walkthrough, we'll create a simple onchain app from start to finish. Whether you're a seasoned developer or just starting out, this guide has got you covered.

## What You'll Achieve

By the end of this quickstart, you'll have built an onchain app by:
- Configuring your development environment
- Deploying your smart contracts to Base
- Interacting with your deployed contracts from the frontend

Our simple app will be an onchain tally app which lets you add to a total tally, stored onchain, by pressing a button.

## Set Up Your Development Environment

### 1. Bootstrap with OnchainKit

OnchainKit is a library of ready-to-use React components and Typescript utilities for building onchain apps. Run the following command in your terminal and follow the prompts to bootstrap your project.

```bash
npm create onchain@latest
```

The prompts will ask you for a CDP API Key which you can get [here](https://portal.cdp.coinbase.com/projects/api-keys/client-key). Once you've gone through the prompts, you'll have a new project directory with a basic OnchainKit app. Run the following to see it live.

```bash
cd my-onchainkit-app
npm install
npm run dev
```

You should see the following screen. Once we deploy our contracts, we'll add a button that lets us interact with our contracts.

### 2. Install and initialize Foundry

The total tally will be stored onchain in a smart contract. We'll use the Foundry framework to deploy our contract to the Base Sepolia testnet.

1. Create a new "contracts" folder in the root of your project

```bash
mkdir contracts && cd contracts
```

2. Install and initialize Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
forge init --no-git
```

### 3. Configure Foundry with Base

To deploy your smart contracts to Base, you need two key components:
- A node connection to interact with the Base network
- A funded private key to deploy the contract

Create a `.env` file in your `contracts` directory and add the Base and Base Sepolia RPC URLs:

```env
BASE_RPC_URL="https://mainnet.base.org"
BASE_SEPOLIA_RPC_URL="https://sepolia.base.org"
```

Load your environment variables:

```bash
source .env
```

Base Sepolia is the test network for Base, which we will use for the rest of this guide. You can obtain free Base Sepolia ETH from one of the [faucets listed here](https://docs.base.org/base-chain/tools/network-faucets).

### 4. Secure your private key

A private key with testnet funds is required to deploy the contract. You can generate a fresh private key [here](https://visualkey.link/).

1. Store your private key in Foundry's secure keystore

```bash
cast wallet import deployer --interactive
```

2. When prompted enter your private key and a password.

Your private key is stored in `~/.foundry/keystores` which is not tracked by git.

**Never share or commit your private key. Always keep it secure and handle with care.**

## Deploy Your Contracts

Now that your environment is set up, let's deploy your contracts to Base Sepolia. The foundry project provides a deploy script that will deploy the Counter.sol contract.

### 1. Run the deploy script

Use the following command to compile and deploy your contract:

```bash
forge create ./src/Counter.sol:Counter --rpc-url $BASE_SEPOLIA_RPC_URL --account deployer
```

Note the format of the contract being deployed is `<contract-path>:<contract-name>`.

### 2. Save the contract address

After successful deployment, the transaction hash will be printed to the console output. Copy the deployed contract address and add it to your `.env` file:

```env
COUNTER_CONTRACT_ADDRESS="0x..."
```

### 3. Load the new environment variable

```bash
source .env
```

### 4. Verify Your Deployment

To ensure your contract was deployed successfully:
1. Check the transaction on [Sepolia Basescan](https://sepolia.basescan.org/).
2. Use the `cast` command to interact with your deployed contract from the command line:

```bash
cast call $COUNTER_CONTRACT_ADDRESS "number()(uint256)" --rpc-url $BASE_SEPOLIA_RPC_URL
```

This will return the initial value of the Counter contract's `number` storage variable, which will be `0`.

Congratulations! You've deployed your smart contract to Base Sepolia!

## Interacting with your contract

To interact with the smart contract logic, we need to submit an onchain transaction. We can do this easily with the `Transaction` component.

### 1. Add the Transaction component

Let's add the `Transaction` component to our `page.tsx` file. Delete the existing content in the `main` tag and replace it with the snippet below.

```tsx
// @noErrors: 2307 - Cannot find module '@/calls'
import { Transaction } from '@coinbase/onchainkit/transaction';
import { calls } from '@/calls';

<main className="flex flex-grow items-center justify-center">
  <div className="w-full max-w-4xl p-4">
    <div className="mx-auto mb-6 w-1/3">
      <Transaction calls={calls} />
    </div>
  </div>
</main>
```

### 2. Defining the contract calls

In the previous code snippet, you'll see we imported `calls` from the `calls.ts` file. This file provides the details needed to interact with our contract and call the `increment` function. Create a new `calls.ts` file in the same folder as your `page.tsx` file and add the following code.

```tsx
const counterContractAddress = '0x...'; // add your contract address here
const counterContractAbi = [
  {
    type: 'function',
    name: 'increment',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;

export const calls = [
  {
    address: counterContractAddress,
    abi: counterContractAbi,
    functionName: 'increment',
    args: [],
  },
];
```

The `calls.ts` file contains the details of the contract interaction, including the contract address, which we saved in the previous step.

### 3. Testing the component

Now, when you connect a wallet and click on the `Transact` button and approve the transaction, it will increment the tally onchain by one. We can verify that the onchain count took place onchain by once again using `cast` to call the `number` function on our contract.

```bash
cast call $COUNTER_CONTRACT_ADDRESS "number()(uint256)" --rpc-url $BASE_SEPOLIA_RPC_URL
```

If the transaction was successful, the tally should have incremented by one!

We now have a working onchain tally app! While the example is simple, it illustrates the end to end process of building on onchain app. We:
- Configured a project with frontend and onchain infrastructure
- Deployed a smart contract to Base Sepolia
- Interacted with the contract from the frontend

## Further Improvements

This is just the beginning. There are many ways we can improve upon this app. For example, we could:
- Make the `increment` transaction gasless by integrating with [Paymaster](https://docs.base.org/onchainkit/transaction/transaction#sponsor-with-paymaster-capabilities)
- Improve the wallet connection and sign up flow with the [WalletModal](https://docs.base.org/onchainkit/wallet/wallet-modal) component
- Add onchain [Identity](https://docs.base.org/onchainkit/identity/identity) so we know who added the most recent tally
