'use client';

import { useAccount } from 'wagmi';
import Link from 'next/link';
import { RewardsDashboard } from "@/components/rewards/RewardsDashboard";
import { Trophy, Star, Users, Gift, ArrowLeft } from 'lucide-react';

const RewardsPage: React.FC = () => {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">🏆</div>
          <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-8">Connect your wallet to view your rewards and incentives</p>
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-lg cursor-pointer">
            Connect Wallet
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 mb-6 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Back to Home</span>
              </Link>
              <div className="inline-flex items-center gap-2 mb-6 text-cyan-400">
                <span className="text-purple-400">🏆</span>
                <span className="text-sm font-medium">Rewards Center</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Rewards & Incentives</h1>
              <p className="text-gray-400 max-w-2xl">
                Earn rewards through early bird purchases, event attendance, and referral programs.
                Your blockchain-verified achievements and incentives in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Rewards Work */}
      <section className="py-16 bg-slate-800/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">How Rewards Work</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
                  <Trophy className="h-8 w-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Early Bird Rewards</h3>
                <p className="text-gray-400">
                  Be among the first 10 ticket buyers for any event and earn exclusive early bird rewards.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                  <Star className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Loyalty Points</h3>
                <p className="text-gray-400">
                  Earn points for each event you attend and POAP you collect. Redeem points for special rewards.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                  <Users className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Referral Program</h3>
                <p className="text-gray-400">
                  Share referral codes and earn rewards when friends purchase tickets using your code.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rewards Dashboard */}
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <RewardsDashboard />
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 bg-slate-800/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Quick Actions</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link
                href="/events"
                className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 text-center group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30 group-hover:scale-110 transition-transform">
                  <Gift className="h-6 w-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Browse Events</h3>
                <p className="text-gray-400 text-sm">Find events and earn rewards</p>
              </Link>

              <Link
                href="/my-tickets"
                className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 text-center group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🎫</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">My Tickets</h3>
                <p className="text-gray-400 text-sm">View your NFT tickets</p>
              </Link>

              <Link
                href="/poaps"
                className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 text-center group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">My POAPs</h3>
                <p className="text-gray-400 text-sm">View attendance certificates</p>
              </Link>

              <Link
                href="/my-events"
                className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 text-center group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500/20 to-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-pink-500/30 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-pink-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">My Events</h3>
                <p className="text-gray-400 text-sm">Manage your organized events</p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RewardsPage;