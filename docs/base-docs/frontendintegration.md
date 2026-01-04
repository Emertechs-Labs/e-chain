# Wagmi & Viem Integration

OnchainKit is built on top of [Wagmi](https://wagmi.sh/) and [Viem](https://viem.sh/), providing a seamless integration with these powerful Ethereum libraries. This guide covers how to use Wagmi and Viem directly with OnchainKit for advanced use cases.

## Using Wagmi Hooks with OnchainKit

OnchainKit components use Wagmi hooks internally, but you can also use Wagmi hooks directly alongside OnchainKit components for more control.

### Reading Contract Data

```tsx
'use client';
import { useReadContract } from 'wagmi';
import { base } from 'viem/chains';

export function ContractReader() {
  const { data, isLoading, error } = useReadContract({
    address: '0x...', // Your contract address
    abi: [...], // Your contract ABI
    functionName: 'balanceOf',
    args: ['0x...'], // Function arguments
    chainId: base.id,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Balance: {data?.toString()}</div>;
}
```

### Writing to Contracts

```tsx
'use client';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { base } from 'viem/chains';

export function ContractWriter() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleClick = () => {
    writeContract({
      address: '0x...', // Your contract address
      abi: [...], // Your contract ABI
      functionName: 'mint',
      args: [BigInt(1)], // Function arguments
      chainId: base.id,
    });
  };

  return (
    <button onClick={handleClick} disabled={isPending}>
      {isPending ? 'Minting...' : 'Mint NFT'}
    </button>
  );
}
```

## Using Viem with OnchainKit

For low-level blockchain interactions, you can use Viem clients directly. OnchainKit provides access to configured Viem clients through React hooks.

### Using the Public Client

```tsx
'use client';
import { usePublicClient } from 'wagmi';
import { base } from 'viem/chains';

export function BlockNumber() {
  const publicClient = usePublicClient({ chainId: base.id });

  const [blockNumber, setBlockNumber] = useState<bigint>();

  useEffect(() => {
    const getBlockNumber = async () => {
      const block = await publicClient.getBlockNumber();
      setBlockNumber(block);
    };
    getBlockNumber();
  }, [publicClient]);

  return <div>Current block: {blockNumber?.toString()}</div>;
}
```

### Using the Wallet Client

```tsx
'use client';
import { useWalletClient } from 'wagmi';
import { base } from 'viem/chains';

export function SendTransaction() {
  const { data: walletClient } = useWalletClient({ chainId: base.id });

  const sendTx = async () => {
    if (!walletClient) return;

    const hash = await walletClient.sendTransaction({
      to: '0x...',
      value: parseEther('0.01'),
    });

    console.log('Transaction hash:', hash);
  };

  return (
    <button onClick={sendTx}>
      Send 0.01 ETH
    </button>
  );
}
```

## Custom Wagmi Configuration

You can extend OnchainKit's Wagmi configuration for advanced use cases while maintaining compatibility.

### Adding Custom Connectors

```tsx
'use client';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';
import { createConfig, http } from 'wagmi';
import { base } from 'viem/chains';

const customConfig = createConfig({
  chains: [base],
  connectors: [
    injected(),
    walletConnect({ projectId: 'your-project-id' }),
    coinbaseWallet({
      appName: 'My App',
      appLogoUrl: 'https://example.com/logo.png',
    }),
  ],
  transports: {
    [base.id]: http(),
  },
});

export function App() {
  return (
    <OnchainKitProvider
      chain={base}
      wagmiConfig={customConfig} // Use your custom Wagmi config
    >
      {children}
    </OnchainKitProvider>
  );
}
```

### Custom Transports

```tsx
import { createConfig, http, fallback } from 'wagmi';
import { base } from 'viem/chains';

const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: fallback([
      http('https://mainnet.base.org'),
      http('https://base.llamarpc.com'),
      http('https://base.publicnode.com'),
    ]),
  },
});
```

## Common Patterns

### Multi-Chain Applications

```tsx
'use client';
import { useSwitchChain } from 'wagmi';
import { base, mainnet, optimism } from 'viem/chains';

const chains = [base, mainnet, optimism];

export function ChainSwitcher() {
  const { switchChain } = useSwitchChain();

  return (
    <div>
      {chains.map((chain) => (
        <button
          key={chain.id}
          onClick={() => switchChain({ chainId: chain.id })}
        >
          Switch to {chain.name}
        </button>
      ))}
    </div>
  );
}
```

### Contract Event Listening

```tsx
'use client';
import { useContractEvent } from 'wagmi';

export function EventListener() {
  useContractEvent({
    address: '0x...',
    abi: [...],
    eventName: 'Transfer',
    listener(log) {
      console.log('Transfer event:', log);
    },
  });

  return <div>Listening for Transfer events...</div>;
}
```

### ENS Resolution

```tsx
'use client';
import { useEnsName, useEnsAddress } from 'wagmi';

export function ENSResolver() {
  const { data: ensName } = useEnsName({
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // vitalik.eth
  });

  const { data: address } = useEnsAddress({
    name: 'vitalik.eth',
  });

  return (
    <div>
      <p>ENS Name: {ensName}</p>
      <p>Address: {address}</p>
    </div>
  );
}
```

## Best Practices

### Error Handling

```tsx
'use client';
import { useReadContract } from 'wagmi';

export function SafeContractRead() {
  const { data, error, isLoading } = useReadContract({
    address: '0x...',
    abi: [...],
    functionName: 'balanceOf',
    args: ['0x...'],
    // Add retry logic for failed requests
    query: {
      retry: 3,
      retryDelay: 1000,
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Balance: {data?.toString()}</div>;
}
```

### Gas Estimation

```tsx
'use client';
import { useEstimateGas } from 'wagmi';

export function GasEstimator() {
  const { data: gasEstimate } = useEstimateGas({
    to: '0x...',
    value: parseEther('0.01'),
  });

  return <div>Estimated gas: {gasEstimate?.toString()}</div>;
}
```

### Batch Requests

```tsx
'use client';
import { usePublicClient } from 'wagmi';
import { multicall } from 'viem';

export function BatchReader() {
  const publicClient = usePublicClient();

  const [results, setResults] = useState([]);

  useEffect(() => {
    const batchRead = async () => {
      const result = await multicall(publicClient, {
        contracts: [
          {
            address: '0x...',
            abi: [...],
            functionName: 'balanceOf',
            args: ['0x...'],
          },
          {
            address: '0x...',
            abi: [...],
            functionName: 'totalSupply',
          },
        ],
      });
      setResults(result);
    };
    batchRead();
  }, [publicClient]);

  return <div>Batch results: {JSON.stringify(results)}</div>;
}
```

## Migration from Web3.js

If you're migrating from Web3.js to Viem, here are the key differences:

### Web3.js → Viem

```javascript
// Web3.js
const web3 = new Web3('https://mainnet.base.org');
const balance = await web3.eth.getBalance(address);

// Viem
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const client = createPublicClient({
  chain: base,
  transport: http(),
});
const balance = await client.getBalance({ address });
```

### Contract Interactions

```javascript
// Web3.js
const contract = new web3.eth.Contract(abi, address);
const result = await contract.methods.balanceOf(account).call();

// Viem
import { getContract } from 'viem';

const contract = getContract({
  address,
  abi,
  client: publicClient,
});
const result = await contract.read.balanceOf([account]);
```

**Reference:** [Wagmi & Viem Integration](https://docs.base.org/onchainkit/latest/guides/wagmi-and-viem)