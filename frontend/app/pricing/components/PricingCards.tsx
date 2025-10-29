'use client';

/**
 * Pricing Cards Component
 * 
 * Displays dynamic pricing tiers fetched from the database
 * Highlights popular/recommended plans with badges
 */

import { useState } from 'react';
import Link from 'next/link';

interface PricingTier {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  limits: {
    eventsPerMonth: number;
    ticketsPerEvent: number;
    storageGB: number;
  };
  badge?: string;
  isActive: boolean;
  sortOrder: number;
}

interface PricingCardsProps {
  tiers: PricingTier[];
}

export default function PricingCards({ tiers }: PricingCardsProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  
  if (!tiers || tiers.length === 0) {
    return (
      <div className="text-center text-slate-400 py-12">
        <p>Pricing information is being updated. Please check back soon!</p>
      </div>
    );
  }
  
  return (
    <div>
      {/* Billing Toggle */}
      <div className="flex justify-center mb-12">
        <div className="bg-slate-800/50 rounded-lg p-1 flex">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-md transition-all ${
              billingCycle === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-md transition-all relative ${
              billingCycle === 'yearly'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Yearly
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
              Save 17%
            </span>
          </button>
        </div>
      </div>
      
      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map((tier) => {
          const price = billingCycle === 'monthly' ? tier.priceMonthly : tier.priceYearly / 12;
          const annualPrice = billingCycle === 'yearly' ? tier.priceYearly : tier.priceMonthly * 12;
          const isPopular = tier.badge === 'Popular' || tier.badge === 'Best Value';
          
          return (
            <div
              key={tier.id}
              className={`relative bg-slate-800/50 rounded-xl p-6 border-2 transition-all hover:scale-105 ${
                isPopular
                  ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              {/* Badge */}
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    {tier.badge}
                  </span>
                </div>
              )}
              
              {/* Tier Name */}
              <h3 className="text-2xl font-bold text-white mb-2 mt-2">
                {tier.name}
              </h3>
              
              {/* Description */}
              <p className="text-slate-400 text-sm mb-6">
                {tier.description}
              </p>
              
              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-white">
                    ${price.toFixed(0)}
                  </span>
                  <span className="text-slate-400 ml-2">/month</span>
                </div>
                {billingCycle === 'yearly' && (
                  <p className="text-sm text-slate-400 mt-1">
                    ${annualPrice.toFixed(0)} billed annually
                  </p>
                )}
              </div>
              
              {/* CTA Button */}
              <Link
                href={tier.id === 'free' ? '/create-event' : '/signup'}
                className={`block w-full text-center py-3 rounded-lg font-semibold transition-all mb-6 ${
                  isPopular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                {tier.id === 'free' ? 'Get Started' : 'Start Free Trial'}
              </Link>
              
              {/* Features */}
              <div className="space-y-3">
                <p className="text-xs uppercase text-slate-400 font-semibold">
                  What's included:
                </p>
                <ul className="space-y-2">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm text-slate-300">
                      <svg
                        className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Limits Info */}
              <div className="mt-6 pt-6 border-t border-slate-700">
                <p className="text-xs uppercase text-slate-400 font-semibold mb-2">
                  Usage Limits:
                </p>
                <ul className="text-xs text-slate-400 space-y-1">
                  <li>
                    Events: {tier.limits.eventsPerMonth === -1 ? 'Unlimited' : `${tier.limits.eventsPerMonth}/month`}
                  </li>
                  <li>
                    Tickets: {tier.limits.ticketsPerEvent === -1 ? 'Unlimited' : `${tier.limits.ticketsPerEvent}/event`}
                  </li>
                  <li>
                    Storage: {tier.limits.storageGB === -1 ? 'Unlimited' : `${tier.limits.storageGB}GB`}
                  </li>
                </ul>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Enterprise CTA */}
      <div className="mt-12 text-center">
        <p className="text-slate-300 mb-4">
          Need a custom plan or have questions?
        </p>
        <Link
          href="/contact"
          className="inline-block bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-semibold transition-all"
        >
          Contact Sales
        </Link>
      </div>
    </div>
  );
}
