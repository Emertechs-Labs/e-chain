/**
 * A/B Testing Utilities for Farcaster Frames
 * Client-side experiment assignment and variant tracking
 */

'use client';

import { useState, useEffect } from 'react';
import { useFarcasterAnalytics } from './useFarcasterFrame';

export interface Experiment {
  id: string;
  name: string;
  variants: ExperimentVariant[];
  traffic: number; // 0-1, percentage of users to include
  active: boolean;
}

export interface ExperimentVariant {
  id: string;
  name: string;
  weight: number; // 0-1, relative weight for assignment
  config?: Record<string, any>;
}

/**
 * Hook for A/B testing in frames
 */
export function useABTest(experimentId: string) {
  const { setABVariant, trackABConversion } = useFarcasterAnalytics();
  const [variant, setVariant] = useState<ExperimentVariant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const assignVariant = async () => {
      try {
        // Check if user already has an assignment
        const storageKey = `ab_${experimentId}`;
        const stored = localStorage.getItem(storageKey);

        if (stored) {
          const parsed = JSON.parse(stored);
          setVariant(parsed);
          setABVariant(experimentId, parsed.id, parsed.name);
          setIsLoading(false);
          return;
        }

        // Fetch experiment configuration
        const response = await fetch(`/api/experiments/${experimentId}`);
        if (!response.ok) {
          setIsLoading(false);
          return;
        }

        const experiment: Experiment = await response.json();

        // Check if experiment is active
        if (!experiment.active) {
          setIsLoading(false);
          return;
        }

        // Check if user is in traffic sample
        const trafficRoll = Math.random();
        if (trafficRoll > experiment.traffic) {
          setIsLoading(false);
          return;
        }

        // Assign variant based on weights
        const assignedVariant = assignVariantByWeight(experiment.variants);
        
        // Store assignment
        localStorage.setItem(storageKey, JSON.stringify(assignedVariant));
        
        setVariant(assignedVariant);
        setABVariant(experimentId, assignedVariant.id, assignedVariant.name);
        setIsLoading(false);
      } catch (error) {
        console.error('A/B test assignment error:', error);
        setIsLoading(false);
      }
    };

    assignVariant();
  }, [experimentId, setABVariant]);

  return {
    variant,
    isLoading,
    trackConversion: trackABConversion,
  };
}

/**
 * Assign variant based on weighted distribution
 */
function assignVariantByWeight(variants: ExperimentVariant[]): ExperimentVariant {
  // Normalize weights
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
  const normalizedVariants = variants.map(v => ({
    ...v,
    weight: v.weight / totalWeight,
  }));

  // Roll for variant
  const roll = Math.random();
  let cumulative = 0;

  for (const variant of normalizedVariants) {
    cumulative += variant.weight;
    if (roll <= cumulative) {
      return variant;
    }
  }

  // Fallback to first variant
  return variants[0];
}

/**
 * Hook for frame-specific A/B tests
 */
export function useFrameButtonTest(eventId: string) {
  const { variant, isLoading, trackConversion } = useABTest(`frame_buttons_${eventId}`);

  // Default button configuration
  const defaultButtons = {
    primaryText: 'Get Ticket',
    secondaryText: 'View Event',
    primaryColor: '#10b981', // green-500
    layout: 'horizontal' as 'horizontal' | 'vertical',
  };

  // Get button config from variant or use default
  const buttonConfig = variant?.config || defaultButtons;

  return {
    buttonConfig,
    isLoading,
    trackButtonClick: (buttonId: string) => {
      trackConversion('button_click', 1);
    },
  };
}

/**
 * Hook for price display A/B test
 */
export function usePriceDisplayTest(eventId: string) {
  const { variant, isLoading, trackConversion } = useABTest(`price_display_${eventId}`);

  const defaultConfig = {
    format: 'eth' as 'eth' | 'usd' | 'both',
    showDiscount: false,
    emphasize: false,
  };

  const priceConfig = variant?.config || defaultConfig;

  return {
    priceConfig,
    isLoading,
    trackPriceView: () => {
      trackConversion('price_viewed', 1);
    },
  };
}

/**
 * Get all active experiments for a user
 */
export function getActiveExperiments(): Record<string, any> {
  if (typeof window === 'undefined') return {};

  const experiments: Record<string, any> = {};
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('ab_')) {
      const experimentId = key.replace('ab_', '');
      const value = localStorage.getItem(key);
      if (value) {
        experiments[experimentId] = JSON.parse(value);
      }
    }
  }

  return experiments;
}
