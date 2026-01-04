// Contract addresses deployed on Base Sepolia
export const CONTRACT_ADDRESSES = {
  EventFactory: '0xA97cB40548905B05A67fCD4765438aFBEA4030fc',
  EventTicket: '0xc8cd32F0b2a6EE43f465a3f88BC52955A805043C',
  POAPAttendance: '0x08344CfBfB3afB2e114A0dbABbaF40e7eB62FD33',
  IncentiveManager: '0x1cfDae689817B954b72512bC82f23F35B997617D',
  Marketplace: '0xD061393A54784da5Fea48CC845163aBc2B11537A'
} as const;

// EIP-712 Domain and Type definitions
export const EIP712_DOMAINS = {
  POAPAttendance: {
    name: 'POAPAttendance',
    version: '1',
    chainId: 84532, // Base Sepolia
    verifyingContract: CONTRACT_ADDRESSES.POAPAttendance,
  },
} as const;

export const EIP712_TYPES = {
  MintAttendance: [
    { name: 'eventId', type: 'uint256' },
    { name: 'attendee', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
} as const;

// Re-export contract types from typechain
export type {
  EventFactory,
  EventTicket,
  POAPAttendance,
  IncentiveManager
} from './typechain-types';

// Contract ABIs (imported from typechain factories)
import { EventFactory__factory } from './typechain-types/factories/contracts/core/EventFactory__factory';
import { EventTicket__factory } from './typechain-types/factories/contracts/core/EventTicket__factory';
import { POAPAttendance__factory } from './typechain-types/factories/contracts/modules/POAPAttendance__factory';
import { IncentiveManager__factory } from './typechain-types/factories/contracts/modules/IncentiveManager.sol/IncentiveManager__factory';
import { Marketplace__factory } from './typechain-types/factories/contracts/core/Marketplace__factory';
import logger from './logger';

export const CONTRACT_ABIS = {
  EventFactory: EventFactory__factory.abi,
  EventTicket: EventTicket__factory.abi,
  POAPAttendance: POAPAttendance__factory.abi,
  IncentiveManager: IncentiveManager__factory.abi,
  Marketplace: Marketplace__factory.abi
} as const;

// Debug logging (only in development)
if (process.env.NODE_ENV === 'development') {
  logger.info({
    msg: 'Contract ABIs loaded',
    contracts: {
      EventFactory: CONTRACT_ABIS.EventFactory?.length || 0,
      hasEventCount: CONTRACT_ABIS.EventFactory?.some(f => 'name' in f && f.name === 'eventCount'),
      hasIsVerifiedOrganizer: CONTRACT_ABIS.EventFactory?.some(f => 'name' in f && f.name === 'isVerifiedOrganizer')
    }
  });
}