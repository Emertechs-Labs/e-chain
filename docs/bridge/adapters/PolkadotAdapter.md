# Polkadot Adapter Implementation

This document provides the implementation details for the Polkadot adapter, which enables Echain to communicate with Polkadot parachains and external chains via Polkadot's bridge infrastructure.

## Overview

The Polkadot adapter leverages:
- **XCM (Cross-Consensus Messaging)** for parachain communication
- **Snowbridge** for Ethereum ecosystem integration
- **HRMP (Horizontal Relay-routed Message Passing)** for cross-parachain messaging

## Architecture

```typescript
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';
import { BaseChainAdapter } from '../core/BaseChainAdapter';

export class PolkadotAdapter extends BaseChainAdapter {
  private api: ApiPromise;
  private keyring: Keyring;
  private signer: any;

  constructor(
    chainId: number,
    endpoint: string,
    bridgeContract: string,
    signerMnemonic: string
  ) {
    super(chainId, endpoint, bridgeContract);

    this.initializeApi(endpoint);
    this.initializeSigner(signerMnemonic);
  }

  private async initializeApi(endpoint: string) {
    const provider = new WsProvider(endpoint);
    this.api = await ApiPromise.create({ provider });
  }

  private initializeSigner(mnemonic: string) {
    this.keyring = new Keyring({ type: 'sr25519' });
    this.signer = this.keyring.addFromMnemonic(mnemonic);
  }

  async sendMessage(
    destChainId: number,
    destContract: string,
    payload: Uint8Array,
    messageId: string
  ): Promise<TransactionResult> {
    if (this.isPolkadotParachain(destChainId)) {
      return this.sendViaXCM(destChainId, destContract, payload, messageId);
    }

    if (this.isEthereumChain(destChainId)) {
      return this.sendViaSnowbridge(destChainId, destContract, payload, messageId);
    }

    throw new Error(`Unsupported destination chain: ${destChainId}`);
  }

  private async sendViaXCM(
    destChainId: number,
    destContract: string,
    payload: Uint8Array,
    messageId: string
  ): Promise<TransactionResult> {
    const destination = this.getXCMDestination(destChainId);
    const message = this.buildXCMMessage(destContract, payload, messageId);

    const tx = this.api.tx.xcmPallet.send(destination, message);

    const result = await tx.signAndSend(this.signer, ({ status, events }) => {
      if (status.isInBlock) {
        console.log(`XCM message sent: ${status.asInBlock}`);
      }
    });

    return {
      txHash: result.toHex(),
      success: true,
      messageId
    };
  }

  private async sendViaSnowbridge(
    destChainId: number,
    destContract: string,
    payload: Uint8Array,
    messageId: string
  ): Promise<TransactionResult> {
    // Snowbridge implementation for Ethereum chains
    const tx = this.api.tx.snowbridge.sendMessage({
      destinationChainId: destChainId,
      destinationContract: destContract,
      payload: Array.from(payload),
      messageId: messageId
    });

    const result = await tx.signAndSend(this.signer);

    return {
      txHash: result.toHex(),
      success: true,
      messageId
    };
  }

  async estimateFee(
    destChainId: number,
    payload: Uint8Array
  ): Promise<bigint> {
    // Estimate fee based on payload size and destination
    const baseFee = BigInt(1000000000); // 1 DOT in plancks
    const payloadFee = BigInt(payload.length) * BigInt(1000000); // 0.001 DOT per byte

    let chainMultiplier = BigInt(1);
    if (this.isEthereumChain(destChainId)) {
      chainMultiplier = BigInt(2); // Higher fee for Ethereum
    }

    return baseFee + payloadFee * chainMultiplier;
  }

  private isPolkadotParachain(chainId: number): boolean {
    // Polkadot parachain IDs
    const parachains = [1000, 1001, 1002, 2000, 2001, 2002, 2004, 2006, 2007, 2011, 2012, 2013, 2021, 2023, 2024, 2030, 2031, 2032, 2034, 2035, 2037, 2039, 2040, 2043, 2046, 2048, 2051, 2052, 2053, 2056, 2058, 2062, 2068, 2077, 2080, 2081, 2084, 2085, 2086, 2087, 2088, 2090, 2091, 2092, 2093, 2094, 2096, 2097, 2098, 2099, 2100, 2101, 2102, 2103, 2104, 2105, 2106, 2107, 2108, 2109, 2110, 2111, 2112, 2113, 2114, 2115, 2116, 2117, 2118, 2119, 2120, 2121, 2122, 2123, 2124, 2125, 2126, 2127, 2128, 2129, 2130, 2131, 2132, 2133, 2134, 2135, 2136, 2137, 2138, 2139, 2140, 2141, 2142, 2143, 2144, 2145, 2146, 2147, 2148, 2149, 2150, 2151, 2152, 2153, 2154, 2155, 2156, 2157, 2158, 2159, 2160, 2161, 2162, 2163, 2164, 2165, 2166, 2167, 2168, 2169, 2170, 2171, 2172, 2173, 2174, 2175, 2176, 2177, 2178, 2179, 2180, 2181, 2182, 2183, 2184, 2185, 2186, 2187, 2188, 2189, 2190, 2191, 2192, 2193, 2194, 2195, 2196, 2197, 2198, 2199, 2200];
    return parachains.includes(chainId);
  }

  private isEthereumChain(chainId: number): boolean {
    return [1, 137, 56, 43114].includes(chainId); // ETH, Polygon, BSC, Avalanche
  }

  private getXCMDestination(chainId: number) {
    // Convert chain ID to XCM MultiLocation
    return {
      V3: {
        parents: 1, // Parent relay chain
        interior: {
          X1: {
            Parachain: chainId
          }
        }
      }
    };
  }

  private buildXCMMessage(destContract: string, payload: Uint8Array, messageId: string) {
    // Build XCM message for contract execution
    return {
      V3: [
        {
          Transact: {
            originType: 'SovereignAccount',
            requireWeightAtMost: {
              refTime: 1000000000,
              proofSize: 10000
            }
          }
        },
        {
          DescendOrigin: {
            X1: {
              AccountId32: {
                network: null,
                id: this.signer.addressRaw
              }
            }
          }
        },
        {
          WithdrawAsset: [
            {
              id: {
                Concrete: {
                  parents: 1,
                  interior: 'Here'
                }
              },
              fun: {
                Fungible: 1000000000000 // 1 DOT
              }
            }
          ]
        },
        {
          BuyExecution: {
            fees: {
              id: {
                Concrete: {
                  parents: 1,
                  interior: 'Here'
                }
              },
              fun: {
                Fungible: 1000000000000
              }
            },
            weightLimit: 'Unlimited'
          }
        },
        {
          Transact: {
            originType: 'SovereignAccount',
            requireWeightAtMost: {
              refTime: 2000000000,
              proofSize: 20000
            },
            call: {
              encoded: this.encodeContractCall(destContract, payload, messageId)
            }
          }
        },
        {
          RefundSurplus: {}
        },
        {
          DepositAsset: {
            assets: {
              Wild: 'All'
            },
            maxAssets: 1,
            beneficiary: {
              parents: 1,
              interior: {
                X1: {
                  AccountId32: {
                    network: null,
                    id: this.signer.addressRaw
                  }
                }
              }
            }
          }
        }
      ]
    };
  }

  private encodeContractCall(destContract: string, payload: Uint8Array, messageId: string): Uint8Array {
    // Encode contract call for execution on destination
    // This would be specific to the destination chain's contract interface
    const callData = {
      contract: destContract,
      method: 'receiveMessage',
      args: {
        messageId,
        payload: Array.from(payload),
        sourceChain: this.chainId
      }
    };

    return new TextEncoder().encode(JSON.stringify(callData));
  }

  protected getChainName(): string {
    return 'Polkadot';
  }

  protected supportsAssets(): boolean {
    return true;
  }

  async disconnect() {
    if (this.api) {
      await this.api.disconnect();
    }
  }
}
```

## Configuration

### Environment Variables
```bash
POLKADOT_RPC_ENDPOINT=wss://rpc.polkadot.io
POLKADOT_SIGNER_MNEMONIC=your_signer_mnemonic_here
POLKADOT_BRIDGE_CONTRACT=bridge_contract_address
```

### Chain IDs
- Polkadot Relay Chain: 0
- Asset Hub (Statemine): 1000
- Acala: 2000
- Moonbeam: 2004
- Astar: 2006

## Usage Example

```typescript
import { PolkadotAdapter } from './adapters/PolkadotAdapter';

const adapter = new PolkadotAdapter(
  0, // Polkadot chain ID
  process.env.POLKADOT_RPC_ENDPOINT,
  process.env.POLKADOT_BRIDGE_CONTRACT,
  process.env.POLKADOT_SIGNER_MNEMONIC
);

// Send message to Moonbeam parachain
const result = await adapter.sendMessage(
  2004, // Moonbeam
  '0x1234...', // Destination contract
  encodedPayload,
  messageId
);

console.log('Transaction hash:', result.txHash);
```

## Error Handling

The adapter includes comprehensive error handling for:
- Connection failures
- Insufficient balance
- Invalid destinations
- Transaction reverts
- Network congestion

## Monitoring

Key metrics to monitor:
- Transaction success rate
- Average confirmation time
- Fee efficiency
- Error rates by destination chain

## Security Notes

- Never expose signer mnemonics in code
- Use hardware security modules for production
- Implement transaction signing limits
- Regular security audits of the adapter code