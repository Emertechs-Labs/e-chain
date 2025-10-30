'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useStaking } from '../../hooks/useStaking';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import { Button } from '../../components/ui';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Coins, TrendingUp, PiggyBank, Gift } from 'lucide-react';

interface EventStakingRewardsProps {
  eventId: string;
  attendees: string[];
  rewardAmount: string;
}

export function EventStakingRewards({ eventId, attendees, rewardAmount }: EventStakingRewardsProps) {
  const { address } = useAccount();
  const {
    stakeRewards,
    getStakingRewards,
    unstakeRewards,
    stakingRewards,
    stakingAPY,
    isLoading,
    error,
  } = useStaking();

  const [unstakeAmount, setUnstakeAmount] = useState('');

  // Load staking rewards when component mounts
  useEffect(() => {
    if (address) {
      getStakingRewards();
    }
  }, [address, getStakingRewards]);

  // Prepare staking rewards for attendees
  const prepareStakingRewards = () => {
    return attendees.map(attendee => ({
      eventId,
      attendeeAddress: attendee,
      rewardAmount,
      rewardType: 'attendance' as const,
    }));
  };

  const handleStakeRewards = async () => {
    const rewards = prepareStakingRewards();
    await stakeRewards(rewards);
  };

  const handleUnstakeRewards = async () => {
    if (!unstakeAmount) return;
    await unstakeRewards(unstakeAmount);
    setUnstakeAmount('');
  };

  if (!address) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Please connect your wallet to manage staking rewards.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Staking Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5" />
            Event Staking Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {stakingAPY.toFixed(2)}%
              </div>
              <div className="text-sm text-muted-foreground">Current APY</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {stakingRewards.length}
              </div>
              <div className="text-sm text-muted-foreground">Active Stakes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {attendees.length}
              </div>
              <div className="text-sm text-muted-foreground">Eligible Attendees</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stake Rewards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Stake Event Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Reward {rewardAmount} tokens per attendee
              </span>
              <Badge className="bg-secondary text-secondary-foreground">
                {attendees.length} attendees
              </Badge>
            </div>

            <Button
              onClick={handleStakeRewards}
              disabled={isLoading || attendees.length === 0}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Coins className="w-4 h-4 mr-2 animate-spin" />
                  Staking Rewards...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Stake Rewards for All Attendees
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Unstake Rewards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Unstake Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Amount to Unstake</label>
              <Input
                type="number"
                placeholder="0.0"
                value={unstakeAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUnstakeAmount(e.target.value)}
                className="mt-1"
              />
            </div>

            <Button
              onClick={handleUnstakeRewards}
              disabled={isLoading || !unstakeAmount}
              className="w-full border border-gray-300 bg-white text-gray-800 hover:bg-gray-100"
            >
              {isLoading ? (
                <>
                  <Coins className="w-4 h-4 mr-2 animate-spin" />
                  Unstaking...
                </>
              ) : (
                <>
                  <PiggyBank className="w-4 h-4 mr-2" />
                  Unstake Rewards
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-500">
          <CardContent className="p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Active Stakes */}
      {stakingRewards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Active Stakes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stakingRewards.map((reward: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">{reward.amount} {reward.asset}</div>
                    <div className="text-sm text-muted-foreground">
                      Staked on {new Date(reward.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge className="border border-gray-400 text-gray-700 bg-white">
                    {reward.rewardType}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
