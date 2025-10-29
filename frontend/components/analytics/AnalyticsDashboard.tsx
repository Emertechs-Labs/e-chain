/**
 * Analytics Dashboard Component
 * Real-time monitoring of Frame performance, conversion funnels, and viral metrics
 */

'use client';

import { useState, useEffect } from 'react';

interface DashboardMetrics {
  totalViews: number;
  totalEngagements: number;
  totalConnects: number;
  totalPurchases: number;
  totalShares: number;
  conversionRate: number;
  viralCoefficient: number;
  kFactor: number;
  averageRevenuePerUser: number;
}

interface FunnelMetrics {
  views: number;
  engagements: number;
  connects: number;
  purchases: number;
  shares: number;
  viewToEngageRate: number;
  engageToConnectRate: number;
  connectToPurchaseRate: number;
  overallConversionRate: number;
}

interface ViralMetrics {
  shares: number;
  conversions: number;
  viralCoefficient: number;
  kFactor: number;
  topReferrers: Array<{
    fid: number;
    username?: string;
    referrals: number;
    conversions: number;
  }>;
}

export function AnalyticsDashboard({ eventId }: { eventId?: string }) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [funnelData, setFunnelData] = useState<FunnelMetrics | null>(null);
  const [viralData, setViralData] = useState<ViralMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const params = new URLSearchParams({
          timeRange,
          ...(eventId && { eventId }),
        });

        const response = await fetch(`/api/analytics/dashboard?${params}`);
        if (!response.ok) throw new Error('Failed to fetch metrics');

        const data = await response.json();
        setMetrics(data.overview);
        setFunnelData(data.funnel);
        setViralData(data.viral);
      } catch (error) {
        console.error('Dashboard metrics error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [eventId, timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Farcaster Analytics</h1>
            <p className="text-gray-600 mt-1">
              {eventId ? `Event ${eventId}` : 'All Events'}
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2">
            {(['1h', '24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Views"
            value={metrics?.totalViews || 0}
            icon="👁️"
            trend="+12%"
          />
          <MetricCard
            title="Conversions"
            value={metrics?.totalPurchases || 0}
            icon="💰"
            trend="+8%"
            trendUp
          />
          <MetricCard
            title="Conversion Rate"
            value={`${((metrics?.conversionRate || 0) * 100).toFixed(2)}%`}
            icon="📊"
            trend="-2%"
          />
          <MetricCard
            title="Viral Coefficient"
            value={metrics?.viralCoefficient.toFixed(2) || '0.00'}
            icon="🔄"
            trend="+15%"
            trendUp
          />
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Conversion Funnel</h2>
          {funnelData && (
            <div className="space-y-4">
              <FunnelStep
                label="Views"
                count={funnelData.views}
                total={funnelData.views}
                icon="👁️"
              />
              <FunnelStep
                label="Engagements"
                count={funnelData.engagements}
                total={funnelData.views}
                dropoffRate={1 - funnelData.viewToEngageRate}
                icon="👆"
              />
              <FunnelStep
                label="Wallet Connects"
                count={funnelData.connects}
                total={funnelData.views}
                dropoffRate={1 - (funnelData.connects / funnelData.views)}
                icon="🔗"
              />
              <FunnelStep
                label="Purchases"
                count={funnelData.purchases}
                total={funnelData.views}
                dropoffRate={1 - funnelData.overallConversionRate}
                icon="✅"
              />
            </div>
          )}
        </div>

        {/* Viral Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Viral Growth</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Shares</span>
                <span className="text-2xl font-bold text-blue-600">
                  {viralData?.shares || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Referral Conversions</span>
                <span className="text-2xl font-bold text-green-600">
                  {viralData?.conversions || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">K-Factor</span>
                <span className="text-2xl font-bold text-purple-600">
                  {viralData?.kFactor.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </div>

          {/* Top Referrers */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Top Referrers</h2>
            <div className="space-y-3">
              {viralData?.topReferrers.slice(0, 5).map((referrer, index) => (
                <div
                  key={referrer.fid}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                    <div>
                      <div className="font-medium text-gray-900">
                        {referrer.username || `FID ${referrer.fid}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {referrer.referrals} referrals, {referrer.conversions} conversions
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      {((referrer.conversions / referrer.referrals) * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">conversion</div>
                  </div>
                </div>
              )) || (
                <div className="text-center text-gray-500 py-8">No referral data yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  trend,
  trendUp,
}: {
  title: string;
  value: number | string;
  icon: string;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-600 text-sm font-medium">{title}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      {trend && (
        <div
          className={`text-sm font-medium ${
            trendUp ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {trend}
        </div>
      )}
    </div>
  );
}

function FunnelStep({
  label,
  count,
  total,
  dropoffRate,
  icon,
}: {
  label: string;
  count: number;
  total: number;
  dropoffRate?: number;
  icon: string;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="font-medium text-gray-900">{label}</span>
        </div>
        <div className="text-right">
          <div className="font-bold text-gray-900">{count.toLocaleString()}</div>
          <div className="text-sm text-gray-500">{percentage.toFixed(1)}%</div>
        </div>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {dropoffRate !== undefined && dropoffRate > 0 && (
        <div className="text-xs text-red-600 mt-1">
          -{(dropoffRate * 100).toFixed(1)}% drop-off
        </div>
      )}
    </div>
  );
}
