/**
 * Unified Contract Wrapper
 *
 * This module provides a unified interface for direct blockchain interaction.
 */

import { type Address } from 'viem';
import {
  directContractRead,
  directContractWrite,
  simulateContractWrite,
  waitForTransaction
} from './contract-fallback';
import { CONTRACT_ADDRESSES } from './contracts';

export interface ContractCallOptions {
  chainId?: number; // Default: 84532 (Base Sepolia)
}

export interface WriteCallOptions extends ContractCallOptions {
  account: Address;
  value?: bigint;
  waitForConfirmation?: boolean; // Wait for tx to be mined
}

/**
 * Read from contract
 */
export async function readContract<T = any>(
  contractNameOrAddress: keyof typeof CONTRACT_ADDRESSES | Address,
  functionName: string,
  args: any[] = [],
  options: ContractCallOptions = {}
): Promise<T> {
  const {
    chainId = 84532,
  } = options;

  console.log(`[Wrapper] Direct read: ${String(contractNameOrAddress)}.${functionName}`);
  return directContractRead<T>(contractNameOrAddress, functionName, args, chainId);
}

/**
 * Write to contract
 */
export async function writeContract(
  contractNameOrAddress: keyof typeof CONTRACT_ADDRESSES | Address,
  functionName: string,
  args: any[] = [],
  options: WriteCallOptions
): Promise<`0x${string}`> {
  const {
    chainId = 84532,
    account,
    value,
    waitForConfirmation = false,
  } = options;

  console.log(`[Wrapper] Direct write: ${String(contractNameOrAddress)}.${functionName}`);

  const hash = await directContractWrite(
    contractNameOrAddress,
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
 * Helper: Get current mode
 */
export function getMode(): 'direct' {
  return 'direct';
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
