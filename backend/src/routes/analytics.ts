/**
 * Analytics Routes
 * Event analytics and metrics tracking
 */

import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();

// Validation schemas
const trackEventSchema = z.object({
  eventId: z.string().cuid(),
  action: z.enum(['page_view', 'frame_view', 'frame_engage', 'wallet_connect', 'social_share']),
  referrer: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
});

const updateAnalyticsSchema = z.object({
  pageViews: z.number().int().min(0).optional(),
  uniqueVisitors: z.number().int().min(0).optional(),
  frameViews: z.number().int().min(0).optional(),
  frameEngages: z.number().int().min(0).optional(),
  walletConnects: z.number().int().min(0).optional(),
  socialShares: z.number().int().min(0).optional(),
});

/**
 * GET /api/analytics/event/:eventId
 * Get analytics for specific event
 */
router.get('/event/:eventId', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { eventId } = req.params;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new AppError(404, 'Event not found');
  }

  // Only organizer or admin can view analytics
  if (event.organizerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    throw new AppError(403, 'Only event organizer can view analytics');
  }

  const analytics = await prisma.eventAnalytics.findUnique({
    where: { eventId },
  });

  if (!analytics) {
    // Create empty analytics if doesn't exist
    const newAnalytics = await prisma.eventAnalytics.create({
      data: { eventId },
    });
    return res.json(newAnalytics);
  }

  // Calculate conversion rate
  const conversionRate = analytics.uniqueVisitors > 0
    ? (analytics.ticketPurchases / analytics.uniqueVisitors) * 100
    : 0;

  // Calculate engagement rate
  const engagementRate = analytics.frameViews > 0
    ? (analytics.frameEngages / analytics.frameViews) * 100
    : 0;

  res.json({
    ...analytics,
    metrics: {
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      engagementRate: parseFloat(engagementRate.toFixed(2)),
      averageRevenuePerTicket: analytics.ticketPurchases > 0
        ? parseFloat(analytics.totalRevenue.toString()) / analytics.ticketPurchases
        : 0,
    },
  });
}));

/**
 * POST /api/analytics/track
 * Track analytics event (public endpoint)
 */
router.post('/track', asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = trackEventSchema.parse(req.body);

  // Verify event exists
  const event = await prisma.event.findUnique({
    where: { id: data.eventId },
  });

  if (!event) {
    throw new AppError(404, 'Event not found');
  }

  // Get or create analytics record
  let analytics = await prisma.eventAnalytics.findUnique({
    where: { eventId: data.eventId },
  });

  if (!analytics) {
    analytics = await prisma.eventAnalytics.create({
      data: { eventId: data.eventId },
    });
  }

  // Update based on action
  const updateData: any = {};

  switch (data.action) {
    case 'page_view':
      updateData.pageViews = { increment: 1 };
      updateData.uniqueVisitors = { increment: 1 }; // In production, track unique IPs
      break;
    case 'frame_view':
      updateData.frameViews = { increment: 1 };
      break;
    case 'frame_engage':
      updateData.frameEngages = { increment: 1 };
      break;
    case 'wallet_connect':
      updateData.walletConnects = { increment: 1 };
      break;
    case 'social_share':
      updateData.socialShares = { increment: 1 };
      break;
  }

  // Track referrer
  if (data.referrer) {
    const topReferrers = (analytics.topReferrers as any[]) || [];
    const referrerIndex = topReferrers.findIndex(r => r.url === data.referrer);

    if (referrerIndex >= 0) {
      topReferrers[referrerIndex].count += 1;
    } else {
      topReferrers.push({ url: data.referrer, count: 1 });
    }

    // Sort and keep top 10
    topReferrers.sort((a, b) => b.count - a.count);
    updateData.topReferrers = topReferrers.slice(0, 10);
  }

  await prisma.eventAnalytics.update({
    where: { eventId: data.eventId },
    data: updateData,
  });

  res.json({
    message: 'Analytics tracked successfully',
  });
}));

/**
 * PUT /api/analytics/event/:eventId
 * Update analytics manually (organizer only)
 */
router.put('/event/:eventId', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { eventId } = req.params;
  const data = updateAnalyticsSchema.parse(req.body);

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new AppError(404, 'Event not found');
  }

  if (event.organizerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    throw new AppError(403, 'Only event organizer can update analytics');
  }

  const analytics = await prisma.eventAnalytics.upsert({
    where: { eventId },
    create: {
      eventId,
      ...data,
    },
    update: data,
  });

  res.json(analytics);
}));

/**
 * GET /api/analytics/dashboard
 * Get organizer's dashboard analytics
 */
router.get('/dashboard', authenticate, authorize('ORGANIZER', 'ADMIN'), asyncHandler(async (req: AuthRequest, res: Response) => {
  // Get all events by organizer
  const events = await prisma.event.findMany({
    where: { organizerId: req.user!.id },
    include: {
      _count: {
        select: {
          tickets: true,
        },
      },
    },
  });

  const eventIds = events.map((e: any) => e.id);

  // Get analytics for all events
  const analytics = await prisma.eventAnalytics.findMany({
    where: { eventId: { in: eventIds } },
  });

  // Calculate totals
  const totals = analytics.reduce<{
    totalEvents: number;
    totalPageViews: number;
    totalUniqueVisitors: number;
    totalFrameViews: number;
    totalFrameEngages: number;
    totalWalletConnects: number;
    totalTicketPurchases: number;
    totalSocialShares: number;
    totalRevenue: number;
  }>(
    (acc: {
      totalEvents: number;
      totalPageViews: number;
      totalUniqueVisitors: number;
      totalFrameViews: number;
      totalFrameEngages: number;
      totalWalletConnects: number;
      totalTicketPurchases: number;
      totalSocialShares: number;
      totalRevenue: number;
    }, a: any) => ({
      totalEvents: events.length,
      totalPageViews: acc.totalPageViews + a.pageViews,
      totalUniqueVisitors: acc.totalUniqueVisitors + a.uniqueVisitors,
      totalFrameViews: acc.totalFrameViews + a.frameViews,
      totalFrameEngages: acc.totalFrameEngages + a.frameEngages,
      totalWalletConnects: acc.totalWalletConnects + a.walletConnects,
      totalTicketPurchases: acc.totalTicketPurchases + a.ticketPurchases,
      totalSocialShares: acc.totalSocialShares + a.socialShares,
      totalRevenue: acc.totalRevenue + parseFloat(a.totalRevenue.toString()),
    }),
    {
      totalEvents: 0,
      totalPageViews: 0,
      totalUniqueVisitors: 0,
      totalFrameViews: 0,
      totalFrameEngages: 0,
      totalWalletConnects: 0,
      totalTicketPurchases: 0,
      totalSocialShares: 0,
      totalRevenue: 0,
    }
  );

  // Calculate average metrics
  const avgConversionRate = totals.totalUniqueVisitors > 0
    ? (totals.totalTicketPurchases / totals.totalUniqueVisitors) * 100
    : 0;

  const avgEngagementRate = totals.totalFrameViews > 0
    ? (totals.totalFrameEngages / totals.totalFrameViews) * 100
    : 0;

  const avgViralCoefficient = analytics.length > 0
    ? analytics.reduce((sum: number, a: any) => sum + parseFloat(a.viralCoefficient.toString()), 0) / analytics.length
    : 0;

  // Get top performing events
  const topEvents = events
    .map((event: any): { id: string; name: string; ticketsSold: number; revenue: number; conversionRate: number } => {
      const eventAnalytics = analytics.find((a: any) => a.eventId === event.id);
      return {
        id: event.id,
        name: event.name,
        ticketsSold: event.ticketsSold,
        revenue: eventAnalytics ? parseFloat(eventAnalytics.totalRevenue.toString()) : 0,
        conversionRate: eventAnalytics && eventAnalytics.uniqueVisitors > 0
          ? (eventAnalytics.ticketPurchases / eventAnalytics.uniqueVisitors) * 100
          : 0,
      };
    })
    .sort((a: { id: string; name: string; ticketsSold: number; revenue: number; conversionRate: number }, b: { id: string; name: string; ticketsSold: number; revenue: number; conversionRate: number }) => b.revenue - a.revenue)
    .slice(0, 5);

  res.json({
    summary: {
      ...totals,
      avgConversionRate: parseFloat(avgConversionRate.toFixed(2)),
      avgEngagementRate: parseFloat(avgEngagementRate.toFixed(2)),
      avgViralCoefficient: parseFloat(avgViralCoefficient.toFixed(2)),
      avgRevenuePerEvent: events.length > 0 ? totals.totalRevenue / events.length : 0,
    },
    topEvents,
    recentEvents: events.slice(0, 10).map((e: any) => ({
      id: e.id,
      name: e.name,
      startDate: e.startDate,
      ticketsSold: e.ticketsSold,
      maxCapacity: e.maxCapacity,
      status: e.status,
    })),
  });
}));

/**
 * GET /api/analytics/event/:eventId/funnel
 * Get conversion funnel data for event
 */
router.get('/event/:eventId/funnel', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { eventId } = req.params;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new AppError(404, 'Event not found');
  }

  if (event.organizerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    throw new AppError(403, 'Only event organizer can view funnel');
  }

  const analytics = await prisma.eventAnalytics.findUnique({
    where: { eventId },
  });

  if (!analytics) {
    return res.json({
      funnel: [],
      dropoffRates: {},
    });
  }

  // Conversion funnel stages
  const funnel = [
    {
      stage: 'Page Views',
      count: analytics.pageViews,
      percentage: 100,
    },
    {
      stage: 'Frame Views',
      count: analytics.frameViews,
      percentage: analytics.pageViews > 0 ? (analytics.frameViews / analytics.pageViews) * 100 : 0,
    },
    {
      stage: 'Frame Engagements',
      count: analytics.frameEngages,
      percentage: analytics.frameViews > 0 ? (analytics.frameEngages / analytics.frameViews) * 100 : 0,
    },
    {
      stage: 'Wallet Connects',
      count: analytics.walletConnects,
      percentage: analytics.frameEngages > 0 ? (analytics.walletConnects / analytics.frameEngages) * 100 : 0,
    },
    {
      stage: 'Ticket Purchases',
      count: analytics.ticketPurchases,
      percentage: analytics.walletConnects > 0 ? (analytics.ticketPurchases / analytics.walletConnects) * 100 : 0,
    },
  ];

  // Calculate drop-off rates
  const dropoffRates = {
    'Page to Frame': 100 - funnel[1].percentage,
    'Frame to Engage': 100 - funnel[2].percentage,
    'Engage to Connect': 100 - funnel[3].percentage,
    'Connect to Purchase': 100 - funnel[4].percentage,
  };

  res.json({
    funnel: funnel.map(f => ({
      ...f,
      percentage: parseFloat(f.percentage.toFixed(2)),
    })),
    dropoffRates: Object.entries(dropoffRates).reduce((acc, [key, value]) => {
      acc[key] = parseFloat(value.toFixed(2));
      return acc;
    }, {} as Record<string, number>),
    overallConversionRate: analytics.pageViews > 0
      ? parseFloat(((analytics.ticketPurchases / analytics.pageViews) * 100).toFixed(2))
      : 0,
  });
}));

/**
 * GET /api/analytics/event/:eventId/referrers
 * Get top referrers for event
 */
router.get('/event/:eventId/referrers', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { eventId } = req.params;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new AppError(404, 'Event not found');
  }

  if (event.organizerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    throw new AppError(403, 'Only event organizer can view referrers');
  }

  const analytics = await prisma.eventAnalytics.findUnique({
    where: { eventId },
    select: {
      topReferrers: true,
    },
  });

  res.json({
    referrers: analytics?.topReferrers || [],
  });
}));

export default router;
