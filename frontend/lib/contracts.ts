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

// Contract ABIs (can be imported from typechain factories if needed)
export const CONTRACT_ABIS = {
  EventFactory: require('./typechain-types/factories/contracts/core/EventFactory__factory').EventFactory__factory.abi,
  EventTicket: require('./typechain-types/factories/contracts/core/EventTicket__factory').EventTicket__factory.abi,
  POAPAttendance: require('./typechain-types/factories/contracts/modules/POAPAttendance__factory').POAPAttendance__factory.abi,
  IncentiveManager: require('./typechain-types/factories/contracts/modules/IncentiveManager.sol/IncentiveManager__factory').IncentiveManager__factory.abi,
  Marketplace: [] as any // TODO: Generate typechain for Marketplace
} as const;