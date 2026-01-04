# Connecting to Base

Use these settings and links to connect tools and apps to Base. Verified sources are listed for reference.

References:
- Base quickstart: https://docs.base.org/base-chain/quickstart/connecting-to-base
- Base mainnet explorer: https://basescan.org
- Base Sepolia explorer: https://sepolia.basescan.org

## Network Info
- Base mainnet chain ID: 8453
- Base Sepolia chain ID: 84532
- Recommendation: use a provider (Chainstack, Spectrum, Coinbase Base Node)

## Wallets (EVM)
Add network manually in MetaMask or WalletConnect-compatible wallets using the provider RPC URL.
- Docs: https://docs.base.org/base-chain/quickstart/connecting-to-base

## SDK Examples
wagmi + viem:
```ts
import { http, createConfig } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";

export const config = createConfig({
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL),
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL),
  },
});
```

ethers v6:
```ts
import { JsonRpcProvider } from "ethers";
const provider = new JsonRpcProvider(process.env.BASE_MAINNET_RPC_URL);
```

Foundry Anvil forking:
```bash
anvil --fork-url "$BASE_MAINNET_RPC_URL"
```

## Verify Contracts
- Mainnet verification: https://basescan.org
- Sepolia verification: https://sepolia.basescan.org


## EIP-3085 addChain params (verified)

Base Mainnet:
```json
{
  "chainId": "0x2105",
  "chainName": "Base",
  "nativeCurrency": { "name": "Ether", "symbol": "ETH", "decimals": 18 },
  "rpcUrls": ["https://mainnet.base.org"],
  "blockExplorerUrls": ["https://basescan.org"]
}
```

Base Sepolia:
```json
{
  "chainId": "0x14A34",
  "chainName": "Base Sepolia",
  "nativeCurrency": { "name": "Sepolia Ether", "symbol": "ETH", "decimals": 18 },
  "rpcUrls": ["https://sepolia.base.org"],
  "blockExplorerUrls": ["https://sepolia.basescan.org"]
}
```

Source: https://docs.base.org/base-chain/quickstart/connecting-to-base
