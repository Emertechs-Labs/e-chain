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

// Contract ABIs (lazy-loaded to avoid dynamic require issues)
export const CONTRACT_ABIS = {
  get EventFactory() {
    const { EventFactory__factory } = require('./typechain-types/factories/contracts/core/EventFactory__factory');
    return EventFactory__factory.abi;
  },
  get EventTicket() {
    const { EventTicket__factory } = require('./typechain-types/factories/contracts/core/EventTicket__factory');
    return EventTicket__factory.abi;
  },
  get POAPAttendance() {
    const { POAPAttendance__factory } = require('./typechain-types/factories/contracts/modules/POAPAttendance__factory');
    return POAPAttendance__factory.abi;
  },
  get IncentiveManager() {
    const { IncentiveManager__factory } = require('./typechain-types/factories/contracts/modules/IncentiveManager.sol/IncentiveManager__factory');
    return IncentiveManager__factory.abi;
  },
  get Marketplace() {
    const { Marketplace__factory } = require('./typechain-types/factories/contracts/core/Marketplace__factory');
    return Marketplace__factory.abi;
  }
} as const;

// Debug logging
console.log('CONTRACT_ABIS loaded:', {
  EventFactory: CONTRACT_ABIS.EventFactory?.length || 0,
  hasEventCount: CONTRACT_ABIS.EventFactory?.some((f: any) => 'name' in f && f.name === 'eventCount'),
  hasIsVerifiedOrganizer: CONTRACT_ABIS.EventFactory?.some((f: any) => 'name' in f && f.name === 'isVerifiedOrganizer')
});