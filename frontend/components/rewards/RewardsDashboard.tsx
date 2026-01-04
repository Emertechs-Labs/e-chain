'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useUserRewards, useEarlyBirdStatus, useUserLoyaltyPoints, useUserReferralRewards } from '@/app/hooks/useIncentives';
import { useClaimIncentives } from '@/app/hooks/useTransactions';
import { ReferralCodeGenerator } from './ReferralCodeGenerator';
import { Trophy, Star, Users, Gift } from 'lucide-react';
import { toast } from 'sonner';

interface RewardsDashboardProps {
  eventId?: number;
  ticketContract?: string;
}

export function RewardsDashboard({ eventId, ticketContract }: RewardsDashboardProps) {
  const { address } = useAccount();
  const [claimingType, setClaimingType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const { data: rewards = [], isLoading: rewardsLoading } = useUserRewards();
  const { data: earlyBirdStatus, isLoading: earlyBirdLoading } = useEarlyBirdStatus(eventId || 0, ticketContract);
  const { data: loyaltyPoints = 0, isLoading: loyaltyLoading } = useUserLoyaltyPoints();
  const { data: referralRewards = 0, isLoading: referralLoading } = useUserReferralRewards();

  const claimIncentives = useClaimIncentives();

  const handleClaimEarlyBird = async () => {
    if (!eventId) return;

    setClaimingType('early-bird');
    try {
      await claimIncentives.mutateAsync({
        eventId,
        incentiveType: 'early-bird'
      });
      toast.success('Early bird reward claimed successfully!');
    } catch (error) {
      toast.error('Failed to claim early bird reward');
      console.error('Early bird claim error:', error);
    } finally {
      setClaimingType(null);
    }
  };

  const handleClaimLoyaltyReward = async () => {
    setClaimingType('loyalty');
    try {
      await claimIncentives.mutateAsync({
        incentiveType: 'loyalty'
      });
      toast.success('Loyalty reward claimed successfully!');
    } catch (error) {
      toast.error('Failed to claim loyalty reward');
      console.error('Loyalty claim error:', error);
    } finally {
      setClaimingType(null);
    }
  };

  const handleClaimReferralReward = async () => {
    setClaimingType('referral');
    try {
      await claimIncentives.mutateAsync({
        incentiveType: 'referral'
      });
      toast.success('Referral reward claimed successfully!');
    } catch (error) {
      toast.error('Failed to claim referral reward');
      console.error('Referral claim error:', error);
    } finally {
      setClaimingType(null);
    }
  };

  if (!address) {
    return (
      <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
        <div className="text-center">
          <div className="text-6xl mb-6">🏆</div>
          <h2 className="text-3xl font-bold text-white mb-4">Rewards Dashboard</h2>
          <p className="text-gray-400">Connect your wallet to view and claim rewards</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="h-6 w-6 text-cyan-400" />
          <h2 className="text-2xl font-bold text-white">Rewards Dashboard</h2>
        </div>
        <p className="text-gray-400 mb-6">
          View your earned rewards and claim new incentives
        </p>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-slate-700/50 p-1 rounded-lg">
          {['overview', 'rewards', 'early-bird', 'loyalty', 'referral'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-cyan-500 text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'overview' ? 'Overview' :
               tab === 'rewards' ? 'My Rewards' :
               tab === 'early-bird' ? 'Early Bird' :
               tab === 'loyalty' ? 'Loyalty' : 'Referral'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-700/50 backdrop-blur-sm p-4 rounded-xl border border-slate-600 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{rewards.length}</div>
                <div className="text-gray-400 text-sm">Total Rewards</div>
              </div>

              <div className="bg-slate-700/50 backdrop-blur-sm p-4 rounded-xl border border-slate-600 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-6 w-6 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{loyaltyPoints}</div>
                <div className="text-gray-400 text-sm">Loyalty Points</div>
              </div>

              <div className="bg-slate-700/50 backdrop-blur-sm p-4 rounded-xl border border-slate-600 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{referralRewards}</div>
                <div className="text-gray-400 text-sm">Referral Rewards</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="space-y-4">
            {rewardsLoading ? (
              <div className="text-center py-8">Loading rewards...</div>
            ) : rewards.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No rewards earned yet. Participate in events to earn rewards!
              </div>
            ) : (
              rewards.map((reward) => (
                <div key={reward.rewardId} className="bg-slate-700/50 backdrop-blur-sm p-4 rounded-xl border border-slate-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white capitalize">{reward.rewardType} Reward</p>
                      <p className="text-sm text-gray-400">
                        Event #{reward.eventId} • {new Date(reward.timestamp * 1000).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                      <Gift className="h-3 w-3 inline mr-1" />
                      Claimed
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'early-bird' && (
          <div className="space-y-4">
            {earlyBirdLoading ? (
              <div className="text-center py-8">Loading early bird status...</div>
            ) : (
              <div className="bg-slate-700/50 backdrop-blur-sm p-6 rounded-xl border border-slate-600">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-xl font-bold text-white">Early Bird Rewards</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Claim rewards for being among the first ticket buyers
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-400">Tickets Sold</p>
                    <p className="font-medium text-white">{earlyBirdStatus?.totalSold || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Early Bird Limit</p>
                    <p className="font-medium text-white">{earlyBirdStatus?.earlyBirdLimit || 10}</p>
                  </div>
                </div>

                {earlyBirdStatus?.hasClaimed ? (
                  <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-green-500/20 text-green-400 w-full justify-center">
                    <Trophy className="h-4 w-4 mr-2" />
                    Early Bird Reward Claimed
                  </span>
                ) : earlyBirdStatus?.canClaim ? (
                  <button
                    onClick={handleClaimEarlyBird}
                    disabled={claimingType === 'early-bird'}
                    className="bg-cyan-500 text-black px-4 py-2 rounded-lg hover:bg-cyan-400 transition-colors w-full font-medium disabled:opacity-50"
                  >
                    {claimingType === 'early-bird' ? 'Claiming...' : 'Claim Early Bird Reward'}
                  </button>
                ) : (
                  <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-gray-500/20 text-gray-400 w-full justify-center">
                    Not Eligible for Early Bird
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'loyalty' && (
          <div className="space-y-4">
            <div className="bg-slate-700/50 backdrop-blur-sm p-6 rounded-xl border border-slate-600">
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-blue-400" />
                <h3 className="text-xl font-bold text-white">Loyalty Points</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Earn points for each event you attend and POAP you collect. Redeem points for special rewards.
              </p>

              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-blue-400 mb-1">{loyaltyPoints}</p>
                <p className="text-sm text-gray-400">Loyalty Points</p>
              </div>

              {loyaltyPoints >= 10 ? (
                <button
                  onClick={handleClaimLoyaltyReward}
                  disabled={claimingType === 'loyalty'}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-400 transition-colors w-full font-medium disabled:opacity-50"
                >
                  {claimingType === 'loyalty' ? 'Claiming...' : 'Claim Loyalty Reward'}
                </button>
              ) : (
                <div className="text-center text-sm text-gray-400">
                  Earn {10 - loyaltyPoints} more points to claim a reward
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'referral' && (
          <div className="space-y-4">
            <ReferralCodeGenerator />

            <div className="bg-slate-700/50 backdrop-blur-sm p-6 rounded-xl border border-slate-600">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-green-400" />
                <h3 className="text-xl font-bold text-white">Referral Stats</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Track your referral performance and earnings.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400 mb-1">{referralRewards}</p>
                  <p className="text-sm text-gray-400">Successful Referrals</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400 mb-1">{referralRewards * 10}</p>
                  <p className="text-sm text-gray-400">Points Earned</p>
                </div>
              </div>

              {referralRewards > 0 && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-sm text-green-400">
                    🎉 You&apos;ve earned {referralRewards * 10} loyalty points from referrals!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}