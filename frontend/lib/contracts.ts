import { getContract } from 'viem';
import { usePublicClient, useWalletClient } from 'wagmi';

// Contract ABIs - These should match your deployed contracts
export const EVENT_FACTORY_ABI = [
  // Core functions
  {
    inputs: [
      { name: "name", type: "string" },
      { name: "symbol", type: "string" },
      { name: "maxTickets", type: "uint256" },
      { name: "ticketPrice", type: "uint256" },
      { name: "saleEndTime", type: "uint256" }
    ],
    name: "createEvent",
    outputs: [{ name: "eventId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "eventId", type: "uint256" }],
    name: "getEvent",
    outputs: [
      {
        components: [
          { name: "name", type: "string" },
          { name: "symbol", type: "string" },
          { name: "organizer", type: "address" },
          { name: "ticketContract", type: "address" },
          { name: "maxTickets", type: "uint256" },
          { name: "ticketPrice", type: "uint256" },
          { name: "saleEndTime", type: "uint256" },
          { name: "isActive", type: "bool" }
        ],
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "organizer", type: "address" }],
    name: "getOrganizerEvents",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "offset", type: "uint256" },
      { name: "limit", type: "uint256" }
    ],
    name: "getActiveEvents",
    outputs: [
      { name: "eventIds", type: "uint256[]" },
      { name: "hasMore", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "eventCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "treasury",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

export const EVENT_TICKET_ABI = [
  // ERC721 standard functions
  {
    inputs: [{ name: "to", type: "address" }, { name: "tokenId", type: "uint256" }],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  // Ticket-specific functions
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "quantity", type: "uint256" }
    ],
    name: "mintTickets",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { name: "recipients", type: "address[]" },
      { name: "quantities", type: "uint256[]" }
    ],
    name: "batchMintTickets",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "useTicket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "getEventInfo",
    outputs: [
      { name: "name", type: "string" },
      { name: "maxTickets", type: "uint256" },
      { name: "ticketPrice", type: "uint256" },
      { name: "saleEndTime", type: "uint256" },
      { name: "totalSupply", type: "uint256" },
      { name: "isActive", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  }
] as const;

export const POAP_ATTENDANCE_ABI = [
  {
    inputs: [
      { name: "eventId", type: "uint256" },
      { name: "attendee", type: "address" },
      { name: "signature", type: "bytes" }
    ],
    name: "claimPOAP",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "attendee", type: "address" }, { name: "eventId", type: "uint256" }],
    name: "hasClaimed",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "eventId", type: "uint256" }],
    name: "getEventAttendees",
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

// Contract addresses from environment
export const CONTRACTS = {
  EVENT_FACTORY: (process.env.NEXT_PUBLIC_EVENT_FACTORY_ADDRESS || '') as `0x${string}`,
  POAP_ATTENDANCE: (process.env.NEXT_PUBLIC_POAP_ATTENDANCE_ADDRESS || '') as `0x${string}`,
  INCENTIVE_MANAGER: (process.env.NEXT_PUBLIC_INCENTIVE_MANAGER_ADDRESS || '') as `0x${string}`,
} as const;

// Contract hook functions
export const useEventFactoryContract = () => {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  if (!CONTRACTS.EVENT_FACTORY) {
    throw new Error('Event Factory contract address not configured');
  }

  return {
    read: publicClient ? getContract({
      address: CONTRACTS.EVENT_FACTORY,
      abi: EVENT_FACTORY_ABI,
      client: { public: publicClient },
    }) : null,
    write: walletClient ? getContract({
      address: CONTRACTS.EVENT_FACTORY,
      abi: EVENT_FACTORY_ABI,
      client: walletClient,
    }) : null,
  };
};

export const useEventTicketContract = (address: `0x${string}`) => {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  return {
    read: publicClient ? getContract({
      address,
      abi: EVENT_TICKET_ABI,
      client: { public: publicClient },
    }) : null,
    write: walletClient ? getContract({
      address,
      abi: EVENT_TICKET_ABI,
      client: walletClient,
    }) : null,
  };
};

export const usePOAPContract = () => {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  if (!CONTRACTS.POAP_ATTENDANCE) {
    throw new Error('POAP Attendance contract address not configured');
  }

  return {
    read: publicClient ? getContract({
      address: CONTRACTS.POAP_ATTENDANCE,
      abi: POAP_ATTENDANCE_ABI,
      client: { public: publicClient },
    }) : null,
    write: walletClient ? getContract({
      address: CONTRACTS.POAP_ATTENDANCE,
      abi: POAP_ATTENDANCE_ABI,
      client: walletClient,
    }) : null,
  };
};
