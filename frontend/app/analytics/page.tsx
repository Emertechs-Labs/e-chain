/**
 * Analytics Dashboard Page
 * View comprehensive metrics for Farcaster Frame performance
 */

import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';

export const metadata = {
  title: 'Analytics Dashboard | Echain',
  description: 'Monitor Farcaster Frame performance, conversion funnels, and viral growth',
};

export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
