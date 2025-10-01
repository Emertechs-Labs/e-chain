/**
 * Unified Contract Wrapper with Automatic Fallback
 * 
 * This module provides a unified interface that:
 * 1. Tries MultiBaas first (for better analytics, caching, etc.)
 * 2. Falls back to direct contract calls if MultiBaas fails
 * 3. Maintains the same API regardless of which method succeeds
 */

import { type Address } from 'viem';
import { callContractRead, getUnsignedTransactionForChain } from './multibaas';
import { 
  directContractRead, 
  directContractWrite, 
  simulateContractWrite,
  waitForTransaction
} from './contract-fallback';
import type { CONTRACT_ADDRESSES } from './contracts';

export interface ContractCallOptions {
  useMultiBaas?: boolean; // Default: true (try MultiBaas first)
  skipFallback?: boolean; // Default: false (allow fallback to direct)
  chainId?: number; // Default: 84532 (Base Sepolia)
}

export interface WriteCallOptions extends ContractCallOptions {
  account: Address;
  value?: bigint;
  waitForConfirmation?: boolean; // Wait for tx to be mined
}

/**
 * Read from contract with automatic fallback
 */
export async function readContract<T = any>(
  contractName: keyof typeof CONTRACT_ADDRESSES,
  functionName: string,
  args: any[] = [],
  options: ContractCallOptions = {}
): Promise<T> {
  const {
    useMultiBaas = true,
    skipFallback = false,
    chainId = 84532,
  } = options;

  // Try MultiBaas first if enabled
  if (useMultiBaas) {
    try {
      console.log(`[Wrapper] Trying MultiBaas read: ${String(contractName)}.${functionName}`);
      
      const { CONTRACT_ADDRESSES: addresses } = await import('./contracts');
      const address = addresses[contractName];
      const result = await callContractRead(address, String(contractName), functionName, args);
      
      console.log(`[Wrapper] MultiBaas read succeeded`);
      return result as T;
    } catch (error: any) {
      // Log the actual error type and message
      console.warn(`[Wrapper] MultiBaas read failed:`, {
        name: error?.name,
        message: error?.message,
        type: typeof error,
        error
      });
      
      if (skipFallback) {
        throw error;
      }
      
      console.log(`[Wrapper] 🔄 Activating fallback to direct RPC...`);
    }
  }

  // Fallback to direct contract call
  console.log(`[Fallback] Using direct RPC for ${String(contractName)}.${functionName}`);
  return directContractRead<T>(contractName, functionName, args, chainId);
}

/**
 * Write to contract with automatic fallback
 * 
 * Note: MultiBaas generates unsigned transactions that need to be signed.
 * Direct fallback uses wallet directly.
 */
export async function writeContract(
  contractName: keyof typeof CONTRACT_ADDRESSES,
  functionName: string,
  args: any[] = [],
  options: WriteCallOptions
): Promise<`0x${string}`> {
  const {
    useMultiBaas = true,
    skipFallback = false,
    chainId = 84532,
    account,
    value,
    waitForConfirmation = false,
  } = options;

  // Try MultiBaas first if enabled
  if (useMultiBaas) {
    try {
      console.log(`[Wrapper] Trying MultiBaas write: ${String(contractName)}.${functionName}`);
      
      const { CONTRACT_ADDRESSES: addresses } = await import('./contracts');
      const address = addresses[contractName];
      const chain = chainId === 84532 ? 'base-sepolia' : `eip155:${chainId}`;
      
      // Get unsigned transaction from MultiBaas
      const unsignedTx = await getUnsignedTransactionForChain(
        chain,
        address,
        String(contractName),
        functionName,
        args,
        account,
        value?.toString()
      );

      console.log(`[Wrapper] MultiBaas generated unsigned transaction`);
      
      // You'll need to sign and send this via your wallet hook
      // This returns the tx data, not the hash - you'll handle signing in your app
      // For now, throw to force fallback
      throw new Error('MultiBaas write requires additional signing flow - using fallback');
      
    } catch (error) {
      console.warn(`[Wrapper] MultiBaas write failed:`, error);
      
      if (skipFallback) {
        throw error;
      }
      
      console.log(`[Wrapper] Falling back to direct contract write`);
    }
  }

  // Fallback to direct contract call
  const hash = await directContractWrite(
    contractName,
    functionName,
    args,
    value,
    account,
    chainId
  );

  // Optionally wait for confirmation
  if (waitForConfirmation) {
    console.log(`[Wrapper] Waiting for transaction confirmation...`);
    await waitForTransaction(hash, chainId);
  }

  return hash;
}

/**
 * Simulate a contract write before executing
 * (Useful for gas estimation and validation)
 */
export async function simulateWrite(
  contractName: keyof typeof CONTRACT_ADDRESSES,
  functionName: string,
  args: any[] = [],
  options: WriteCallOptions
): Promise<any> {
  const { chainId = 84532, account, value } = options;
  
  console.log(`[Wrapper] Simulating write: ${String(contractName)}.${functionName}`);
  
  return simulateContractWrite(
    contractName,
    functionName,
    args,
    value,
    account,
    chainId
  );
}

/**
 * Helper: Determine if MultiBaas is available
 */
export function isMultiBaasAvailable(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL &&
    (process.env.MULTIBAAS_API_KEY || 
     process.env.NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY ||
     process.env.NEXT_PUBLIC_MULTIBAAS_WEB3_API_KEY)
  );
}

/**
 * Helper: Get current fallback mode
 */
export function getFallbackMode(): 'multibaas' | 'direct' | 'both' {
  const hasMultiBaas = isMultiBaasAvailable();
  
  if (hasMultiBaas) {
    return 'both'; // Try MultiBaas, fallback to direct
  }
  
  return 'direct'; // Direct only
}

/**
 * Helper: Check health of MultiBaas connection
 */
export async function checkMultiBaasHealth(): Promise<boolean> {
  if (!isMultiBaasAvailable()) {
    return false;
  }

  try {
    // Try a simple read call to check if MultiBaas is responding
    const { CONTRACT_ADDRESSES: addresses } = await import('./contracts');
    const address = addresses.EventFactory;
    await callContractRead(address, 'EventFactory', 'owner', []);
    return true;
  } catch {
    return false;
  }
}

// Re-export utilities from contract-fallback
export { 
  directContractRead, 
  directContractWrite, 
  simulateContractWrite,
  waitForTransaction,
  getTransactionReceipt,
  isContract,
  getBlockNumber,
  getBalance,
} from './contract-fallback';
