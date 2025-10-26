/**
 * Farcaster Mini App Integration
 * Provides hooks and utilities for Farcaster Frame interactions
 * Includes comprehensive analytics, attribution, and A/B testing
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import sdk from '@farcaster/frame-sdk';

// Analytics Types
interface ConversionFunnel {
  step: 'view' | 'engage' | 'connect' | 'purchase' | 'share';
  eventId: string;
  timestamp: number;
  fid?: number;
  metadata?: Record<string, any>;
}

interface ReferralData {
  referrerId?: number;
  referrerUsername?: string;
  source: 'direct' | 'share' | 'recast' | 'quote';
  campaignId?: string;
}

interface ViralMetrics {
  shares: number;
  conversions: number;
  viralCoefficient: number; // conversions per share
  kFactor: number; // viral loop metric
}

interface ABTestVariant {
  variantId: string;
  variantName: string;
  experimentId: string;
}

interface FrameContext {
  user: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  } | null;
  isSDKLoaded: boolean;
  error: string | null;
}

/**
 * Hook to initialize and manage Farcaster Frame SDK
 */
export function useFarcasterFrame() {
  const [context, setContext] = useState<FrameContext>({
    user: null,
    isSDKLoaded: false,
    error: null,
  });

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        // Initialize Frame SDK
        await sdk.actions.ready();

        // Get frame context
        const frameContext = await sdk.context;

        if (frameContext?.user) {
          setContext({
            user: {
              fid: frameContext.user.fid,
              username: frameContext.user.username,
              displayName: frameContext.user.displayName,
              pfpUrl: frameContext.user.pfpUrl,
            },
            isSDKLoaded: true,
            error: null,
          });
        } else {
          setContext((prev) => ({
            ...prev,
            isSDKLoaded: true,
          }));
        }
      } catch (error) {
        console.error('Failed to initialize Farcaster SDK:', error);
        setContext((prev) => ({
          ...prev,
          isSDKLoaded: true,
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
      }
    };

    initializeSDK();
  }, []);

  return context;
}

/**
 * Hook for Frame wallet operations
 */
export function useFarcasterWallet() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Request wallet connection through Frame SDK
      const result = await sdk.wallet.ethProvider.request({
        method: 'eth_requestAccounts',
      });

      const address = result[0];
      setWalletAddress(address);
      return address;
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const sendTransaction = useCallback(
    async (params: {
      to: string;
      value?: string;
      data?: string;
    }) => {
      try {
        // Send transaction through Frame SDK
        const txHash = await sdk.wallet.ethProvider.request({
          method: 'eth_sendTransaction',
          params: [
            {
              from: walletAddress as `0x${string}`,
              to: params.to as `0x${string}`,
              value: params.value ? `0x${parseInt(params.value).toString(16)}` : undefined,
              data: params.data as `0x${string}`,
            },
          ],
        });

        return txHash;
      } catch (error) {
        console.error('Transaction failed:', error);
        throw error;
      }
    },
    [walletAddress]
  );

  return {
    walletAddress,
    isConnecting,
    connectWallet,
    sendTransaction,
  };
}

/**
 * Hook for Frame analytics and attribution with conversion funnels,
 * viral coefficient tracking, and A/B testing
 */
export function useFarcasterAnalytics() {
  const sessionId = useRef(generateSessionId());
  const funnelSteps = useRef<ConversionFunnel[]>([]);
  const referralData = useRef<ReferralData | null>(null);
  const abVariant = useRef<ABTestVariant | null>(null);

  // Initialize referral tracking from URL params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const referrer = params.get('ref');
      const source = params.get('source') as ReferralData['source'];
      const campaign = params.get('campaign');

      if (referrer || source) {
        referralData.current = {
          referrerId: referrer ? parseInt(referrer, 10) : undefined,
          source: source || 'direct',
          campaignId: campaign || undefined,
        };
      }
    }
  }, []);

  /**
   * Track any custom event with attribution data
   */
  const trackEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    try {
      const payload = {
        ...properties,
        timestamp: Date.now(),
        sessionId: sessionId.current,
        source: 'farcaster-frame',
        referral: referralData.current,
        variant: abVariant.current,
      };

      // Send to analytics endpoint
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventName,
          properties: payload,
        }),
      }).catch(err => console.debug('Analytics send failed:', err));

      // Also send to client-side analytics if available
      if (typeof window !== 'undefined' && (window as any).farcasterAnalytics) {
        (window as any).farcasterAnalytics.track(eventName, payload);
      }
    } catch (error) {
      console.debug('Analytics tracking error:', error);
    }
  }, []);

  /**
   * Track conversion funnel step
   */
  const trackFunnelStep = useCallback(
    async (step: ConversionFunnel['step'], eventId: string, metadata?: Record<string, any>) => {
      const context = await sdk.context;
      const funnelEvent: ConversionFunnel = {
        step,
        eventId,
        timestamp: Date.now(),
        fid: context?.user?.fid,
        metadata,
      };

      funnelSteps.current.push(funnelEvent);

      trackEvent(`funnel_${step}`, {
        eventId,
        step,
        fid: context?.user?.fid,
        stepIndex: funnelSteps.current.length,
        ...metadata,
      });
    },
    [trackEvent]
  );

  /**
   * Track event view (top of funnel)
   */
  const trackView = useCallback(
    (eventId: string, metadata?: Record<string, any>) => {
      trackFunnelStep('view', eventId, metadata);
    },
    [trackFunnelStep]
  );

  /**
   * Track engagement (button click, scroll, etc.)
   */
  const trackEngage = useCallback(
    (eventId: string, engagementType: string, metadata?: Record<string, any>) => {
      trackFunnelStep('engage', eventId, { engagementType, ...metadata });
    },
    [trackFunnelStep]
  );

  /**
   * Track wallet connection
   */
  const trackConnect = useCallback(
    (eventId: string, walletAddress: string) => {
      trackFunnelStep('connect', eventId, { walletAddress });
    },
    [trackFunnelStep]
  );

  /**
   * Track purchase with conversion data
   */
  const trackPurchase = useCallback(
    async (eventId: string, value: string, quantity: number = 1) => {
      const context = await sdk.context;

      trackFunnelStep('purchase', eventId, {
        value,
        quantity,
        revenue: parseFloat(value) * quantity,
      });

      // Calculate conversion rate from this session's funnel
      const viewStep = funnelSteps.current.find(s => s.step === 'view' && s.eventId === eventId);
      const conversionTime = viewStep ? Date.now() - viewStep.timestamp : null;

      trackEvent('conversion_complete', {
        eventId,
        value,
        quantity,
        fid: context?.user?.fid,
        conversionTime,
        funnelSteps: funnelSteps.current.length,
      });
    },
    [trackFunnelStep, trackEvent]
  );

  /**
   * Track share event for viral coefficient
   */
  const trackShare = useCallback(
    async (eventId: string, shareType: 'cast' | 'recast' | 'quote' = 'cast') => {
      const context = await sdk.context;

      trackFunnelStep('share', eventId, { shareType });

      trackEvent('viral_share', {
        eventId,
        shareType,
        fid: context?.user?.fid,
        username: context?.user?.username,
        referralUrl: `${window.location.origin}/events/${eventId}?ref=${context?.user?.fid}&source=share`,
      });
    },
    [trackFunnelStep, trackEvent]
  );

  /**
   * Calculate viral metrics for an event
   */
  const getViralMetrics = useCallback((eventId: string): ViralMetrics => {
    const shares = funnelSteps.current.filter(
      s => s.step === 'share' && s.eventId === eventId
    ).length;

    const conversions = funnelSteps.current.filter(
      s => s.step === 'purchase' && s.eventId === eventId
    ).length;

    const viralCoefficient = shares > 0 ? conversions / shares : 0;
    const kFactor = viralCoefficient * shares; // Simplified k-factor

    return {
      shares,
      conversions,
      viralCoefficient,
      kFactor,
    };
  }, []);

  /**
   * Set A/B test variant for this session
   */
  const setABVariant = useCallback((experimentId: string, variantId: string, variantName: string) => {
    abVariant.current = {
      experimentId,
      variantId,
      variantName,
    };

    trackEvent('ab_variant_assigned', {
      experimentId,
      variantId,
      variantName,
    });
  }, [trackEvent]);

  /**
   * Track A/B test conversion
   */
  const trackABConversion = useCallback(
    (conversionGoal: string, value?: number) => {
      if (!abVariant.current) return;

      trackEvent('ab_conversion', {
        experimentId: abVariant.current.experimentId,
        variantId: abVariant.current.variantId,
        variantName: abVariant.current.variantName,
        conversionGoal,
        value,
      });
    },
    [trackEvent]
  );

  /**
   * Get conversion funnel summary
   */
  const getFunnelSummary = useCallback((eventId: string) => {
    const eventSteps = funnelSteps.current.filter(s => s.eventId === eventId);

    const summary = {
      views: eventSteps.filter(s => s.step === 'view').length,
      engagements: eventSteps.filter(s => s.step === 'engage').length,
      connects: eventSteps.filter(s => s.step === 'connect').length,
      purchases: eventSteps.filter(s => s.step === 'purchase').length,
      shares: eventSteps.filter(s => s.step === 'share').length,
    };

    return {
      ...summary,
      viewToEngageRate: summary.views > 0 ? summary.engagements / summary.views : 0,
      engageToConnectRate: summary.engagements > 0 ? summary.connects / summary.engagements : 0,
      connectToPurchaseRate: summary.connects > 0 ? summary.purchases / summary.connects : 0,
      overallConversionRate: summary.views > 0 ? summary.purchases / summary.views : 0,
    };
  }, []);

  return {
    // Core tracking
    trackEvent,
    trackView,
    trackEngage,
    trackConnect,
    trackPurchase,
    trackShare,

    // Funnel analysis
    trackFunnelStep,
    getFunnelSummary,

    // Viral metrics
    getViralMetrics,

    // A/B testing
    setABVariant,
    trackABConversion,

    // Session data
    sessionId: sessionId.current,
    referralData: referralData.current,
    currentVariant: abVariant.current,
  };
}

/**
 * Generate unique session ID
 */
function generateSessionId(): string {
  return `fs_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Hook to check if running inside Farcaster Frame
 */
export function useIsInFrame() {
  const [isInFrame, setIsInFrame] = useState(false);

  useEffect(() => {
    const checkFrame = async () => {
      try {
        const context = await sdk.context;
        setIsInFrame(!!context?.client);
      } catch {
        setIsInFrame(false);
      }
    };

    checkFrame();
  }, []);

  return isInFrame;
}

/**
 * Utility to open external link from Frame
 */
export function openExternalLink(url: string) {
  sdk.actions.openUrl(url);
}

/**
 * Utility to close Frame
 */
export function closeFrame() {
  sdk.actions.close();
}
