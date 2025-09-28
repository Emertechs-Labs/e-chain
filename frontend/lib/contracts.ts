// Contract addresses deployed on Base Sepolia
export const CONTRACT_ADDRESSES = {
  EventFactory: '0xbE36039Bfe7f48604F73daD61411459B17fd2e85',
  EventTicket: '0x127b53D8f29DcDe4DDfcCb24ad8b88B515D08180',
  POAPAttendance: '0x405061e2ef1F748fA95A1e7725fc1a008e8c2196',
  IncentiveManager: '0x8290c12f874DF9D03FDadAbE10C7c6321B69Ded9'
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
  IncentiveManager: require('./typechain-types/factories/contracts/modules/IncentiveManager.sol/IncentiveManager__factory').IncentiveManager__factory.abi
} as const;