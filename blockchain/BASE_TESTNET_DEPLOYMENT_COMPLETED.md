# Echain Contracts - Base Testnet Deployment

## 🚀 Deployed Contract Addresses

| Contract | Address | Verified Link |
| -------- | ------- | ------------ |
| EventTicket Template | `0xc8cd32F0b2a6EE43f465a3f88BC52955A805043C` | [View on BaseScan](https://sepolia.basescan.org/address/0xc8cd32F0b2a6EE43f465a3f88BC52955A805043C#code) |
| EventFactory | `0xA97cB40548905B05A67fCD4765438aFBEA4030fc` | [View on BaseScan](https://sepolia.basescan.org/address/0xA97cB40548905B05A67fCD4765438aFBEA4030fc#code) |
| POAPAttendance | `0x08344CfBfB3afB2e114A0dbABbaF40e7eB62FD33` | [View on BaseScan](https://sepolia.basescan.org/address/0x08344CfBfB3afB2e114A0dbABbaF40e7eB62FD33#code) |
| IncentiveManager | `0x1cfDae689817B954b72512bC82f23F35B997617D` | [View on BaseScan](https://sepolia.basescan.org/address/0x1cfDae689817B954b72512bC82f23F35B997617D#code) |
| Marketplace | `0xD061393A54784da5Fea48CC845163aBc2B11537A` | [View on BaseScan](https://sepolia.basescan.org/address/0xD061393A54784da5Fea48CC845163aBc2B11537A#code) |

## 🔍 Deployment Information

- **Network**: Base Sepolia Testnet
- **Chain ID**: 84532
- **Date**: September 30, 2025
- **Deployer**: 0x5474bA789F5CbD31aea2BcA1939989746242680D

## 📝 Contracts Overview

- **EventFactory**: Central hub for event creation and management
- **EventTicket**: ERC-721 NFT tickets with transfer controls
- **POAPAttendance**: Proof of attendance certificates (soulbound tokens)
- **IncentiveManager**: Rewards and loyalty program for event attendees
- **Marketplace**: Secondary market for ticket trading with royalties

## ⚙️ Configuration Status

- ✅ All contracts successfully deployed
- ✅ All contracts verified on BaseScan
- ✅ Factory configured with template references
- ✅ EventTicket approved for marketplace trading
- ✅ Treasury address configured
- ✅ Test event creation validated

## 🖥️ Frontend Integration

Update your frontend `.env` file with:

```
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_EVENT_FACTORY_ADDRESS=0xA97cB40548905B05A67fCD4765438aFBEA4030fc
NEXT_PUBLIC_EVENT_TICKET_ADDRESS=0xc8cd32F0b2a6EE43f465a3f88BC52955A805043C
NEXT_PUBLIC_POAP_ADDRESS=0x08344CfBfB3afB2e114A0dbABbaF40e7eB62FD33
NEXT_PUBLIC_INCENTIVE_ADDRESS=0x1cfDae689817B954b72512bC82f23F35B997617D
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0xD061393A54784da5Fea48CC845163aBc2B11537A
```