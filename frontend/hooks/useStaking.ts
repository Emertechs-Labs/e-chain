'use client';

import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { eventStakingService, StakingReward } from '../lib/staking-service';
import { toast } from 'sonner';

export interface UseStakingReturn {
  stakeRewards: (rewards: StakingReward[]) => Promise<void>;
  getStakingRewards: () => Promise<void>;
  unstakeRewards: (amount: string) => Promise<void>;
  getStakingAPY: () => Promise<number>;
  stakingRewards: any[];
  stakingAPY: number;
  isLoading: boolean;
  error: string | null;
}

export function useStaking(): UseStakingReturn {
  const { address } = useAccount();
  const [stakingRewards, setStakingRewards] = useState<any[]>([]);
  const [stakingAPY, setStakingAPY] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stakeRewards = useCallback(async (rewards: StakingReward[]) => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await eventStakingService.stakeEventRewards(rewards);

      const successful = results.filter(r => r.success).length;
      const failed = results.length - successful;

      if (successful > 0) {
        toast.success(`Successfully staked rewards for ${successful} attendees`);
      }

      if (failed > 0) {
        toast.error(`Failed to stake rewards for ${failed} attendees`);
      }

      // Refresh rewards data
      await getStakingRewards();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to stake rewards';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  const getStakingRewards = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      const rewards = await eventStakingService.getStakingRewards(address);
      setStakingRewards(rewards);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get staking rewards';
      setError(errorMessage);
      console.error('Failed to get staking rewards:', error);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  const unstakeRewards = useCallback(async (amount: string) => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await eventStakingService.unstakeRewards(address, amount);

      if (result.success) {
        toast.success('Successfully unstaked rewards');
        // Refresh rewards data
        await getStakingRewards();
      } else {
        toast.error(result.error || 'Failed to unstake rewards');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unstake rewards';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [address, getStakingRewards]);

  const getStakingAPY = useCallback(async (): Promise<number> => {
    try {
      const apy = await eventStakingService.getStakingAPY();
      setStakingAPY(apy);
      return apy;
    } catch (error) {
      console.error('Failed to get staking APY:', error);
      return 5.0; // Default fallback
    }
  }, []);

  return {
    stakeRewards,
    getStakingRewards,
    unstakeRewards,
    getStakingAPY,
    stakingRewards,
    stakingAPY,
    isLoading,
    error,
  };
}
