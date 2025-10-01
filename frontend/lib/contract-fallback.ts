/**
 * Direct Smart Contract Fallback
 * 
 * This module provides direct blockchain interaction as a fallback
 * when MultiBaas is unavailable or fails.
 */

import { createPublicClient, createWalletClient, custom, http, type Address, type Chain } from 'viem';
import { baseSepolia } from 'viem/chains';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from './contracts';

// Chain configuration
const SUPPORTED_CHAINS: Record<number, Chain> = {
  84532: baseSepolia,
};

/**
 * Get public client for reading from blockchain
 */
export function getPublicClient(chainId: number = 84532) {
  const chain = SUPPORTED_CHAINS[chainId];
  if (!chain) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  return createPublicClient({
    chain,
    transport: http(),
  });
}

/**
 * Get wallet client for writing to blockchain (requires window.ethereum)
 */
export function getWalletClient(chainId: number = 84532) {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Wallet not available');
  }

  const chain = SUPPORTED_CHAINS[chainId];
  if (!chain) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  return createWalletClient({
    chain,
    transport: custom(window.ethereum),
  });
}

/**
 * Direct read from smart contract
 */
export async function directContractRead<T = any>(
  contractName: keyof typeof CONTRACT_ADDRESSES,
  functionName: string,
  args: any[] = [],
  chainId: number = 84532
): Promise<T> {
  try {
    const client = getPublicClient(chainId);
    const address = CONTRACT_ADDRESSES[contractName] as Address;
    const abi = CONTRACT_ABIS[contractName as keyof typeof CONTRACT_ABIS];

    console.log(`[Fallback] Direct read: ${contractName}.${functionName}(${JSON.stringify(args)})`);

    const result = await client.readContract({
      address,
      abi,
      functionName,
      args,
    });

    console.log(`[Fallback] Direct read result:`, result);
    return result as T;
  } catch (error) {
    console.error(`[Fallback] Direct read failed:`, error);
    throw error;
  }
}

/**
 * Direct write to smart contract (returns transaction hash)
 */
export async function directContractWrite(
  contractName: keyof typeof CONTRACT_ADDRESSES,
  functionName: string,
  args: any[] = [],
  value?: bigint,
  account?: Address,
  chainId: number = 84532
): Promise<`0x${string}`> {
  try {
    const walletClient = getWalletClient(chainId);
    const address = CONTRACT_ADDRESSES[contractName] as Address;
    const abi = CONTRACT_ABIS[contractName as keyof typeof CONTRACT_ABIS];

    console.log(`[Fallback] Direct write: ${contractName}.${functionName}(${JSON.stringify(args)})`);

    // Get account if not provided
    const fromAccount = account || (await walletClient.getAddresses())[0];

    const hash = await walletClient.writeContract({
      address,
      abi,
      functionName,
      args,
      account: fromAccount,
      ...(value && { value }),
    });

    console.log(`[Fallback] Transaction submitted: ${hash}`);
    return hash;
  } catch (error) {
    console.error(`[Fallback] Direct write failed:`, error);
    throw error;
  }
}

/**
 * Simulate contract write (before actually sending)
 */
export async function simulateContractWrite(
  contractName: keyof typeof CONTRACT_ADDRESSES,
  functionName: string,
  args: any[] = [],
  value?: bigint,
  account?: Address,
  chainId: number = 84532
): Promise<any> {
  try {
    const client = getPublicClient(chainId);
    const address = CONTRACT_ADDRESSES[contractName] as Address;
    const abi = CONTRACT_ABIS[contractName as keyof typeof CONTRACT_ABIS];

    console.log(`[Fallback] Simulating: ${contractName}.${functionName}(${JSON.stringify(args)})`);

    const { result } = await client.simulateContract({
      address,
      abi,
      functionName,
      args,
      ...(account && { account }),
      ...(value && { value }),
    });

    console.log(`[Fallback] Simulation successful:`, result);
    return result;
  } catch (error) {
    console.error(`[Fallback] Simulation failed:`, error);
    throw error;
  }
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(
  hash: `0x${string}`,
  chainId: number = 84532
) {
  const client = getPublicClient(chainId);
  console.log(`[Fallback] Waiting for transaction: ${hash}`);
  
  const receipt = await client.waitForTransactionReceipt({ hash });
  console.log(`[Fallback] Transaction confirmed:`, receipt);
  
  return receipt;
}

/**
 * Get transaction receipt
 */
export async function getTransactionReceipt(
  hash: `0x${string}`,
  chainId: number = 84532
) {
  const client = getPublicClient(chainId);
  return client.getTransactionReceipt({ hash });
}

/**
 * Check if an address is a contract
 */
export async function isContract(
  address: Address,
  chainId: number = 84532
): Promise<boolean> {
  const client = getPublicClient(chainId);
  const code = await client.getBytecode({ address });
  return code !== undefined && code !== '0x';
}

/**
 * Get current block number
 */
export async function getBlockNumber(chainId: number = 84532): Promise<bigint> {
  const client = getPublicClient(chainId);
  return client.getBlockNumber();
}

/**
 * Get balance of an address
 */
export async function getBalance(
  address: Address,
  chainId: number = 84532
): Promise<bigint> {
  const client = getPublicClient(chainId);
  return client.getBalance({ address });
}
