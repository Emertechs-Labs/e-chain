import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { readContract } from '../../lib/contract-wrapper';
import { CONTRACT_ADDRESSES } from '../../lib/contracts';

export interface Reward {
  rewardId: number;
  user: string;
  rewardType: string;
  eventId: number;
  timestamp: number;
}

// Hook to get user's rewards
export const useUserRewards = () => {
  const { address } = useAccount();

  return useQuery({
    queryKey: ['user-rewards', address],
    queryFn: async (): Promise<Reward[]> => {
      if (!address) return [];

      try {
        // Get user's reward balance
        const balance = await readContract(
          'IncentiveManager',
          'balanceOf',
          [address]
        );

        const rewards: Reward[] = [];

        // Get each reward token
        for (let i = 0; i < Number(balance); i++) {
          try {
            // Get token ID by index
            const tokenId = await readContract(
              'IncentiveManager',
              'tokenOfOwnerByIndex',
              [address, i]
            );

            // Get reward data
            const rewardData = await readContract(
              'IncentiveManager',
              'getReward',
              [tokenId]
            );

            rewards.push({
              rewardId: Number(rewardData.rewardId),
              user: rewardData.user,
              rewardType: rewardData.rewardType,
              eventId: Number(rewardData.eventId),
              timestamp: Number(rewardData.timestamp)
            });
          } catch (error) {
            console.error(`Error fetching reward ${i}:`, error);
          }
        }

        return rewards;
      } catch (error) {
        console.error('Error fetching user rewards:', error);
        return [];
      }
    },
    enabled: !!address,
  });
};

// Hook to check early bird claim status for an event
export const useEarlyBirdStatus = (eventId: number, ticketContract?: string) => {
  const { address } = useAccount();

  return useQuery({
    queryKey: ['early-bird-status', eventId, address],
    queryFn: async (): Promise<{
      canClaim: boolean;
      hasClaimed: boolean;
      isEligible: boolean;
      totalSold: number;
      earlyBirdLimit: number;
    }> => {
      if (!address || !ticketContract) {
        return {
          canClaim: false,
          hasClaimed: false,
          isEligible: false,
          totalSold: 0,
          earlyBirdLimit: 10
        };
      }

      try {
        // Check if user has already claimed
        const hasClaimed = await readContract(
          'IncentiveManager',
          'earlyBirdClaimed',
          [eventId, address]
        );

        if (hasClaimed) {
          return {
            canClaim: false,
            hasClaimed: true,
            isEligible: true,
            totalSold: 0,
            earlyBirdLimit: 10
          };
        }

        // Check if user owns tickets for this event
        // Note: We need to use the direct contract address here since it's dynamic
        const ticketBalance = await readContract(
          'EventTicket',
          'balanceOf',
          [address]
        );

        if (Number(ticketBalance) === 0) {
          return {
            canClaim: false,
            hasClaimed: false,
            isEligible: false,
            totalSold: 0,
            earlyBirdLimit: 10
          };
        }

        // Check total tickets sold vs early bird limit
        const totalSold = await readContract(
          'EventTicket',
          'totalSold',
          []
        );

        const earlyBirdLimit = await readContract(
          'IncentiveManager',
          'earlyBirdLimit',
          []
        );

        const canClaim = Number(totalSold) <= Number(earlyBirdLimit);

        return {
          canClaim,
          hasClaimed: false,
          isEligible: true,
          totalSold: Number(totalSold),
          earlyBirdLimit: Number(earlyBirdLimit)
        };
      } catch (error) {
        console.error('Error checking early bird status:', error);
        return {
          canClaim: false,
          hasClaimed: false,
          isEligible: false,
          totalSold: 0,
          earlyBirdLimit: 10
        };
      }
    },
    enabled: !!address && !!eventId && !!ticketContract,
  });
};

// Hook to get user's loyalty points
export const useUserLoyaltyPoints = () => {
  const { address } = useAccount();

  return useQuery({
    queryKey: ['user-loyalty-points', address],
    queryFn: async (): Promise<number> => {
      if (!address) return 0;

      try {
        const points = await readContract(
          'IncentiveManager',
          'loyaltyPoints',
          [address]
        );

        return Number(points);
      } catch (error) {
        console.error('Error fetching loyalty points:', error);
        return 0;
      }
    },
    enabled: !!address,
  });
};

// Hook to get user's referral codes
export const useUserReferralCodes = () => {
  const { address } = useAccount();

  return useQuery({
    queryKey: ['user-referral-codes', address],
    queryFn: async (): Promise<{ code: string; rewards: number }[]> => {
      if (!address) return [];

      try {
        // This is a simplified approach - in a real implementation,
        // you'd need to iterate through all possible codes or maintain
        // a list of codes per user in the contract
        // For now, we'll return an empty array as this requires
        // additional contract modifications
        return [];
      } catch (error) {
        console.error('Error fetching referral codes:', error);
        return [];
      }
    },
    enabled: !!address,
  });
};

// Hook to get user's referral rewards count
export const useUserReferralRewards = () => {
  const { address } = useAccount();

  return useQuery({
    queryKey: ['user-referral-rewards', address],
    queryFn: async (): Promise<number> => {
      if (!address) return 0;

      try {
        const rewards = await readContract(
          'IncentiveManager',
          'referralRewards',
          [address]
        );

        return Number(rewards);
      } catch (error) {
        console.error('Error fetching referral rewards:', error);
        return 0;
      }
    },
    enabled: !!address,
  });
};